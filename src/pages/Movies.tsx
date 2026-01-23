import { useMemo, useState } from "react";
import ContentCard from "../components/ContentCard";
import type { Language } from "../data/catalog";
import { useCatalogDb } from "../lib/catalogDb";

export default function Movies() {
  const { items: catalog, loading, error } = useCatalogDb();
  const [lang, setLang] = useState<Language | "All">("All");

  const movies = useMemo(() => {
    return catalog
      .filter((x) => x.type === "movie")
      .filter((x) => (lang === "All" ? true : x.language === lang));
  }, [catalog, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
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

  return (
    <div className="min-h-screen bg-black text-white">
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

      <div className="px-6 pb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {movies.length === 0 ? (
            <div className="text-white/70">No movies found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


