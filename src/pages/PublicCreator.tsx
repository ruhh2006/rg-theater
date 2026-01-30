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
  language: string;
  year: number;
  quality: string;
  isFree?: boolean;
  is_free?: boolean;
  thumbnail?: string;
  creator_id?: string;
  status?: string;
  video_url?: string | null;
  video_path?: string | null;
};

export default function PublicCreator() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<CreatorPublic | null>(null);
  const [items, setItems] = useState<ContentRow[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setErr("");

    // 1) load public creator
    const cRes = await supabase.from("creator_public").select("*").eq("id", id).single();
    if (cRes.error) {
      setErr(cRes.error.message);
      setCreator(null);
      setLoading(false);
      return;
    }
    setCreator(cRes.data as CreatorPublic);

    // 2) load approved content by that creator
    const vRes = await supabase
      .from("content")
      .select("*")
      .eq("creator_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (vRes.error) setErr(vRes.error.message);
    setItems((vRes.data as ContentRow[]) ?? []);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const counts = useMemo(() => {
    const movies = items.filter((x) => x.type === "movie").length;
    const series = items.filter((x) => x.type === "series").length;
    const anime = items.filter((x) => x.type === "anime").length;
    return { movies, series, anime, total: items.length };
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading creator...
      </div>
    );
  }

  if (err && !creator) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Creator not found</h1>
        <p className="mt-2 text-white/70">{err}</p>
        <Link to="/creators" className="inline-block mt-4 underline text-white/70 hover:text-white">
          Back to Creators
        </Link>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/creators" className="text-white/70 hover:text-white">
          ← Back
        </Link>
        {creator.portfolio_url && (
          <a
            href={creator.portfolio_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline text-white/70 hover:text-white"
          >
            Portfolio
          </a>
        )}
      </div>

      <div className="px-6 py-8">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-16 w-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-2xl font-extrabold">
            {creator.display_name?.slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold">{creator.display_name}</h1>
            {creator.bio && <p className="mt-2 text-white/70 max-w-3xl">{creator.bio}</p>}

            <div className="mt-4 flex gap-2 flex-wrap text-xs">
              <Badge label={`Total: ${counts.total}`} />
              <Badge label={`Movies: ${counts.movies}`} />
              <Badge label={`Series: ${counts.series}`} />
              <Badge label={`Anime: ${counts.anime}`} />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold">Approved uploads</h2>

          {items.length === 0 ? (
            <div className="mt-4 text-white/70">No approved content yet.</div>
          ) : (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((it) => (
                <div key={it.id}>
                  <ContentCard item={normalizeItem(it)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

// because some files use isFree vs is_free
function normalizeItem(x: any) {
  return {
    ...x,
    isFree: x.isFree ?? x.is_free ?? false,
    thumbnail: x.thumbnail ?? x.poster ?? x.image ?? x.thumbnail,
    videoPath: x.videoPath ?? x.video_path ?? null,
    videoUrl: x.videoUrl ?? x.video_url ?? null,
  };
}
