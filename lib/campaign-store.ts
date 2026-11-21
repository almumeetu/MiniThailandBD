"use client";

import { type Campaign, API_BASE_URL, resolveImageUrl } from "./admin-api";

export const CAMPAIGNS_STORAGE_KEY = "minithailandbd_campaigns_v5";
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

  // 1. Cord Set Collection
  if (
    title.includes("কর্ড") ||
    description.includes("কর্ড সেট") ||
    title.toLowerCase().includes("cord")
  ) {
    title = "Exclusive Thai Cord Sets Collection";
    description =
      "Premium imported 2-piece cord sets from Bangkok — lightweight, ultra-soft fabric and modern stylish silhouettes.";
    badge = "New Arrival";
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
    badge = "Festive Edit";
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
    badge = "Modest Elegance";
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
    badge = "Winter Collection";
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
    badge = "Boutique Exclusive";
    ctaText = "Explore Collection";
  }
  // 6. Catch any other residual Bengali text
  else if (/[\u0980-\u09FF]/.test(title) || /[\u0980-\u09FF]/.test(description)) {
    title = "Exclusive Boutique Fashion Deals";
    description =
      "Handpicked imported Thai collections, superior fabric quality, and fast 2-3 day delivery across Bangladesh.";
    badge = badge || "Boutique Exclusive";
    ctaText = ctaText || "Shop Now";
  }

  return {
    ...campaign,
    title,
    description,
    badge: badge || "Special Offer",
    ctaText: ctaText || "Explore Collection",
  };
}

/**
 * Built-in default hero campaigns matching MiniThailandBD's high-converting,
 * multi-category store (Groceries, Electronics, Skincare, Perfumes, Baby products).
 */
export const DEFAULT_HERO_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-hero-1",
    title: "Exclusive Thai Cord Sets Collection",
    description: "সরাসরি ব্যাংকক থেকে আনা ১০০% অরিজিনাল সফট প্রিমিয়াম কর্ড সেট — ট্রেন্ডি ডিজাইন ও অতুলনীয় আরাম। সীমিত স্টক, এখনই অর্ডার করুন।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Trending on FB",
    ctaText: "Shop Cord Sets",
    linkUrl: "/products?category=Cord%20Sets",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-1", images: ["/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-2",
    title: "Luxury Velvet & Festive Party Gowns",
    description: "যেকোনো বিয়ে ও পার্টির জন্য সম্পূর্ণ রাজকীয় সাজ — এক্সক্লুসিভ ভেলভেট, এমব্রয়ডারি ও গর্জিয়াস টিয়ার্ড গাউন।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Festive Edit",
    ctaText: "Explore Gowns",
    linkUrl: "/products?category=Party%20Gowns",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-2", images: ["/products/cords set/907179635_1119377164055012_4690738175147170981_n.jpg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-3",
    title: "Dubai Style Luxury Abaya & Modest Wear",
    description: "মার্জিত ও আভিজাত্যপূর্ণ ডিজাইনের ফ্রন্ট ওপেন আবায়া, বোরকা সেট এবং ম্যাচিং প্রিমিয়াম হিজাব কালেকশন।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Modest Elegance",
    ctaText: "View Abayas",
    linkUrl: "/products?category=Luxury%20Abayas",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-3", images: ["/products/cords set/910465086_1119291994063529_6730173952863950097_n.jpg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-4",
    title: "Winter Velvet & Cozy Chic Fashion Edit",
    description: "চিটা প্রিন্ট লং কোট, ভেলভেট জ্যাকেট এবং শীতকালীন ট্রেন্ডি ফ্লিস সুইটশার্ট — ক্যাশ অন ডেলিভারি সারা বাংলাদেশে।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: false,
    badge: "Winter 2026",
    ctaText: "Shop Winter Wear",
    linkUrl: "/products?category=Winter%20Collection",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-4", images: ["/products/cords set/916496639_2050418568951611_3231227725146044425_n.jpeg"] }],
    createdAt: new Date().toISOString(),
  },
  {
    id: "camp-hero-5",
    title: "Mini Thailand — Premier Boutique Fashion",
    description: "বাংলাদেশের বিশ্বস্ত থাই ফ্যাশন ব্র্যান্ড — প্রিমিয়াম কোয়ালিটি, লাইভ ভিডিও চেকিং ও দ্রুত হোম ডেলিভারি সুবিধা।",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: null,
    hasDiscount: true,
    badge: "Boutique Choice",
    ctaText: "Explore All Products",
    linkUrl: "/products",
    sectionId: "sec-hero",
    section: { id: "sec-hero", title: "Hero Campaign", position: 1, page: "home" },
    images: [{ id: "img-hero-5", images: ["/products/cords set/913180013_1120115427314519_7306115019982798276_n.jpg"] }],
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
    localStorage.removeItem("minithailandbd_campaigns_v4");

    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasBoutique = parsed.some((c) =>
          /cord|velvet|gown|abaya|winter/i.test(c.title || "")
        );
        if (hasBoutique) {
          return parsed.map(normalizeCampaignToEnglish);
        }
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
