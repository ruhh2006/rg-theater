import { useState } from "react";
import { insertContent } from "../lib/contentApi";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"movie"|"series"|"anime">("movie");
  const [language, setLanguage] = useState<"Hindi"|"English"|"Japanese">("Hindi");
  const [year, setYear] = useState(2024);
  const [isFree, setIsFree] = useState(true);
  const [quality, setQuality] = useState<"1080p"|"4K">("1080p");
  const [thumbnail, setThumbnail] = useState("/posters/poster1.jpg");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const onAdd = async () => {
    if (!title.trim()) return alert("Enter title");

    setLoading(true);
    try {
      await insertContent({
        title: title.trim(),
        type,
        language,
        year,
        is_free: isFree,
        quality,
        thumbnail,
        video_url: videoUrl.trim() ? videoUrl.trim() : null,
      });

      alert("✅ Added to Supabase!");
      setTitle("");
      setVideoUrl("");
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Admin Panel</h1>
      <p className="mt-2 text-white/70 text-sm">
        Add content to Supabase. Only admin role can do this.
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
            <label className="text-xs text-white/60">Type</label>
            <select
              className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
              <option value="anime">Anime</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/60">Language</label>
            <select
              className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
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
          <label className="text-xs text-white/60">Thumbnail</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Video URL (optional)</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <button
          onClick={onAdd}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold"
        >
          {loading ? "Adding..." : "Add Content"}
        </button>
      </div>
    </div>
  );
}

