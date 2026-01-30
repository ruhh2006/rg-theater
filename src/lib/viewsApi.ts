import { supabase } from "./supabase";

const KEY_PREFIX = "rg_last_view_";
const MIN_GAP_MS = 30 * 60 * 1000; // 30 minutes

export async function recordView(contentId: string) {
  if (!contentId) return;

  // prevent spam on same device
  const key = KEY_PREFIX + contentId;
  const last = Number(localStorage.getItem(key) || "0");
  if (Date.now() - last < MIN_GAP_MS) return;
  localStorage.setItem(key, String(Date.now()));

  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id ?? null;

  // authenticated only (if user not logged in, ignore)
  const { error } = await supabase.from("content_views").insert({
    content_id: contentId,
    user_id: userId,
  });

  if (error) {
    // ignore silently (don't break watch)
  }
}

export async function getTrendingIds(days = 7, limit = 10): Promise<string[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("content_views")
    .select("content_id, created_at")
    .gte("created_at", since);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data as any[]) {
    const id = row.content_id;
    counts[id] = (counts[id] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
