import { useEffect, useState } from "react";
import type { ContentItem } from "../data/catalog";
import { fetchApprovedContent } from "./contentApi";

export function useCatalogDb() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const reload = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchApprovedContent(); // ✅ only approved
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load content");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return { items, loading, error, reload };
}

