"use client";

import { type Campaign, API_BASE_URL, resolveImageUrl } from "./admin-api";

export const CAMPAIGNS_STORAGE_KEY = "minithailandbd_campaigns_v27";
export const CAMPAIGNS_UPDATED_EVENT = "minithailandbd_campaigns_updated";

/**
 * Universal normalizer: ensures all campaign titles, descriptions, badges, and CTAs
 * are rendered in 100% natural, high-converting English even if fetched from legacy/backend Bengali data.
 */
export function normalizeCampaignToEnglish(campaign: Campaign): Campaign {
  if (!campaign) return campaign;

  let title = campaign.title?.trim() || "";
  let description = campaign.description?.trim() || "";
  let ctaText = campaign.ctaText?.trim();

  const hasBengali = /[\u0980-\u09FF]/.test(title) || /[\u0980-\u09FF]/.test(description);

  if (hasBengali) {
    // 1. Cord Set Collection
    if (
      title.includes("কর্ড") ||
      description.includes("কর্ড সেট") ||
      title.toLowerCase().includes("cord")
    ) {
      title = "Exclusive Thai Cord Sets Collection";
      description =
        "Premium imported 2-piece cord sets from Bangkok — lightweight, ultra-soft fabric and modern stylish silhouettes.";
      ctaText = "Shop Cord Sets";
    }
    // 2. Velvet & Party Gowns
    else if (
      title.includes("ভেলভেট") ||
      title.includes("গাউন") ||
      description.includes("পার্টি") ||
      title.toLowerCase().includes("velvet") ||
      title.toLowerCase().includes("gown")
    ) {
      title = "Luxury Velvet & Festive Party Gowns";
      description =
        "Royal flared gowns, intricate embroidery and opulent velvet dresses crafted for special weddings and evening celebrations.";
      ctaText = "Explore Gowns";
    }
    // 3. Abayas & Modest Fashion
    else if (
      title.includes("আবায়া") ||
      title.includes("বোরকা") ||
      description.includes("হিজাব") ||
      title.toLowerCase().includes("abaya")
    ) {
      title = "Dubai Style Luxury Abaya & Modest Wear";
      description =
        "Sophisticated front-open shrug abayas, embroidered borka sets, and matching luxury georgette hijabs.";
      ctaText = "View Abayas";
    }
    // 4. Winter Collection
    else if (
      title.includes("উইন্টার") ||
      title.includes("শীতকালীন") ||
      description.includes("কোট") ||
      title.toLowerCase().includes("winter")
    ) {
      title = "Winter Velvet & Cozy Chic Fashion Edit";
      description =
        "Statement animal-print long coats, textured velvet jackets, and warm stylish fleece co-ords.";
      ctaText = "Shop Winter Wear";
    }
    // 5. Welcome to Mini Thailand
    else if (
      title.includes("স্বাগতম") ||
      title.includes("MiniThailand") ||
      title.includes("ফ্যাশন")
    ) {
      title = "Mini Thailand — Premier Boutique Fashion";
      description =
        "Discover authentic imported Thai fashion, cord dresses, festive sets, and modest wear with Cash on Delivery nationwide.";
      ctaText = "Explore Collection";
    }
    // 6. Catch any other residual Bengali text
    else {
      title = "Exclusive Boutique Fashion Deals";
      description =
        "Handpicked imported Thai collections, superior fabric quality, and fast 2-3 day delivery across Bangladesh.";
      ctaText = ctaText || "Shop Now";
    }
  }

  return {
    ...campaign,
    title,
    description,
    badge: "",
    ctaText: ctaText || campaign.ctaText || "Shop Now",
  };
}

/**
 * Built-in default hero campaigns matching MiniThailandBD's high-converting,
 * curated boutique slides.
 */
export const DEFAULT_HERO_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-arch-maroon",
    title: "Imperial Maroon & Velvet Grandeur",
    description: "Opulent festive tones, rich tactile textures & majestic silhouettes designed to turn every entrance into a moment.",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Imperial Edit",
    ctaText: "SHOP MAROON EDIT",
    linkUrl: "/products?category=Party%20Gowns",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Slider Banner", position: 1, page: "home" },
    images: [{ id: "img-arch-maroon", images: ["/images/sliders/arch-maroon.webp"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-arch-blue",
    title: "Royal Sapphire & Evening Drapes",
    description: "Statement flowing gowns, luminous silk-touch fabrics & hand-finished Bangkok atelier details for regal celebrations.",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Sapphire Edit",
    ctaText: "DISCOVER SAPPHIRE",
    linkUrl: "/products?category=Party%20Gowns",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Slider Banner", position: 2, page: "home" },
    images: [{ id: "img-arch-blue", images: ["/images/sliders/arch-blue.webp"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-arch-purple",
    title: "Regal Violet & Silk Co-ord Sets",
    description: "Exquisite Thai coordinates, bespoke drapery & sophisticated contemporary styles imported directly from Bangkok.",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Silk Collection",
    ctaText: "EXPLORE CO-ORD SETS",
    linkUrl: "/products?category=Cord%20Sets",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Slider Banner", position: 3, page: "home" },
    images: [{ id: "img-arch-purple", images: ["/images/sliders/arch-purple.webp"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-arch-wine",
    title: "Signature Burgundy & Wine Luxury",
    description: "Deep vintage wine hues, fluid evening contours & signature Bangkok atelier designs curated exclusively for you.",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Atelier Signature",
    ctaText: "SHOP WINE COLLECTION",
    linkUrl: "/products?category=Party%20Gowns",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Slider Banner", position: 4, page: "home" },
    images: [{ id: "img-arch-wine", images: ["/images/sliders/arch-wine.webp"] }],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Reads campaigns saved in localStorage, or falls back to default hero campaigns.
 */
export function getStoredCampaigns(): Campaign[] {
  if (typeof window === "undefined") {
    return DEFAULT_HERO_CAMPAIGNS;
  }

  try {
    // Clean up older cached storage keys if present
    for (let i = 1; i <= 26; i++) {
      localStorage.removeItem(`minithailandbd_campaigns_v${i}`);
    }

    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((c: Campaign) => {
            const img = c.images?.[0]?.images?.[0] || "";
            return (
              !img.includes("arch-black") &&
              !img.includes("arch-red") &&
              !img.includes("minit-3") &&
              c.id !== "camp-arch-black" &&
              c.id !== "camp-arch-red" &&
              c.id !== "camp-hero-2" &&
              !c.title?.toLowerCase().includes("midnight noir") &&
              !c.title?.toLowerCase().includes("black edition") &&
              !c.title?.toLowerCase().includes("scarlet") &&
              !c.title?.toLowerCase().includes("luxury velvet & evening")
            );
          })
          .map(normalizeCampaignToEnglish);
      }
    }
  } catch (err) {
    console.error("Error reading stored campaigns:", err);
  }

  // Initialize with default campaigns if none found
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(DEFAULT_HERO_CAMPAIGNS));
  } catch {}

  return DEFAULT_HERO_CAMPAIGNS;
}

/**
 * Saves campaigns to localStorage and broadcasts an update event.
 */
export function saveStoredCampaigns(campaigns: Campaign[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    window.dispatchEvent(new CustomEvent(CAMPAIGNS_UPDATED_EVENT, { detail: campaigns }));
  } catch (err) {
    console.error("Error saving campaigns:", err);
  }
}

/**
 * Adds or updates a campaign in the store.
 */
export function saveCustomCampaign(campaign: Campaign): void {
  const current = getStoredCampaigns();
  const index = current.findIndex((c) => c.id === campaign.id);

  let updated: Campaign[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...current[index], ...campaign, updatedAt: new Date().toISOString() };
  } else {
    updated = [campaign, ...current];
  }

  saveStoredCampaigns(updated);
}

/**
 * Toggles a campaign's status (active / inactive).
 */
export function toggleStoredCampaignStatus(id: string): void {
  const current = getStoredCampaigns();
  const updated = current.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        status: (c.status === "active" ? "inactive" : "active") as "active" | "inactive",
        updatedAt: new Date().toISOString(),
      };
    }
    return c;
  });

  saveStoredCampaigns(updated);
}

/**
 * Deletes a campaign from local storage.
 */
export function deleteStoredCampaign(id: string): void {
  const current = getStoredCampaigns();
  const updated = current.filter((c) => c.id !== id);
  saveStoredCampaigns(updated);
}

/**
 * Fetches active hero campaigns by querying the backend API first,
 * falling back to or merging with localStorage campaigns.
 */
export async function fetchActiveHeroCampaigns(): Promise<Campaign[]> {
  let apiCampaigns: Campaign[] = [];

  const isHeroCampaign = (c: Campaign) => {
    const rawImg = c.images?.[0]?.images?.[0] || "";
    const isExcluded =
      rawImg.includes("arch-black") ||
      rawImg.includes("arch-red") ||
      rawImg.includes("minit-3") ||
      c.id === "camp-arch-black" ||
      c.id === "camp-arch-red" ||
      c.id === "camp-hero-2" ||
      c.title?.toLowerCase().includes("midnight noir") ||
      c.title?.toLowerCase().includes("black edition") ||
      c.title?.toLowerCase().includes("scarlet") ||
      c.title?.toLowerCase().includes("luxury velvet & evening");

    return (
      !isExcluded &&
      c.status === "active" &&
      (!c.sectionId || c.sectionId === "sec-hero" || c.id.startsWith("camp-hero-") || c.id.startsWith("camp-arch-"))
    );
  };

  try {
    const res = await fetch(`${API_BASE_URL}/campaigns`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        apiCampaigns = data.filter(isHeroCampaign);
      }
    }
  } catch {
    // API is offline — handled by stored/fallback campaigns
  }

  const stored = getStoredCampaigns().filter(isHeroCampaign);

  // Merge unique campaigns: start with DEFAULT_HERO_CAMPAIGNS so new sliders are always included
  const map = new Map<string, Campaign>();
  for (const c of DEFAULT_HERO_CAMPAIGNS) {
    map.set(c.id, c);
  }
  for (const c of stored) {
    map.set(c.id, c);
  }
  for (const c of apiCampaigns) {
    map.set(c.id, c);
  }

  const result = Array.from(map.values()).map(normalizeCampaignToEnglish);

  // If no active campaigns found, return default hero campaigns
  return result.length > 0 ? result : DEFAULT_HERO_CAMPAIGNS;
}

/**
 * Fetches all active campaigns across API and stored campaigns
 */
export async function fetchAllActiveCampaigns(): Promise<Campaign[]> {
  let apiCampaigns: Campaign[] = [];

  try {
    const res = await fetch(`${API_BASE_URL}/campaigns`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        apiCampaigns = data.filter((c) => c.status === "active");
      }
    }
  } catch {
    // API is offline
  }

  const stored = getStoredCampaigns().filter((c) => c.status === "active");
  const map = new Map<string, Campaign>();
  for (const c of stored) map.set(c.id, c);
  for (const c of apiCampaigns) map.set(c.id, c);

  return Array.from(map.values()).map(normalizeCampaignToEnglish);
}

/**
 * Fetches an active campaign assigned to a specific banner slot/section.
 * Slot IDs:
 * - "sec-feature-banner": Full-width Feature Campaign Banner
 * - "sec-split-1": Left Column Split Banner
 * - "sec-split-2": Right Column Split Banner
 */
export async function fetchCampaignForSlot(slotId: string): Promise<Campaign | null> {
  try {
    const campaigns = await fetchAllActiveCampaigns();
    const match = campaigns.find((c) => {
      const sectionId = c.sectionId || c.section?.id || "";
      const sectionTitle = (c.section?.title || "").toLowerCase();

      if (sectionId === slotId) return true;

      if (slotId === "sec-feature-banner") {
        return (
          sectionId === "sec-feature-banner" ||
          sectionId === "sec-banner" ||
          sectionTitle.includes("feature") ||
          sectionTitle.includes("full-width")
        );
      }

      if (slotId === "sec-split-1") {
        return (
          sectionId === "sec-split-1" ||
          sectionId === "sec-split-left" ||
          sectionTitle.includes("split banner 1") ||
          sectionTitle.includes("split 1") ||
          sectionTitle.includes("left")
        );
      }

      if (slotId === "sec-split-2") {
        return (
          sectionId === "sec-split-2" ||
          sectionId === "sec-split-right" ||
          sectionTitle.includes("split banner 2") ||
          sectionTitle.includes("split 2") ||
          sectionTitle.includes("right")
        );
      }

      return false;
    });

    return match || null;
  } catch (err) {
    console.warn(`Failed to fetch campaign for slot ${slotId}:`, err);
    return null;
  }
}

