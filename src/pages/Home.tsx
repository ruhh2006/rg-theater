import { Link } from "react-router-dom";
import { catalog } from "../data/catalog";
import ContentRow from "../components/ContentRow";

export default function Home() {
  const free = catalog.filter((x) => x.isFree);
  const movies = catalog.filter((x) => x.type === "movie");
  const series = catalog.filter((x) => x.type === "series");
  const anime = catalog.filter((x) => x.type === "anime");

  const featured = catalog[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative px-6 pt-10 pb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="relative max-w-2xl">
          <p className="text-xs text-white/60">Featured</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight">
            {featured?.title || "RG Theater"}
          </h1>
          <p className="mt-3 text-white/70">
            Hindi • English • Japanese — free titles + premium content. Watch in 1080p and 4K.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              to={`/watch/${featured?.id ?? "m1"}`}
              className="bg-white text-black px-5 py-3 rounded font-semibold hover:bg-white/90"
            >
              ▶ Play
            </Link>

            <Link
              to="/pricing"
              className="bg-white/10 px-5 py-3 rounded font-semibold hover:bg-white/15"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="px-6 pb-12 space-y-10">
        <ContentRow title="Free to Watch" items={free} />
        <ContentRow title="Movies" items={movies} />
        <ContentRow title="Web Series" items={series} />
        <ContentRow title="Anime" items={anime} />
      </div>
    </div>
  );
}
