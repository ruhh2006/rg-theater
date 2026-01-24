import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Row = {
  id: string;
  title: string;
  type: "movie" | "series" | "anime";
  language: "Hindi" | "English" | "Japanese";
  year: number;
  is_free: boolean;
  quality: "1080p" | "4K";
  thumbnail: string;
  video_url?: string | null;
  creator_id?: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
};

export default function AdminContent() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setItems(data as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    const { error } = await supabase
      .from("content")
      .update({ status: "approved", rejection_reason: null })
      .eq("id", id);

    if (error) return alert("❌ " + error.message);
    await load();
  };

  const reject = async (id: string) => {
    const reason = prompt("Reject reason (creator will see this):");
    if (!reason || !reason.trim()) return alert("Reason required!");

    const { error } = await supabase
      .from("content")
      .update({ status: "rejected", rejection_reason: reason.trim() })
      .eq("id", id);

    if (error) return alert("❌ " + error.message);
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading pending uploads...
      </div>
    );
  }

  const pending = items.filter((x) => x.status === "pending");

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Admin: Approve Uploads</h1>
      <p className="mt-2 text-white/70 text-sm">
        Approve or reject creator uploads (with reason).
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        {pending.length === 0 ? (
          <div className="text-white/70">No pending uploads.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((x) => (
              <div
                key={x.id}
                className="flex items-center justify-between gap-4 border border-white/10 rounded-xl bg-black/30 p-4"
              >
                <div>
                  <div className="font-semibold">{x.title}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {x.type.toUpperCase()} • {x.language} • {x.year} • {x.quality} •{" "}
                    {x.is_free ? "FREE" : "PREMIUM"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approve(x.id)}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(x.id)}
                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Reject + Reason
                  </button>
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
