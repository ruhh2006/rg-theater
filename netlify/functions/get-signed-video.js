const fetch = require("node-fetch");

function isActive(sub) {
  if (!sub) return false;
  if (!sub.active) return false;
  return Date.now() < new Date(sub.expires_at).getTime();
}

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: "Missing auth token" }) };
    }

    const { contentId } = JSON.parse(event.body || "{}");
    if (!contentId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing contentId" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const ANON = process.env.SUPABASE_ANON_KEY; // add in Netlify env
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1) Verify user from token
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: ANON },
    });
    if (!userRes.ok) {
      return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };
    }
    const user = await userRes.json();

    // 2) Fetch content row (service role)
    const contentRes = await fetch(
      `${SUPABASE_URL}/rest/v1/content?id=eq.${contentId}&select=*`,
      {
        headers: {
          Authorization: `Bearer ${SERVICE}`,
          apikey: SERVICE,
        },
      }
    );
    const rows = await contentRes.json();
    const row = rows?.[0];
    if (!row) return { statusCode: 404, body: JSON.stringify({ error: "Content not found" }) };

    // 3) If premium -> check subscription
    const isPremium = !row.is_free;
    if (isPremium) {
      const subRes = await fetch(
        `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user.id}&select=*`,
        {
          headers: {
            Authorization: `Bearer ${SERVICE}`,
            apikey: SERVICE,
          },
        }
      );
      const subs = await subRes.json();
      const sub = subs?.[0] || null;

      if (!isActive(sub)) {
        return { statusCode: 403, body: JSON.stringify({ error: "Subscription inactive" }) };
      }
    }

    // 4) Create signed URL for private video
    if (!row.video_path) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing video_path" }) };
    }

    const signedRes = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/videos/${row.video_path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE}`,
        apikey: SERVICE,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    });

    const signed = await signedRes.json();
    if (!signedRes.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: signed }) };
    }

    // signed.signedURL is path; make full URL
    const signedUrl = `${SUPABASE_URL}${signed.signedURL}`;

    return { statusCode: 200, body: JSON.stringify({ signedUrl }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Server error" }) };
  }
};
