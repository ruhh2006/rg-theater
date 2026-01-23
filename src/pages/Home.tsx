import { Link } from "react-router-dom";
import { getCatalog } from "../lib/catalogStore";
import ContentCard from "../components/ContentCard";

export default function Home() {
  const catalog = getCatalog();

  const featured = catalog[0];
  const trending = catalog.slice(0, 6);
  const free = catalog.filter((x) => x.isFree);
  const movies = catalog.filter((x) => x.type === "movie");
  const series = catalog.filter((x) => x.type === "series");
  const anime = catalog.filter((x) => x.type === "anime");

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
              {featured ? featured.title : "RG Theater"}
            </h1>

            <p className="mt-4 text-white/70">
              Watch blockbuster movies, binge-worthy series and top anime.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                to={featured ? `/watch/${featured.id}` : "/movies"}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-white/90"
              >
                ▶ Play
              </Link>
              <Link
                to="/pricing"
                className="bg-white/10 px-6 py-3 rounded-lg font-semibold hover:bg-white/20"
              >
                More Info
              </Link>
            </div>
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

function Row({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof getCatalog>;
}) {
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
