import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalogDb } from "../lib/catalogDb";

export default function NavSearch() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const { items: catalog } = useCatalogDb();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return catalog
      .filter((x) => {
        const hay = `${x.title} ${x.language} ${x.type} ${x.year}`.toLowerCase();
        return hay.includes(query);
      })
      .slice(0, 6);
  }, [catalog, q]);

  const goSearch = () => {
    const query = q.trim();
    if (!query) return;
    nav(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  return (
    <div
      ref={boxRef}
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="flex items-center gap-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2">
        <span className="text-white/50 text-xs">🔍</span>
        <input
          className="bg-transparent outline-none text-sm text-white placeholder:text-white/40 w-44 md:w-56"
          placeholder="Search..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") goSearch();
            if (e.key === "Escape") setOpen(false);
          }}
          onFocus={() => q.trim() && setOpen(true)}
        />
      </div>

      {open && q.trim() && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-black/95 shadow-xl overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-white/60">No results</div>
          ) : (
            <div className="max-h-80 overflow-auto">
              {results.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 transition"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    nav(`/watch/${item.id}`);
                    setOpen(false);
                  }}
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-xs text-white/60">
                    {item.type.toUpperCase()} • {item.language} •{" "}
                    {item.isFree ? "FREE" : "PREMIUM"}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 p-2">
            <button
              className="w-full text-sm bg-white text-black rounded-lg py-2 font-semibold hover:bg-white/90"
              onMouseDown={(e) => e.preventDefault()}
              onClick={goSearch}
            >
              View all results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

