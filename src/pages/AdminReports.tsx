import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Rep = {
  id: string;
  content_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Rep[]>([]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRows(data as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string) => {
    const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", id);
    if (error) return alert("❌ " + error.message);
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Admin: Reports</h1>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <div className="text-white/70">No reports.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="border border-white/10 bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="font-semibold">{r.reason}</div>
                <div className="text-xs text-white/60">
                  {r.status} • {r.created_at.slice(0, 10)}
                </div>
              </div>

              <div className="mt-2 text-sm text-white/70">
                Content ID: <span className="text-white">{r.content_id}</span>
              </div>
              {r.details && <div className="mt-2 text-sm text-white/70">{r.details}</div>}

              {r.status !== "resolved" && (
                <button
                  onClick={() => resolve(r.id)}
                  className="mt-3 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
