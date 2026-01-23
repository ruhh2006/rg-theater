import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ContentCard from "../components/ContentCard";
import { getCatalog } from "../lib/catalogStore";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const qParam = params.get("q") ?? "";
  const [q, setQ] = useState(qParam);

  const catalog = getCatalog();

  const results = useMemo(() => {
    const query = qParam.trim().toLowerCase();
    if (!query) return [];
    return catalog.filter((x) => {
      const hay = `${x.title} ${x.language} ${x.type} ${x.year}`.toLowerCase();
      return hay.includes(query);
    });
  }, [catalog, qParam]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = q.trim();
    setParams(next ? { q: next } : {});
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold">Search</h1>

        <form onSubmit={onSubmit} className="mt-4 flex gap-2 max-w-xl">
          <input
            className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm outline-none"
            placeholder="Search movies, series, anime..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-white/90">
            Search
          </button>
        </form>

        <p className="mt-3 text-sm text-white/60">
          {qParam ? `Results for: "${qParam}"` : "Type something to search."}
        </p>
      </div>

      <div className="px-6 pb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {qParam && results.length === 0 ? (
            <div className="text-white/70">No results found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
