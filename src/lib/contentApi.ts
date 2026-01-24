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
  video_path?: string | null; // ✅ NEW
  creator_id?: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
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
    videoUrl: row.video_url ?? undefined,       // ✅ fallback
    videoPath: row.video_path ?? undefined,     // ✅ secure path
  };
}

export async function fetchApprovedContent(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as DbContentRow[]).map(dbToContentItem);
}

export async function fetchMyUploads(): Promise<DbContentRow[]> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbContentRow[];
}

export async function insertContent(payload: any) {
  const { error } = await supabase.from("content").insert(payload);
  if (error) throw error;
}

export async function resubmitRejectedUpload(id: string, updates: Partial<DbContentRow>) {
  const { error } = await supabase
    .from("content")
    .update({
      ...updates,
      status: "pending",
      rejection_reason: null,
    })
    .eq("id", id);

  if (error) throw error;
}
