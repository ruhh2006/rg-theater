import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import Row from "@/components/Row"
import VideoCard from "@/components/VideoCard"
import CreatorCard from "@/components/CreatorCard"
import { fetchCategories, fetchCategoryVideos, Category, CategoryRowVideo } from "@/lib/categories"

type Video = { id: string; title: string; thumbnail_url: string; creator_id: string; created_at: string }
type Creator = { id: string; display_name: string; avatar_url: string | null; created_at: string }

type CategoryRow = {
  category: Category
  videos: CategoryRowVideo[]
}

export default function HomePage() {
  const navigate = useNavigate()
  const [latestVideos, setLatestVideos] = useState<Video[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [hero, setHero] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState("")
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([])
  const [catLoading, setCatLoading] = useState(true)

  const heroBg = useMemo(() => hero?.thumbnail_url || "", [hero])

  useEffect(() => {
    loadHome()
    loadCategoryRows()
  }, [])

  async function loadHome() {
    setLoading(true)

    // Latest videos (public)
    const { data: v } = await supabase
      .from("videos")
      .select("id, title, thumbnail_url, creator_id, created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(24)

    const vids = v || []
    setLatestVideos(vids)
    setHero(vids[0] || null)

    // Creators list
    const { data: c } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, created_at")
      .eq("role", "creator")
      .order("created_at", { ascending: false })
      .limit(18)

    setCreators((c as any) || [])
    setLoading(false)
  }

  async function loadCategoryRows() {
    setCatLoading(true)

    const cats = await fetchCategories(12)

    // Fetch each category videos (parallel)
    const rows = await Promise.all(
      cats.map(async (cat) => {
        const vids = await fetchCategoryVideos(cat.id, 18)
        return { category: cat, videos: vids }
      })
    )

    // Keep only categories with videos
    setCategoryRows(rows.filter((r) => r.videos.length > 0))
    setCatLoading(false)
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = q.trim()
    if (!text) return
    navigate(`/search?q=${encodeURIComponent(text)}`)
  }

  if (loading) return <div className="p-10 bg-black text-white min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-white/5">
        <div className="px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          <div className="font-bold text-lg">RG Theater</div>

          <form onSubmit={onSearchSubmit} className="w-full max-w-xl">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search creators or videos..."
              className="w-full h-10 rounded-full bg-neutral-900 border border-white/10
                         px-4 text-sm outline-none focus:border-white/30"
            />
          </form>

          <button
            onClick={() => navigate("/creators")}
            className="hidden md:inline-flex h-10 px-4 rounded-full bg-white text-black font-semibold text-sm"
          >
            Creators
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative">
        <div
          className="h-[52vh] md:h-[60vh] bg-neutral-900"
          style={{
            backgroundImage: heroBg ? `url(${heroBg})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-10">
          <div className="max-w-3xl">
            <p className="text-gray-300 text-sm mb-2">Featured</p>
            <h1 className="text-2xl md:text-4xl font-extrabold">
              {hero ? hero.title : "Welcome to RG Theater"}
            </h1>

            <div className="mt-5 flex gap-3">
              {hero && (
                <button
                  onClick={() => navigate(`/watch/${hero.id}`)}
                  className="h-11 px-6 rounded-full bg-white text-black font-bold"
                >
                  Play
                </button>
              )}
              <button
                onClick={() => navigate("/creators")}
                className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/15 border border-white/15"
              >
                Browse Creators
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rows */}
      <Row title="Latest Releases">
        {latestVideos.map((v) => (
          <VideoCard key={v.id} id={v.id} title={v.title} thumbnail_url={v.thumbnail_url} />
        ))}
      </Row>

      <Row title="Popular Creators" seeAllHref="/creators">
        {creators.map((c) => (
          <CreatorCard key={c.id} id={c.id} display_name={c.display_name} avatar_url={c.avatar_url} />
        ))}
      </Row>

      {/* Category Rows */}
      {catLoading ? (
        <div className="px-6 md:px-10 mt-10 text-gray-400">Loading categories...</div>
      ) : (
        categoryRows.map((row) => (
          <Row key={row.category.id} title={row.category.name}>
            {row.videos.map((v) => (
              <VideoCard key={v.id} id={v.id} title={v.title} thumbnail_url={v.thumbnail_url} />
            ))}
          </Row>
        ))
      )}

      <div className="h-14" />
    </div>
  )
}
