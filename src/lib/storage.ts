import { supabase } from "./supabase";

export async function uploadFileToBucket(params: {
  bucket: "posters" | "videos";
  file: File;
  path: string; // e.g. "userId/filename.mp4"
}) {
  const { bucket, file, path } = params;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
