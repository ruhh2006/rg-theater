import ContentCard from "./ContentCard";
import type { ContentItem } from "../data/catalog";

export default function ContentRow({
  title,
  items,
}: {
  title: string;
  items: ContentItem[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <div key={item.id} className="min-w-[170px] sm:min-w-[190px]">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
