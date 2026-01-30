import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"

type Creator = {
  id: string
  display_name: string
  avatar_url: string | null
}

export default function CreatorsListPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCreators()
  }, [])

  async function loadCreators() {
    setLoading(true)
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("role", "creator")
      .order("created_at", { ascending: false })

    setCreators(data || [])
    setLoading(false)
  }

  if (loading) return <div className="p-10 bg-black text-white min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Creators</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {creators.map((creator) => (
          <Link key={creator.id} to={`/c/${creator.id}`} className="group">
            <div className="aspect-square rounded-xl bg-neutral-900 overflow-hidden shadow">
              <img
                src={creator.avatar_url || "/avatar.png"}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-200">{creator.display_name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
