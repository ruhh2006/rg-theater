import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type CreatorPublic = {
  id: string;
  display_name: string;
  bio: string | null;
  portfolio_url: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function Creators() {
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<CreatorPublic[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("creator_public")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setCreators([]);
    } else {
      setCreators((data ?? []) as CreatorPublic[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading creators...
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="mt-2 text-white/70">{err}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Creators</h1>
      <p className="mt-2 text-white/70 text-sm">
        Discover creators and their approved web series, short films, and anime.
      </p>

      {creators.length === 0 ? (
        <div className="mt-8 text-white/70">No creators yet.</div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((c) => (
            <Link
              key={c.id}
              to={`/c/${c.id}`} // ✅ UUID only (NO "creator_" prefix)
              className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-bold">
                  {(c.display_name || "C").slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.display_name}</div>
                  <div className="text-xs text-white/60 truncate">
                    {c.portfolio_url ?? "No portfolio link"}
                  </div>
                </div>
              </div>

              {c.bio && (
                <div className="mt-3 text-sm text-white/70 line-clamp-3">
                  {c.bio}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={load}
        className="mt-8 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm"
      >
        Refresh
      </button>
    </div>
  );
}
