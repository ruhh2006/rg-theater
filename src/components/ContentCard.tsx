import { Link } from "react-router-dom";
import type { ContentItem } from "../data/catalog";

export default function ContentCard({ item }: { item: ContentItem }) {
  return (
    <Link
      to={`/watch/${item.id}`}
      className="group no-underline text-white block transform transition duration-300 hover:scale-[1.05]"
    >
      <div
        className="
          rounded-xl overflow-hidden 
          border border-white/10 
          bg-white/5 
          hover:bg-white/10 
          hover:border-red-500/40 
          transition 
          shadow-md 
          group-hover:shadow-red-500/20
        "
      >
        {/* POSTER */}
        <div className="relative h-40 sm:h-44 bg-gradient-to-br from-white/10 to-black overflow-hidden">
          {/* Placeholder / poster text */}
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">
            Poster
          </div>

          {/* hover dark overlay */}
          <div
            className="
              absolute inset-0 
              opacity-0 
              group-hover:opacity-100 
              bg-gradient-to-t 
              from-black/80 
              via-black/30 
              to-transparent 
              transition
            "
          />

          {/* Quality badge */}
          <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-black/60 border border-white/10">
            {item.quality}
          </div>

          {/* Free / Premium badge */}
          <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-black/60 border border-white/10">
            {item.isFree ? (
              <span className="text-green-400">FREE</span>
            ) : (
              <span className="text-yellow-400">PREMIUM</span>
            )}
          </div>
        </div>

        {/* TEXT INFO */}
        <div className="p-3">
          <div className="text-sm font-semibold leading-snug line-clamp-2">
            {item.title}
          </div>

          <div className="mt-1 text-xs text-white/60">
            {item.language} • {item.year}
          </div>
        </div>
      </div>
    </Link>
  );
}




