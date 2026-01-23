import { supabase } from "./supabase";

export type Plan = "monthly" | "yearly";

export type SubscriptionRow = {
  user_id: string;
  plan: Plan;
  active: boolean;
  started_at: string;
  expires_at: string;
  updated_at: string;
};

export async function getMySubscription(): Promise<SubscriptionRow | null> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data as SubscriptionRow | null;
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Demo activate: writes subscription into DB
 * monthly = 30 days, yearly = 365 days
 */
export async function activateMySubscription(plan: Plan) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) throw new Error("Not logged in");

  const expires_at = plan === "monthly" ? addDaysISO(30) : addDaysISO(365);

  const payload = {
    user_id: user.id,
    plan,
    active: true,
    expires_at,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

export async function cancelMySubscription() {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) throw new Error("Not logged in");

  const { error } = await supabase
    .from("subscriptions")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) throw error;
}

/**
 * True if subscription is active and not expired.
 */
export function isSubscriptionActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  if (!sub.active) return false;
  const exp = new Date(sub.expires_at).getTime();
  return Date.now() < exp;
}
