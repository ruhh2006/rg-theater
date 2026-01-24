import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { isCreator } from "../lib/roles";
import { fetchMyUploads, resubmitRejectedUpload, type DbContentRow } from "../lib/contentApi";

export default function Resubmit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<DbContentRow[]>([]);
  const [saving, setSaving] = useState(false);

  // form fields
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [quality, setQuality] = useState<"1080p" | "4K">("1080p");
  const [isFree, setIsFree] = useState(true);

  useEffect(() => {
    isCreator().then(setAllowed);
  }, []);

  useEffect(() => {
    if (allowed !== true) return;

    (async () => {
      setLoading(true);
      const rows = await fetchMyUploads();
      setUploads(rows);
      setLoading(false);
    })();
  }, [allowed]);

  const item = useMemo(() => uploads.find((x) => x.id === id), [uploads, id]);

  useEffect(() => {
    if (!item) return;

    // only allow editing rejected items
    setTitle(item.title);
    setThumbnail(item.thumbnail || "/posters/poster1.jpg");
    setVideoUrl(item.video_url || "");
    setYear(item.year);
    setQuality(item.quality);
    setIsFree(item.is_free);
  }, [item]);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking creator access...
      </div>
    );
  }
  if (!allowed) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Upload not found</h1>
      </div>
    );
  }

  if (item.status !== "rejected") {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">This upload is not rejected</h1>
        <p className="mt-2 text-white/70">Only rejected uploads can be resubmitted.</p>
      </div>
    );
  }

  const submit = async () => {
    if (!title.trim()) return alert("Enter title");
    if (!thumbnail.trim()) return alert("Enter thumbnail");
    if (!videoUrl.trim()) return alert("Enter video URL");

    setSaving(true);
    try {
      await resubmitRejectedUpload(item.id, {
        title: title.trim(),
        thumbnail: thumbnail.trim(),
        video_url: videoUrl.trim(),
        year,
        quality,
        is_free: isFree,
      } as any);

      alert("✅ Resubmitted! Status is now Pending.");
      nav("/creator");
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Edit & Re-Submit</h1>
      <p className="mt-2 text-white/70 text-sm">
        Update your rejected upload and send again for admin review.
      </p>

      <div className="mt-8 max-w-3xl border border-white/10 bg-white/5 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-white/60">Title</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60">Year</label>
            <input
              type="number"
              className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Quality</label>
            <select
              className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
            >
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
          Free content
        </label>

        <div>
          <label className="text-xs text-white/60">Thumbnail URL</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Video URL</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <button
          disabled={saving}
          onClick={submit}
          className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Submitting..." : "Re-Submit for Review"}
        </button>
      </div>
    </div>
  );
}
