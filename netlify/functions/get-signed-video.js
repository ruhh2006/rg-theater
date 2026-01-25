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

    // Verify user token
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: ANON },
    });
    if (!userRes.ok) return json(401, { error: "Invalid token" });
    const user = await userRes.json();

    // Fetch content row (service role)
    const contentRes = await fetch(
      `${SUPABASE_URL}/rest/v1/content?id=eq.${contentId}&select=*`,
      { headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE } }
    );
    const rows = await contentRes.json();
    const row = rows?.[0];
    if (!row) return json(404, { error: "Content not found" });

    // Premium check
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

    const rawPath = normalizePath(row.video_path);
    if (!rawPath) return json(400, { error: "Missing video_path" });

    // HEAD check
    const headRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/videos/${encodeURI(rawPath)}`,
      {
        method: "HEAD",
        headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE },
      }
    );

    if (!headRes.ok) {
      return json(404, {
        error: "Video file not found in storage for this video_path",
        rawPath,
      });
    }

    // Sign URL
    const signRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/videos/${encodeURI(rawPath)}`,
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

    const signText = await signRes.text();
    let signJson = {};
    try {
      signJson = signText ? JSON.parse(signText) : {};
    } catch {
      signJson = { raw: signText };
    }

    if (!signRes.ok) {
      return json(500, { error: "Failed to sign video", rawPath, details: signJson });
    }

    // ✅ FIX: signedURL usually starts with "/object/sign/..."
    // We must prefix "/storage/v1"
    const signedPath = signJson.signedURL || "";
    const signedUrl = signedPath.startsWith("/storage/v1")
      ? `${SUPABASE_URL}${signedPath}`
      : `${SUPABASE_URL}/storage/v1${signedPath}`;

    return json(200, { signedUrl, rawPath });
  } catch (e) {
    return json(500, { error: e.message || "Server error" });
  }
};

