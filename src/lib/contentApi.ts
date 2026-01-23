import { supabase } from "./supabase";
import type { ContentItem } from "../data/catalog";

export type DbContentRow = {
  id: string;
  title: string;
  type: "movie" | "series" | "anime";
  language: "Hindi" | "English" | "Japanese";
  year: number;
  is_free: boolean;
  quality: "1080p" | "4K";
  thumbnail: string;
  video_url?: string | null;
  created_at: string;
};

export function dbToContentItem(row: DbContentRow): ContentItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    language: row.language,
    year: row.year,
    isFree: row.is_free,
    quality: row.quality,
    thumbnail: row.thumbnail,
    videoUrl: row.video_url ?? undefined,
  };
}

export async function fetchContent(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as DbContentRow[];
  return rows.map(dbToContentItem);
}

export async function insertContent(payload: {
  title: string;
  type: "movie" | "series" | "anime";
  language: "Hindi" | "English" | "Japanese";
  year: number;
  is_free: boolean;
  quality: "1080p" | "4K";
  thumbnail: string;
  video_url?: string | null;
}) {
  const { error } = await supabase.from("content").insert(payload);
  if (error) throw error;
}

