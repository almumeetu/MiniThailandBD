"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/admin-api";

export type Section = {
  id: string;
  title: string;
  position: number;
  page: string;
};

export const DEFAULT_CAMPAIGN_SECTIONS: Section[] = [
  { id: "sec-hero", title: "Hero Slider Banners", position: 1, page: "home" },
  { id: "sec-feature-banner", title: "Feature Banner (Full-Width)", position: 2, page: "home" },
  { id: "sec-split-1", title: "Split Banner 1 - Left (e.g. Silver Statement)", position: 3, page: "home" },
  { id: "sec-split-2", title: "Split Banner 2 - Right (e.g. Festive Edit)", position: 4, page: "home" },
  { id: "sec-trend", title: "Trending / Collection Banner", position: 5, page: "home" },
];

export function useSections() {
  const [sections, setSections] = useState<Section[]>(DEFAULT_CAMPAIGN_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSections() {
    setIsLoading(true);
    try {
      const data = await apiRequest<Section[]>("/campaigns/sections");
      if (Array.isArray(data) && data.length > 0) {
        setSections(data);
      } else {
        setSections(DEFAULT_CAMPAIGN_SECTIONS);
      }
    } catch {
      setSections(DEFAULT_CAMPAIGN_SECTIONS);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSections();
  }, []);

  return { sections, isLoading, error, loadSections };
}
