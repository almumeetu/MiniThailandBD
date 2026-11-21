"use client";

import { type Campaign, API_BASE_URL, resolveImageUrl } from "./admin-api";

export const CAMPAIGNS_STORAGE_KEY = "minithailandbd_campaigns_v4";
export const CAMPAIGNS_UPDATED_EVENT = "minithailandbd_campaigns_updated";

/**
 * Universal normalizer: ensures all campaign titles, descriptions, badges, and CTAs
 * are rendered in 100% natural, high-converting English even if fetched from legacy/backend Bengali data.
 */
export function normalizeCampaignToEnglish(campaign: Campaign): Campaign {
  if (!campaign) return campaign;

  let title = campaign.title?.trim() || "";
  let description = campaign.description?.trim() || "";
  let badge = campaign.badge?.trim();
  let ctaText = campaign.ctaText?.trim();

  // 1. Skincare & Luxury Original Perfumes
  if (
    title.includes("স্কিন কেয়ার") ||
    title.includes("পারফিউম") ||
    description.includes("কোরিয়ান সিরাম") ||
    description.includes("সুগন্ধি") ||
    description.includes("আতর") ||
    description.includes("ফেসওয়াশ")
  ) {
    title = "Skincare & Luxury Original Perfumes";
    description =
      "Special discounts on authentic Korean serums, gentle face washes, and Arabian attar & luxury perfumes.";
    badge = "Beauty & Fragrance";
    ctaText = "Discover Beauty";
  }
  // 2. Smart Gadgets & Digital Electronics
  else if (
    title.includes("স্মার্ট গ্যাজেট") ||
    title.includes("ইলেকট্রনিক্স") ||
    description.includes("হেডফোন") ||
    description.includes("স্মার্টওয়াচ") ||
    description.includes("টেক")
  ) {
    title = "Smart Gadgets & Digital Electronics";
    description =
      "Up to 40% off premium headphones, smartwatches, wireless speakers, and modern tech accessories.";
    badge = "Digital Electronics";
    ctaText = "Shop Tech Deals";
  }
  // 3. Premium Baby Care & Kids Fashion
  else if (
    title.includes("বেবি কেয়ার") ||
    title.includes("কিডস") ||
    description.includes("শিশুদের") ||
    description.includes("ডায়াপার") ||
    description.includes("পোশাক")
  ) {
    title = "Premium Baby Care & Kids Fashion";
    description =
      "Gentle skincare for little ones, safe diapers, nutritious essentials, and comfortable children's clothing.";
    badge = "Baby & Kids";
    ctaText = "Shop Kids Care";
  }
  // 4. Welcome to MiniThailandBD / Everyday Essentials
  else if (
    title.includes("স্বাগতম") ||
    title.includes("MiniThailandBD-এ") ||
    description.includes("বিশ্বস্ত উৎসের") ||
    description.includes("অথেনটিক পণ্য") ||
    description.includes("ক্যাশ অন ডেলিভারি")
  ) {
    title = "Everyday Essentials, All in One Place";
    description =
      "Trusted quality, honest pricing, and fast delivery nationwide across Bangladesh — everything you need at MiniThailandBD.";
    badge = "Everyday Essentials";
    ctaText = "Explore Products";
  }
  // 5. Catch any other residual Bengali text
  else if (/[\u0980-\u09FF]/.test(title) || /[\u0980-\u09FF]/.test(description)) {
    title = "Exclusive Campaign Deals";
    description =
      "Discover handpicked deals, verified authentic quality, and fast nationwide delivery at MiniThailandBD.";
    badge = badge || "Special Offer";
    ctaText = ctaText || "Explore Deals";
  }

  return {
    ...campaign,
    title,
    description,
    badge: badge || "Special Offer",
    ctaText: ctaText || "Explore Products",
  };
}

/**
 * Built-in default hero campaigns matching MiniThailandBD's high-converting,
 * multi-category store (Groceries, Electronics, Skincare, Perfumes, Baby products).
 */
export const DEFAULT_HERO_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-hero-1",
    title: "নতুন কর্ড সেট কালেকশন এসেছে",
    description: "থাইল্যান্ড থেকে আনা প্রিমিয়াম কর্ড সেট — সফট ফেব্রিক, স্টাইলিশ ডিজাইন। সীমিত স্টক, এখনই অর্ডার করুন।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "New Arrival",
    ctaText: "Shop Now",
    linkUrl: "/products",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-1", images: ["/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-2",
    title: "থাই ফ্যাশন — বিশেষ ছাড়",
    description: "MiniThailandBD-এর এক্সক্লুসিভ ফ্যাশন কালেকশনে ২০% পর্যন্ত ছাড়। কর্ড ড্রেস, টপস, লাইফস্টাইল পণ্য।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Special Offer",
    ctaText: "দেখুন",
    linkUrl: "/products",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-2", images: ["/products/cords set/910465086_1119291994063529_6730173952863950097_n.jpg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-3",
    title: "প্রিমিয়াম কর্ড ড্রেস কালেকশন",
    description: "ঈদ ও পার্টির জন্য পারফেক্ট — এম্ব্রয়ডারি করা থাই কর্ড ড্রেস। লাইটওয়েট ও আরামদায়ক ফেব্রিক।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Eid Collection",
    ctaText: "অর্ডার করুন",
    linkUrl: "/products",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-3", images: ["/products/cords set/913180013_1120115427314519_7306115019982798276_n.jpg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-4",
    title: "MiniThailandBD — Fashion Store",
    description: "Bangladesh's most loved Thai fashion destination. Authentic cord sets, dresses & lifestyle products. Fast delivery nationwide.",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: false,
    badge: "Trending",
    ctaText: "Explore All",
    linkUrl: "/products",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-4", images: ["/products/cords set/916496639_2050418568951611_3231227725146044425_n.jpeg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-5",
    title: "সামার কালেকশন ২০২৫",
    description: "গরমের মৌসুমে আরামদায়ক ও ফ্যাশনেবল থাই পোশাক। মিন্ট, পিচ, লেভেন্ডার — সব রঙে পাওয়া যাচ্ছে।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Summer 2025",
    ctaText: "Shop Collection",
    linkUrl: "/products",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-5", images: ["/products/cords set/907179635_1119377164055012_4690738175147170981_n.jpg"] }],
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
    localStorage.removeItem("minithailandbd_campaigns_v1");
    localStorage.removeItem("minithailandbd_campaigns_v2");
    localStorage.removeItem("minithailandbd_campaigns_v3");

    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeCampaignToEnglish);
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
    // API is offline — handled by stored/fallback campaigns
  }

  const stored = getStoredCampaigns().filter((c) => c.status === "active");

  // Merge unique campaigns (API campaigns take precedence)
  const map = new Map<string, Campaign>();
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
