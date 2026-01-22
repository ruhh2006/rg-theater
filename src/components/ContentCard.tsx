import { Link } from "react-router-dom";
import type { ContentItem } from "../data/catalog";

export default function ContentCard({ item }: { item: ContentItem }) {
  return (
    <Link to={`/watch/${item.id}`} className="group no-underline text-white block">
      <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition">
        {/* Poster */}
        <div className="relative h-40 sm:h-44 bg-gradient-to-br from-white/10 to-white/0">
          <img
            src={item.thumbnail || "/posters/poster1.jpg"}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* top badges */}
          <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-black/60 border border-white/10">
            {item.quality}
          </div>

          <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-black/60 border border-white/10">
            {item.isFree ? (
              <span className="text-green-400">FREE</span>
            ) : (
              <span className="text-yellow-400">PREMIUM</span>
            )}
          </div>

          {/* lock overlay */}
          {!item.isFree && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="px-3 py-2 rounded-lg border border-white/20 bg-black/60 text-sm font-semibold">
                🔒 Premium
              </div>
            </div>
          )}

          {/* hover effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/20" />
        </div>

        {/* Text */}
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



