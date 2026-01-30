import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useDebounce } from "@/components/useDebounce"
import VideoCard from "@/components/VideoCard"
import CreatorCard from "@/components/CreatorCard"

type Video = { id: string; title: string; thumbnail_url: string }
type Creator = { id: string; display_name: string; avatar_url: string | null }

export default function SearchPage() {
  const [sp, setSp] = useSearchParams()
  const initial = sp.get("q") || ""
  const [q, setQ] = useState(initial)

  const dq = useDebounce(q.trim(), 350)

  const [videos, setVideos] = useState<Video[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(false)

  const hasQuery = useMemo(() => dq.length > 0, [dq])

  useEffect(() => {
    setSp((prev) => {
      const n = new URLSearchParams(prev)
      if (q.trim()) n.set("q", q.trim())
      else n.delete("q")
      return n
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  useEffect(() => {
    if (!hasQuery) {
      setVideos([])
      setCreators([])
      return
    }
    runSearch(dq)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq])

  async function runSearch(text: string) {
    setLoading(true)

    const [vRes, cRes] = await Promise.all([
      supabase
        .from("videos")
        .select("id, title, thumbnail_url")
        .eq("visibility", "public")
        .ilike("title", `%${text}%`)
        .order("created_at", { ascending: false })
        .limit(30),

      supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("role", "creator")
        .ilike("display_name", `%${text}%`)
        .order("created_at", { ascending: false })
        .limit(24),
    ])

    setVideos((vRes.data as any) || [])
    setCreators((cRes.data as any) || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-white/5">
        <div className="px-6 md:px-10 h-16 flex items-center gap-4">
          <Link to="/" className="font-bold">
            RG Theater
          </Link>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search creators or videos..."
            className="w-full max-w-2xl h-10 rounded-full bg-neutral-900 border border-white/10
                       px-4 text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div className="px-6 md:px-10 py-8">
        {!q.trim() && (
          <div className="text-gray-400">Type something to search.</div>
        )}

        {loading && (
          <div className="text-gray-400">Searching...</div>
        )}

        {!loading && q.trim() && creators.length === 0 && videos.length === 0 && (
          <div className="text-gray-400">No results found.</div>
        )}

        {creators.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Creators</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {creators.map((c) => (
                <CreatorCard key={c.id} id={c.id} display_name={c.display_name} avatar_url={c.avatar_url} />
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Videos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {videos.map((v) => (
                <VideoCard key={v.id} id={v.id} title={v.title} thumbnail_url={v.thumbnail_url} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
