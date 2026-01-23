import type { ContentItem } from "../data/catalog";
import { catalog as seedCatalog } from "../data/catalog";

const KEY = "rg_theater_catalog";

export function getCatalog(): ContentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedCatalog;
    const parsed = JSON.parse(raw) as ContentItem[];
    return Array.isArray(parsed) ? parsed : seedCatalog;
  } catch {
    return seedCatalog;
  }
}

export function saveCatalog(items: ContentItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function resetCatalog() {
  localStorage.removeItem(KEY);
}

export function addItem(item: ContentItem) {
  const current = getCatalog();
  saveCatalog([item, ...current]);
}
