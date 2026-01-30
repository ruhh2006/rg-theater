import { supabase } from "@/lib/supabase"

export type Category = {
  id: string
  name: string
  slug: string
}

export type CategoryRowVideo = {
  id: string
  title: string
  thumbnail_url: string
}

export async function fetchCategories(limit = 12): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true })
    .limit(limit)

  if (error) return []
  return (data as any) || []
}

export async function fetchCategoryVideos(categoryId: string, limit = 18): Promise<CategoryRowVideo[]> {
  // ✅ Join query: video_categories -> videos
  const { data, error } = await supabase
    .from("video_categories")
    .select(`
      video_id,
      videos:videos!inner (
        id, title, thumbnail_url, visibility, created_at
      )
    `)
    .eq("category_id", categoryId)
    .eq("videos.visibility", "public")
    .order("created_at", { ascending: false, referencedTable: "videos" })
    .limit(limit)

  if (error || !data) return []

  // Flatten
  const out: CategoryRowVideo[] = []
  for (const row of data as any[]) {
    const v = row.videos
    if (!v) continue
    out.push({ id: v.id, title: v.title, thumbnail_url: v.thumbnail_url })
  }
  return out
}
