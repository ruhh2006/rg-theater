import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { getPublicVideoSignedUrl } from "@/lib/signedUrl"

type WatchVideo = {
  id: string
  title: string
  description: string | null
  thumbnail_url: string
  creator_id: string
  created_at: string
}

type CreatorMini = {
  id: string
  display_name: string
  avatar_url: string | null
}

type RelatedVideo = {
  id: string
  title: string
  thumbnail_url: string
}

export default function WatchPage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [video, setVideo] = useState<WatchVideo | null>(null)
  const [creator, setCreator] = useState<CreatorMini | null>(null)
  const [related, setRelated] = useState<RelatedVideo[]>([])
  const [playUrl, setPlayUrl] = useState("")
  const [err, setErr] = useState("")

  useEffect(() => {
    if (!id) return
    load(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function load(videoId: string) {
    setLoading(true)
    setErr("")
    setPlayUrl("")
    setVideo(null)
    setCreator(null)
    setRelated([])

    // 1) Public video fetch
    const { data: v, error: vErr } = await supabase
      .from("videos")
      .select("id, title, description, thumbnail_url, creator_id, created_at")
      .eq("id", videoId)
      .eq("visibility", "public")
      .single()

    if (vErr || !v) {
      setErr("Video not found")
      setLoading(false)
      return
    }
    setVideo(v)

    // 2) Creator info
    const { data: c } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", v.creator_id)
      .eq("role", "creator")
      .single()

    setCreator(c || null)

    // 3) Secure signed URL via Netlify function
    try {
      const url = await getPublicVideoSignedUrl(v.id)
      setPlayUrl(url)
    } catch (e: any) {
      setErr(e?.message || "Could not load video stream")
    }

    // 4) Related videos (same creator)
    const { data: rel } = await supabase
      .from("videos")
      .select("id, title, thumbnail_url")
      .eq("creator_id", v.creator_id)
      .eq("visibility", "public")
      .neq("id", v.id)
      .order("created_at", { ascending: false })
      .limit(18)

    setRelated(rel || [])
    setLoading(false)
  }

  if (loading) return <div className="p-10 bg-black text-white min-h-screen">Loading...</div>
  if (err) return <div className="p-10 bg-black text-white min-h-screen">{err}</div>
  if (!video) return <div className="p-10 bg-black text-white min-h-screen">Video not found</div>

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 md:px-10 pt-8">
        {/* Player */}
        <div className="w-full rounded-xl overflow-hidden bg-neutral-900 shadow-lg">
          {playUrl ? (
            <video
              controls
              autoPlay
              playsInline
              className="w-full aspect-video"
              poster={video.thumbnail_url}
              src={playUrl}
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center text-gray-400">
              Loading stream...
            </div>
          )}
        </div>

        {/* Title + creator */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{video.title}</h1>
            {video.description && <p className="text-gray-400 mt-2 max-w-3xl">{video.description}</p>}
          </div>

          {creator && (
            <Link to={`/c/${creator.id}`} className="flex items-center gap-3 hover:opacity-90">
              <img
                src={creator.avatar_url || "/avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-sm">
                <div className="font-semibold">{creator.display_name}</div>
                <div className="text-gray-400">Creator</div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Related */}
      <div className="px-6 md:px-10 pb-10 mt-10">
        <h2 className="text-xl font-semibold mb-4">More from this creator</h2>

        {related.length === 0 ? (
          <p className="text-gray-400">No more public videos</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((v) => (
              <Link key={v.id} to={`/watch/${v.id}`} className="group">
                <div className="aspect-video rounded-lg overflow-hidden bg-neutral-900 shadow">
                  <img
                    src={v.thumbnail_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-200 line-clamp-2">{v.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
