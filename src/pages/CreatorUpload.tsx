import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { isCreator } from "../lib/roles";
import { uploadFileToBucket } from "../lib/storage";

const MAX_VIDEO_MB = 50; // ✅ Supabase-safe limit

export default function CreatorUpload() {
  const nav = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"movie" | "series" | "anime">("series");
  const [language, setLanguage] = useState<"Hindi" | "English" | "Japanese">("Hindi");
  const [year, setYear] = useState<number>(2024);
  const [isFree, setIsFree] = useState(true);
  const [quality, setQuality] = useState<"1080p" | "4K">("1080p");

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // Legal / rights confirmation
  const TERMS_VERSION = "v1";
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  useEffect(() => {
    isCreator().then(setAllowed);
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Checking creator access...
      </div>
    );
  }

  if (!allowed) return <Navigate to="/" replace />;

  const submit = async () => {
    if (!title.trim()) return alert("Enter title");
    if (!posterFile) return alert("Select a poster image file");
    if (!videoFile) return alert("Select a video file");
    if (!rightsConfirmed)
      return alert("You must confirm you own the rights before uploading.");

    // ✅ 50MB enforcement (matches Supabase)
    if (videoFile.size > MAX_VIDEO_MB * 1024 * 1024) {
      return alert(
        `Video size exceeds ${MAX_VIDEO_MB} MB.\n\nTip: Compress to 1080p (H.264) using HandBrake.`
      );
    }

    setLoading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        alert("Please login again");
        nav("/login");
        return;
      }

      // Upload poster (PUBLIC bucket)
      const posterPath = `${user.id}/${Date.now()}-${posterFile.name}`;
      const posterUrl = await uploadFileToBucket({
        bucket: "posters",
        file: posterFile,
        path: posterPath,
      });

      // Upload video (PRIVATE bucket)
      const videoPath = `${user.id}/${Date.now()}-${videoFile.name}`;
      await uploadFileToBucket({
        bucket: "videos",
        file: videoFile,
        path: videoPath,
      });

      // Insert pending content
      const { error } = await supabase.from("content").insert({
        title: title.trim(),
        type,
        language,
        year,
        is_free: isFree,
        quality,
        thumbnail: posterUrl,
        video_url: null,
        video_path: videoPath,
        creator_id: user.id,
        status: "pending",
        rights_confirmed: true,
        creator_terms_version: TERMS_VERSION,
      });

      if (error) throw error;

      alert("✅ Uploaded! Status: Pending approval");
      nav("/creator");
    } catch (e: any) {
      alert("❌ " + (e.message ?? "Upload failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Upload Content</h1>
      <p className="mt-2 text-white/70 text-sm">
        Your upload will be reviewed by admin before publishing.
      </p>

      <div className="mt-8 max-w-3xl border border-white/10 bg-white/5 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-white/60">Title</label>
          <input
            className="mt-1 w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
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
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
          Free content
        </label>

        <div>
          <label className="text-xs text-white/60">
            Poster Image (jpg/png)
          </label>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-white/70"
            onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <label className="text-xs text-white/60">
            Video File (mp4) — Max {MAX_VIDEO_MB} MB
          </label>
          <input
            type="file"
            accept="video/*"
            className="mt-2 block w-full text-sm text-white/70"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Compression tips */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
          <div className="font-semibold mb-1">Compression Tips (Recommended)</div>
          <ul className="list-disc ml-4 space-y-1">
            <li>Use <b>HandBrake</b> (free)</li>
            <li>Preset: <b>Fast 1080p30</b></li>
            <li>Format: <b>MP4</b>, Codec: <b>H.264</b></li>
            <li>Avg bitrate: <b>1500–2500 kbps</b></li>
            <li>Audio: <b>AAC 128 kbps</b></li>
          </ul>
        </div>

        <div className="mt-2 border border-white/10 rounded-xl bg-black/30 p-4">
          <div className="text-sm font-semibold">Creator Upload Rules</div>
          <ul className="mt-2 text-xs text-white/70 space-y-1">
            <li>• I confirm this content is ORIGINAL or I have legal streaming rights.</li>
            <li>• I will not upload pirated movies/series/anime.</li>
            <li>• RG Theater may remove content if it violates copyright.</li>
          </ul>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(e) => setRightsConfirmed(e.target.checked)}
            />
            I own the rights and agree to these rules (v1)
          </label>
        </div>

        <button
          disabled={loading}
          onClick={submit}
          className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Submit for Review"}
        </button>
      </div>
    </div>
  );
}


