import { Handler } from "@netlify/functions"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const VIDEO_BUCKET = process.env.SUPABASE_VIDEO_BUCKET || "videos"

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

export const handler: Handler = async (event) => {
  try {
    const videoId = event.queryStringParameters?.videoId
    if (!videoId) {
      return { statusCode: 400, body: JSON.stringify({ error: "videoId required" }) }
    }

    // ✅ ONLY public videos allowed
    const { data: video, error } = await admin
      .from("videos")
      .select("id, video_path, visibility")
      .eq("id", videoId)
      .single()

    if (error || !video) {
      return { statusCode: 404, body: JSON.stringify({ error: "Video not found" }) }
    }

    if (video.visibility !== "public") {
      return { statusCode: 403, body: JSON.stringify({ error: "Not allowed" }) }
    }

    if (!video.video_path) {
      return { statusCode: 400, body: JSON.stringify({ error: "video_path missing" }) }
    }

    const { data: signed, error: signErr } = await admin.storage
      .from(VIDEO_BUCKET)
      .createSignedUrl(video.video_path, 60 * 10) // 10 min

    if (signErr || !signed?.signedUrl) {
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to sign URL" }) }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ url: signed.signedUrl }),
    }
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || "Server error" }) }
  }
}
