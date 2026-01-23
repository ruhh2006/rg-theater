import { supabase } from "./supabase";

/**
 * Returns true if logged-in user has role = 'admin'
 */
export async function isAdmin(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data) return false;

  return data.role === "admin";
}
