import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Creator = {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

type Video = {
  id: string
  title: string
  thumbnail_url: string
}

export default function CreatorPublicPage() {
  const { id } = useParams<{ id: string }>()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadCreator(id)
  }, [id])

  async function loadCreator(creatorId: string) {
    setLoading(true)

    const { data: creatorData, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio")
      .eq("id", creatorId)
      .eq("role", "creator")
      .single()

    if (error || !creatorData) {
      setCreator(null)
      setLoading(false)
      return
    }

    setCreator(creatorData)

    const { data: videoData } = await supabase
      .from("videos")
      .select("id, title, thumbnail_url")
      .eq("creator_id", creatorId)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })

    setVideos(videoData || [])
    setLoading(false)
  }

  if (loading) return <div className="p-10 bg-black text-white min-h-screen">Loading...</div>
  if (!creator) return <div className="p-10 bg-black text-white min-h-screen">Creator not found</div>

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-6 p-10">
        <img
          src={creator.avatar_url || "/avatar.png"}
          className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">{creator.display_name}</h1>
          {creator.bio && <p className="text-gray-400 mt-2 max-w-2xl">{creator.bio}</p>}
        </div>
      </div>

      {/* Videos */}
      <div className="px-10 pb-10">
        <h2 className="text-xl font-semibold mb-4">Videos</h2>

        {videos.length === 0 ? (
          <p className="text-gray-400">No public videos yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {videos.map((video) => (
              <Link key={video.id} to={`/watch/${video.id}`} className="group">
                <div className="aspect-video bg-neutral-900 rounded-lg overflow-hidden shadow">
                  <img
                    src={video.thumbnail_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-200 line-clamp-2">{video.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
