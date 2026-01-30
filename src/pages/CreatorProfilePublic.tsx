import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ContentCard from "../components/ContentCard";

type CreatorPublic = {
  id: string;
  display_name: string;
  bio: string | null;
  portfolio_url: string | null;
  avatar_url: string | null;
  created_at: string;
};

type ContentRow = {
  id: string;
  title: string;
  type: "movie" | "series" | "anime";
  language: "Hindi" | "English" | "Japanese";
  year: number;
  is_free: boolean;
  quality: "1080p" | "4K";
  thumbnail: string;
  video_url?: string | null;
  video_path?: string | null;
  creator_id?: string | null;
  status: string;
  rejection_reason?: string | null;
};

function cleanUuid(raw: string | undefined) {
  if (!raw) return "";
  return raw.startsWith("creator_") ? raw.replace("creator_", "") : raw;
}

function toContentCardItem(x: ContentRow) {
  return {
    id: x.id,
    title: x.title,
    type: x.type,
    language: x.language,
    year: x.year,
    isFree: x.is_free,
    quality: x.quality,
    thumbnail: x.thumbnail,
    videoUrl: x.video_url ?? undefined,
    videoPath: x.video_path ?? undefined,
    creator_id: x.creator_id,
  };
}

export default function CreatorProfilePublic() {
  const params = useParams();
  const id = cleanUuid(params.id);

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<CreatorPublic | null>(null);
  const [items, setItems] = useState<ContentRow[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");

    // ✅ If id is not UUID, show friendly error
    if (!id || id.length < 30) {
      setErr("Invalid creator id.");
      setLoading(false);
      return;
    }

    // 1) Creator public data
    const cRes = await supabase
      .from("creator_public")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (cRes.error) {
      setErr(cRes.error.message);
      setCreator(null);
      setItems([]);
      setLoading(false);
      return;
    }

    if (!cRes.data) {
      setErr("Creator not found.");
      setCreator(null);
      setItems([]);
      setLoading(false);
      return;
    }

    setCreator(cRes.data as CreatorPublic);

    // 2) Approved content by creator
    const vRes = await supabase
      .from("content")
      .select("*")
      .eq("creator_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (vRes.error) {
      setErr(vRes.error.message);
      setItems([]);
    } else {
      setItems((vRes.data ?? []) as ContentRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const counts = useMemo(() => {
    return {
      total: items.length,
      movies: items.filter((x) => x.type === "movie").length,
      series: items.filter((x) => x.type === "series").length,
      anime: items.filter((x) => x.type === "anime").length,
    };
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading creator...
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Creator not found</h1>
        <p className="mt-2 text-white/70">{err}</p>
        <Link to="/creators" className="mt-4 inline-block underline text-white/70 hover:text-white">
          Back to Creators
        </Link>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Link to="/creators" className="text-white/70 hover:text-white underline text-sm">
        ← Back to Creators
      </Link>

      <div className="mt-4 border border-white/10 bg-white/5 rounded-2xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-16 w-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-2xl font-extrabold">
            {(creator.display_name || "C").slice(0, 1).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold">{creator.display_name}</h1>
            <p className="mt-2 text-white/70">{creator.bio ?? "No bio yet."}</p>

            <div className="mt-4 flex gap-2 flex-wrap text-xs">
              <Badge label={`Total: ${counts.total}`} />
              <Badge label={`Movies: ${counts.movies}`} />
              <Badge label={`Series: ${counts.series}`} />
              <Badge label={`Anime: ${counts.anime}`} />
            </div>

            <div className="mt-4 flex gap-3 flex-wrap text-sm">
              {creator.portfolio_url && (
                <a
                  href={creator.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-white/80 hover:text-white"
                >
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-bold">Approved uploads</h2>

      {items.length === 0 ? (
        <div className="mt-4 text-white/70">No approved uploads yet.</div>
      ) : (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <ContentCard key={it.id} item={toContentCardItem(it)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
      {label}
    </span>
  );
}
