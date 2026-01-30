import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ContentCard from "../components/ContentCard";
import { useCatalogDb } from "../lib/catalogDb";
import { getTrendingIds } from "../lib/viewsApi";

export default function Home() {
  const { items: catalog, loading, error } = useCatalogDb();
  const [trending, setTrending] = useState<any[]>([]);

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
        <h1 className="text-2xl font-bold">Error loading content</h1>
        <p className="mt-2 text-white/70">{error}</p>
      </div>
    );
  }

  if (catalog.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-extrabold">RG Theater</h1>
        <p className="mt-2 text-white/70">India’s creator-first OTT platform.</p>
        <p className="mt-4 text-white/60">
          No content yet. Creators can start uploading today.
        </p>

        <div className="mt-6 flex gap-4">
          <Link
            to="/apply-creator"
            className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded font-semibold"
          >
            Become a Creator
          </Link>

          <Link
            to="/login"
            className="border border-white/20 px-6 py-3 rounded font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const featured = catalog[0];
  const free = catalog.filter((x: any) => x.isFree);
  const movies = catalog.filter((x: any) => x.type === "movie");
  const series = catalog.filter((x: any) => x.type === "series");
  const anime = catalog.filter((x: any) => x.type === "anime");

  // ✅ Step-9: compute real trending from last 7 days
  useEffect(() => {
    (async () => {
      try {
        const ids = await getTrendingIds(7, 10);

        if (!ids.length) {
          setTrending(catalog.slice(0, 10));
          return;
        }

        const map = new Map(catalog.map((x: any) => [x.id, x]));
        const items = ids.map((id) => map.get(id)).filter(Boolean) as any[];

        // fill remaining slots if trending less
        const fill = catalog
          .filter((x: any) => !ids.includes(x.id))
          .slice(0, Math.max(0, 10 - items.length));

        setTrending([...items, ...fill]);
      } catch {
        setTrending(catalog.slice(0, 10));
      }
    })();
  }, [catalog]);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* HERO */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/60 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_60%)]" />
        </div>

        <div className="relative z-10 h-full flex items-center px-6 md:px-16">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              RG Theater
            </h1>

            <p className="mt-4 text-lg text-white/80">
              India’s Creator-First OTT Platform
            </p>

            <p className="mt-2 text-white/60">
              Watch original anime, indie web series, and short films created by independent creators.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                to={`/watch/${featured.id}`}
                className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold"
              >
                ▶ Explore Content
              </Link>

              <Link
                to="/apply-creator"
                className="bg-white/10 px-6 py-3 rounded-lg font-semibold hover:bg-white/20"
              >
                Become a Creator
              </Link>
            </div>

            <p className="mt-6 text-xs text-white/50">
              Built by a student-led creator community ❤️
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* ROWS */}
      <div className="-mt-20 space-y-10 px-6 pb-10 relative z-20">
        <Row title="🔥 Trending Now" items={trending} />
        <Row title="🆓 Free to Watch" items={free} />
        <Row title="🎬 Movies" items={movies} />
        <Row title="📺 Series" items={series} />
        <Row title="🔥 Anime" items={anime} />
      </div>
    </div>
  );
}

function Row({ title, items }: { title: string; items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <div key={item.id} className="min-w-[160px] sm:min-w-[180px]">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}


