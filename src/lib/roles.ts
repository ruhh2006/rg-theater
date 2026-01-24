import { supabase } from "./supabase";

export type Role = "user" | "creator" | "admin";

export async function getMyRole(): Promise<Role> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return "user";

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data?.role) return "user";
  return data.role as Role;
}

export async function isAdmin(): Promise<boolean> {
  return (await getMyRole()) === "admin";
}

export async function isCreator(): Promise<boolean> {
  const role = await getMyRole();
  return role === "creator" || role === "admin";
}
