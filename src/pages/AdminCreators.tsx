import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AppRow = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  portfolio_url: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
};

export default function AdminCreators() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<AppRow[]>([]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("creator_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setApps(data as AppRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (row: AppRow) => {
    try {
      // ✅ 1) UPSERT profile role = creator (works even if profile row missing)
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: row.user_id,
            email: row.email,
            role: "creator",
          },
          { onConflict: "id" }
        );

      if (upsertErr) throw new Error("Role update failed: " + upsertErr.message);

      // ✅ 2) Update application status = approved
      const { error: appErr } = await supabase
        .from("creator_applications")
        .update({ status: "approved", rejection_reason: null })
        .eq("id", row.id);

      if (appErr) throw new Error("Application update failed: " + appErr.message);

      alert("✅ Approved! User is now CREATOR.");
      await load();
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Approve failed"));
    }
  };

  const reject = async (row: AppRow) => {
    const reason = prompt("Reject reason (creator will see):");
    if (!reason || !reason.trim()) return alert("Reason required.");

    const { error: appErr } = await supabase
      .from("creator_applications")
      .update({ status: "rejected", rejection_reason: reason.trim() })
      .eq("id", row.id);

    if (appErr) return alert("❌ Reject failed: " + appErr.message);

    alert("Rejected.");
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading creator applications...
      </div>
    );
  }

  const pending = apps.filter((x) => x.status === "pending");

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Admin: Creator Applications</h1>
      <p className="mt-2 text-white/70 text-sm">
        Approve creators (sets role=creator) or reject with reason.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        {pending.length === 0 ? (
          <div className="text-white/70">No pending applications.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((x) => (
              <div
                key={x.id}
                className="border border-white/10 rounded-xl bg-black/30 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold">
                      {x.full_name ?? "No name"}{" "}
                      <span className="text-white/50 text-xs">
                        ({x.email ?? "no email"})
                      </span>
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      Portfolio:{" "}
                      <a
                        className="underline text-white/80"
                        href={x.portfolio_url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {x.portfolio_url ?? "missing"}
                      </a>
                    </div>
                    {x.message && (
                      <div className="mt-2 text-sm text-white/70">
                        {x.message}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(x)}
                      className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(x)}
                      className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={load}
        className="mt-6 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm"
      >
        Refresh
      </button>
    </div>
  );
}
