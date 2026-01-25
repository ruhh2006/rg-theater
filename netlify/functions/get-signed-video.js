const fetch = require("node-fetch");

function json(statusCode, bodyObj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj),
  };
}

function isActive(sub) {
  if (!sub) return false;
  if (!sub.active) return false;
  return Date.now() < new Date(sub.expires_at).getTime();
}

function normalizePath(p) {
  if (!p) return "";
  let path = String(p).trim();
  path = path.replace(/^\/+/, "");
  if (path.startsWith("videos/")) path = path.slice("videos/".length);
  return path;
}

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return json(401, { error: "Missing auth token" });

    let payload = {};
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {}
    const contentId = payload.contentId;
    if (!contentId) return json(400, { error: "Missing contentId" });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const ANON = process.env.SUPABASE_ANON_KEY;
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !ANON || !SERVICE) {
      return json(500, { error: "Missing server env vars" });
    }

    // verify user
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: ANON },
    });
    if (!userRes.ok) return json(401, { error: "Invalid token" });
    const user = await userRes.json();

    // fetch content row (service role)
    const contentRes = await fetch(
      `${SUPABASE_URL}/rest/v1/content?id=eq.${contentId}&select=*`,
      { headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE } }
    );
    const rows = await contentRes.json();
    const row = rows?.[0];
    if (!row) return json(404, { error: "Content not found" });

    // premium check
    const isPremium = !row.is_free;
    if (isPremium) {
      const subRes = await fetch(
        `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user.id}&select=*`,
        { headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE } }
      );
      const subs = await subRes.json();
      const sub = subs?.[0] || null;
      if (!isActive(sub)) return json(403, { error: "Subscription inactive" });
    }

    // sign
    const rawPath = normalizePath(row.video_path);
    if (!rawPath) return json(400, { error: "Missing video_path" });

    // ✅ encodeURI keeps slashes but encodes spaces etc
    const safePath = encodeURI(rawPath);

    const signedRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/videos/${safePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE}`,
          apikey: SERVICE,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 3600 }),
      }
    );

    const signedText = await signedRes.text();
    let signed = {};
    try {
      signed = signedText ? JSON.parse(signedText) : {};
    } catch {
      signed = { raw: signedText };
    }

    if (!signedRes.ok) {
      return json(500, {
        error: "Failed to sign video",
        rawPath,
        details: signed,
      });
    }

    const signedUrl = `${SUPABASE_URL}${signed.signedURL}`;
    return json(200, { signedUrl, rawPath });
  } catch (e) {
    return json(500, { error: e.message || "Server error" });
  }
};


