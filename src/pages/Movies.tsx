import { useMemo, useState } from "react";
import ContentCard from "../components/ContentCard";
import { catalog, type Language } from "../data/catalog";

export default function Movies() {
  const [lang, setLang] = useState<Language | "All">("All");

  const movies = useMemo(() => {
    return catalog
      .filter((x) => x.type === "movie")
      .filter((x) => (lang === "All" ? true : x.language === lang));
  }, [lang]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl md:text-4xl font-extrabold">Movies</h1>

        <select
          className="bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm outline-none"
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
        >
          <option value="All">All Languages</option>
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Japanese">Japanese</option>
        </select>
      </div>

      {/* content */}
      <div className="px-6 pb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

