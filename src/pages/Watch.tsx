import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCatalogDb } from "../lib/catalogDb";
import { supabase } from "../lib/supabase";

export default function Watch() {
  const { id } = useParams();
  const nav = useNavigate();

  const { items: catalog, loading, error } = useCatalogDb();
  const item = useMemo(() => catalog.find((x: any) => x.id === id), [catalog, id]);

  const [videoLoading, setVideoLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [videoErr, setVideoErr] = useState<string>("");
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!item) return;

      setSignedUrl(null);
      setVideoErr("");
      setDebug("");

      // OLD fallback
      if (!item.videoPath && item.videoUrl) {
        setDebug("DEBUG: Using legacy videoUrl (old content).");
        return;
      }

      if (!item.videoPath && !item.videoUrl) {
        setVideoErr("No video available (videoPath/videoUrl missing).");
        return;
      }

      setVideoLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("No session token. Please login again.");

        const res = await fetch("/.netlify/functions/get-signed-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contentId: item.id }),
        });

        const text = await res.text();
        setDebug(`DEBUG: get-signed-video status=${res.status}\nDEBUG: body=${text}`);

        let out: any = {};
        try {
          out = text ? JSON.parse(text) : {};
        } catch {
          out = {};
        }

        if (!res.ok) {
          throw new Error(out?.error ? String(out.error) : "Signed URL request failed");
        }

        if (!out.signedUrl) {
          throw new Error("Signed URL missing in response.");
        }

        setSignedUrl(out.signedUrl);
      } catch (e: any) {
        setVideoErr(e?.message ?? "Video error");
      } finally {
        setVideoLoading(false);
      }
    })();
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading content...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="mt-2 text-white/70">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold">Content not found</h1>
        <Link to="/" className="underline text-white/70 hover:text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => nav(-1)} className="text-white/70 hover:text-white">
          ← Back
        </button>
        <div className="text-sm text-white/70">
          {item.language} • {item.year} • {item.quality}
        </div>
      </div>

      <div className="px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">{item.title}</h1>

        {/* DEBUG PANEL */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70 whitespace-pre-wrap">
          {debug ? debug : "DEBUG: waiting... (open this page after deploy)"}
          {signedUrl && (
            <div className="mt-2">
              Signed URL test:{" "}
              <a
                className="underline text-white"
                href={signedUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open signed url
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <div className="h-[55vh] bg-black">
            {videoLoading ? (
              <div className="h-full flex items-center justify-center text-white/50">
                Loading video...
              </div>
            ) : videoErr ? (
              <div className="h-full flex items-center justify-center text-red-300">
                {videoErr}
              </div>
            ) : signedUrl ? (
              <video
                className="w-full h-full"
                controls
                playsInline
                preload="metadata"
                src={signedUrl}
                onError={() => setVideoErr("Browser failed to load this signed URL video.")}
              />
            ) : item.videoUrl ? (
              <video
                className="w-full h-full"
                controls
                playsInline
                preload="metadata"
                src={item.videoUrl}
                onError={() => setVideoErr("Legacy videoUrl failed to load.")}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-white/50">
                No video available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



