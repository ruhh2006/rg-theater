import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { isCreator } from "../lib/roles";

type CreatorPublic = {
  id: string;
  display_name: string;
  bio: string | null;
  portfolio_url: string | null;
  avatar_url: string | null;
};

export default function CreatorProfile() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    isCreator().then(setAllowed);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("creator_public")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        const row = data as CreatorPublic;
        setDisplayName(row.display_name ?? "Creator");
        setBio(row.bio ?? "");
        setPortfolioUrl(row.portfolio_url ?? "");
        setAvatarUrl(row.avatar_url ?? "");
      } else {
        // if no row exists yet, keep defaults — saving will create it
        setDisplayName("Creator");
        setBio("");
        setPortfolioUrl("");
        setAvatarUrl("");
      }

      setLoading(false);
    })();
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking creator access...
      </div>
    );
  }
  if (!allowed) return <Navigate to="/" replace />;

  const save = async () => {
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) throw new Error("Please login again");

      if (!displayName.trim()) throw new Error("Display name required");

      const { error } = await supabase.from("creator_public").upsert(
        {
          id: user.id,
          display_name: displayName.trim(),
          bio: bio.trim() ? bio.trim() : null,
          portfolio_url: portfolioUrl.trim() ? portfolioUrl.trim() : null,
          avatar_url: avatarUrl.trim() ? avatarUrl.trim() : null,
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      alert("✅ Profile saved! Public page updated.");
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold">Edit Public Creator Profile</h1>
          <p className="mt-2 text-white/70 text-sm">
            Ye info public creators page aur public profile pe show hoga.
          </p>
        </div>

        <Link
          to="/creators"
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm"
        >
          View Creators Page
        </Link>
      </div>

      <div className="mt-8 max-w-3xl border border-white/10 bg-white/5 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-white/60">Display Name</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your creator name"
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Bio</label>
          <textarea
            className="mt-1 w-full min-h-[120px] bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio..."
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Portfolio URL</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="YouTube / Instagram / Drive link"
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Avatar URL (optional)</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <button
          disabled={saving}
          onClick={save}
          className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
