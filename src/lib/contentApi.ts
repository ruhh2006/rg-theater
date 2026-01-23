import { supabase } from "./supabase";

export type DbContent = {
  id: string;
  title: string;
  type: "movie" | "series" | "anime";
  language: "Hindi" | "English" | "Japanese";
  year: number;
  is_free: boolean;
  quality: "1080p" | "4K";
  thumbnail: string;
  video_url?: string | null;
};

export async function fetchContent(): Promise<DbContent[]> {
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertContent(payload: Omit<DbContent, "id">) {
  const { error } = await supabase.from("content").insert(payload);
  if (error) throw error;
}
