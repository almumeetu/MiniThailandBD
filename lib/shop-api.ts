import { type PaginatedProducts, type Product as AdminProduct, type Campaign, type News, resolveImageUrl } from "./admin-api";
import { normalizeCampaignToEnglish } from "./campaign-store";
import { DEMO_NEWS, withEditorialGuides } from "./demo-news";

const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1")
    : (
        process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_BASE_URL.includes("localhost")
          ? process.env.NEXT_PUBLIC_API_BASE_URL
          : "/api/v1"
      );

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  team: string;
  price: number;
  originalPrice?: number;
  image: string;
  unit?: string;
  badge?: string;
  rating?: number;
  variantId?: string;
  inStock: boolean;
};

export type FetchShopProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
};

export type ShopProductsResponse = {
  data: ShopProduct[];
  total: number;
};

export type MappedProduct = {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  collection: string;
  priceNum: number;
  category: string;
  origin: string;
  subtitle: string;
  description: string;
  teas: { name: string; description: string }[];
  ingredients: string[];
  galleryImages: string[];
  variantId: string;
};

export interface TeaItem {
  name: string;
  description: string;
}

export interface ProductInfoProps {
  name: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  teas: TeaItem[];
  productId: string;
  variantId: string;
  productData: {
    name: string;
    priceNum: number;
    image: string;
    category: string;
    description: string;
  };
}
export type ShopBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
  children?: ShopCategory[];
};

export type ContactEntry = {
  title: string;
  value: string;
  extra?: string;
};

export type ShopSettings = {
  id?: string;
  shopName?: string;
  slogan?: string;
  contactNumber?: any;
  email?: any;
  socialContact?: any;
  currency?: string;
  language?: string;
  deliveryChargeInside?: string | number;
  deliveryChargeOutside?: string | number;
  deliveryChargeNearCity?: string | number;
  youtubeUrl?: string | null;
  youtubeThumbnailImage?: string | null;
  youtubeTitle?: string | null;
  youtubeDescription?: string | null;
  branchName?: string | null;
  branchAddress?: string | null;
  branchLat?: number | null;
  branchLng?: number | null;
  copyrightYear?: string | null;
  parentCompany?: string | null;
  parentCompanyLink?: string | null;
  logo?: string | null;
  icon?: string | null;
  favicon?: string | null;
  isTopBarVisible?: boolean;
  hideOutOfStock?: boolean;
};

/** Helper to cleanly extract contact number or email entries from various API formats */
export function parseContactEntries(field: any): ContactEntry[] {
  if (!field) return [];
  if (Array.isArray(field)) {
    return field
      .filter((item) => item && typeof item.value === "string" && item.value.trim() !== "")
      .map((item) => ({ title: item.title || "", value: item.value.trim() }));
  }
  if (Array.isArray(field.entries)) {
    return field.entries
      .filter((item: any) => item && typeof item.value === "string" && item.value.trim() !== "")
      .map((item: any) => ({ title: item.title || "", value: item.value.trim() }));
  }
  return [];
}


function mapProduct(product: AdminProduct): ShopProduct {
  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];

  const featuredMedia = product.media?.find((m) => m.isFeatured);
  const firstMedia = product.media?.[0];
  const rawImage = featuredMedia?.media.url ?? firstMedia?.media.url ?? "";

  const priceNum = Number(defaultVariant?.price ?? 0);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : 0;
  const showOriginal = discountPrice > 0 && discountPrice < priceNum;
  const activePrice = showOriginal ? discountPrice : priceNum;

  // A crossed-out price is shown only for a real active discount.
  const computedOriginal = showOriginal ? priceNum : undefined;

  const dynamicDiscount =
    computedOriginal && computedOriginal > activePrice
      ? Math.round(((computedOriginal - activePrice) / computedOriginal) * 100)
      : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category?.name ?? "",
    team: product.brand?.name ?? "",
    price: activePrice,
    originalPrice: computedOriginal,
    image: resolveImageUrl(rawImage),
    unit: product.unit?.name ?? product.unit?.abbreviation ?? undefined,
    badge: dynamicDiscount > 0 ? `-${dynamicDiscount}%` : undefined,
    variantId: defaultVariant?.id,
    inStock: (defaultVariant?.stockQuantity ?? 0) > 0,
  };
}

import { FALLBACK_MARKETPLACE_PRODUCTS } from "./fallback-products";

export async function fetchShopProducts(
  params: FetchShopProductsParams = {},
): Promise<ShopProductsResponse> {
  const { page = 1, limit = 12, search, categoryId, brandId } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));
  if (search) {
    searchParams.set("search", search);
  }
  if (categoryId) {
    searchParams.set("categoryId", categoryId);
  }
  if (brandId) {
    searchParams.set("brandId", brandId);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.status === 200) {
      const paginated: PaginatedProducts = await res.json();
      const mapped = (paginated.data ?? []).map(mapProduct);
      return {
        data: mapped,
        total: paginated.meta?.total ?? mapped.length,
      };
    }
  } catch (err) {
    console.warn("API product fetch failed, using fallback:", err);
  }

  // Demo products must never be presented as live inventory in production.
  if (process.env.NODE_ENV === "production") throw new Error("Products are temporarily unavailable");

  // Local development catalog.
  let filtered = FALLBACK_MARKETPLACE_PRODUCTS;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.category?.name && p.category.name.toLowerCase().includes(s)) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(s))
    );
  }
  if (categoryId) {
    const c = categoryId.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.categoryId?.toLowerCase() === c ||
        p.category?.id?.toLowerCase() === c ||
        p.category?.slug?.toLowerCase() === c ||
        p.category?.name?.toLowerCase() === c ||
        p.category?.slug?.toLowerCase().replace(/-/g, "") === c.replace(/-/g, "") ||
        p.category?.name?.toLowerCase().includes(c) ||
        (p.category?.slug && c.includes(p.category.slug.toLowerCase()))
    );
  }
  if (brandId) {
    const b = brandId.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.brandId?.toLowerCase() === b ||
        p.brand?.id?.toLowerCase() === b ||
        p.brand?.slug?.toLowerCase() === b ||
        p.brand?.name?.toLowerCase() === b ||
        p.brand?.name?.toLowerCase().includes(b)
    );
  }

  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);
  return {
    data: slice.map(mapProduct),
    total: filtered.length,
  };
}

export async function fetchShopProductById(id: string): Promise<AdminProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.status === 200) {
      return (await res.json()) as AdminProduct;
    }
  } catch (err) {
    console.warn(`fetchShopProductById(${id}) failed, checking fallback:`, err);
  }

  if (process.env.NODE_ENV === "production") return null;

  // Check fallback
  const found = FALLBACK_MARKETPLACE_PRODUCTS.find((p) => p.id === id);
  return found ?? null;
}

export async function fetchShopProductBySlug(slug: string): Promise<AdminProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/slug/${encodeURIComponent(slug)}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.status === 200) {
      return (await res.json()) as AdminProduct;
    }
  } catch (err) {
    console.warn(`fetchShopProductBySlug(${slug}) failed, checking fallback:`, err);
  }

  if (process.env.NODE_ENV === "production") return null;

  // Check fallback by slug match or clean match
  const clean = slug.toLowerCase().trim();
  const found = FALLBACK_MARKETPLACE_PRODUCTS.find(
    (p) =>
      p.slug.toLowerCase() === clean ||
      p.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-") === clean ||
      clean.includes(p.slug.toLowerCase()) ||
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === clean
  );
  return found ?? null;
}
async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return await res.json() as T;
  } catch {
    return fallback;
  }
}

export async function fetchShopNews(): Promise<News[]> {
  const result = await safeFetchJson<News[]>(`${API_BASE_URL}/news`, []);
  const publishedArticles = Array.isArray(result)
    ? result
        .filter((article) => article.isPublished)
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateB - dateA;
        })
    : [];
  return withEditorialGuides(publishedArticles);
}

export async function fetchShopNewsBySlug(slug: string): Promise<News | null> {
  const article = await safeFetchJson<News | null>(
    `${API_BASE_URL}/news/slug/${encodeURIComponent(slug)}`,
    null,
  );
  if (article?.isPublished) return article;
  return DEMO_NEWS.find((demoArticle) => demoArticle.slug === slug) ?? null;
}

export const DEFAULT_NOVAMART_CATEGORIES: ShopCategory[] = [
  { id: "cat-skincare", name: "Skin Care & Beauty", slug: "skin-care", imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-electronics", name: "Digital Electronics", slug: "digital-electronics", imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-perfume", name: "Perfumes & Fragrances", slug: "perfume", imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-clothing", name: "Clothing & Fashion", slug: "clothing", imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-baby", name: "Baby & Kids Products", slug: "baby-products", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-home", name: "Home & Living", slug: "home-living", imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-footwear", name: "Footwear & Shoes", slug: "footwear", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-groceries", name: "Gourmet Foods & Agro", slug: "groceries", imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-health", name: "Health, Wellness & Fitness", slug: "health-wellness", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80" },
  { id: "cat-watches", name: "Watches & Premium Accessories", slug: "watches-accessories", imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80" },
];

export const DEFAULT_NOVAMART_SETTINGS: ShopSettings = {
  id: "minithailandbd-settings-default",
  shopName: "MiniThailandBD",
  slogan: "Bangladesh's premier fashion online store for skincare, digital electronics, perfumes, fashion, baby products and home essentials",
  contactNumber: [
    { title: "Hotline Support", value: "+880 1722-301927" },
    { title: "Customer Care", value: "01722301927" },
  ],
  email: [
    { title: "Customer Support", value: "support@minithailandbd.com" },
    { title: "Corporate Inquiries", value: "sales@minithailandbd.com" },
  ],
  socialContact: {
    whatsapp: "8801722301927",
    facebook: "https://www.facebook.com/minithailand2022/",
    instagram: "https://instagram.com/minithailandbd",
    youtube: "https://youtube.com/@minithailandbd",
  },
  currency: "BDT",
  language: "en",
  deliveryChargeInside: 60,
  deliveryChargeOutside: 120,
  deliveryChargeNearCity: 80,
  branchName: "MiniThailandBD Central Flagship & Fulfillment",
  branchAddress: "Uttara Sector-11, Dhaka, Bangladesh",
  copyrightYear: "2026",
  parentCompany: "MiniThailandBD Bangladesh",
  parentCompanyLink: "https://www.facebook.com/minithailand2022/",
  logo: "/images/logo/update-logo.png",
  isTopBarVisible: true,
  hideOutOfStock: false,
};

export const DEFAULT_NOVAMART_BRANDS: ShopBrand[] = [
  { id: "b-apple", name: "Apple", slug: "apple" },
  { id: "b-samsung", name: "Samsung", slug: "samsung" },
  { id: "b-dior", name: "Dior", slug: "dior" },
  { id: "b-chanel", name: "Chanel", slug: "chanel" },
  { id: "b-theordinary", name: "The Ordinary", slug: "the-ordinary" },
  { id: "b-cerave", name: "CeraVe", slug: "cerave" },
  { id: "b-pampers", name: "Pampers", slug: "pampers" },
  { id: "b-philips", name: "Philips Avent", slug: "philips-avent" },
  { id: "b-anker", name: "Anker", slug: "anker" },
  { id: "b-sony", name: "Sony", slug: "sony" },
];

export async function fetchShopBrands(): Promise<ShopBrand[]> {
  const result = await safeFetchJson<ShopBrand[]>(`${API_BASE_URL}/brands`, []);
  return result && result.length > 0 ? result : DEFAULT_NOVAMART_BRANDS;
}

let categoriesInFlight: Promise<ShopCategory[]> | null = null;

export function fetchShopCategories(): Promise<ShopCategory[]> {
  if (!categoriesInFlight) {
    categoriesInFlight = safeFetchJson<ShopCategory[]>(`${API_BASE_URL}/category`, [])
      .then((result) => result && result.length > 0 ? result : DEFAULT_NOVAMART_CATEGORIES)
      .finally(() => { categoriesInFlight = null; });
  }
  return categoriesInFlight;
}

export async function fetchShopSettings(): Promise<ShopSettings | null> {
  const result = await safeFetchJson<ShopSettings | null>(`${API_BASE_URL}/settings`, null);
  const settings = result ?? DEFAULT_NOVAMART_SETTINGS;
  // Replace the former demo address while preserving addresses configured later.
  const legacyAddress = "Level 4, Nova Tower, Plot 18, Road 11, Banani, Dhaka-1213, Bangladesh";
  return {
    ...settings,
    branchAddress: !settings.branchAddress?.trim() || settings.branchAddress.trim() === legacyAddress
      ? DEFAULT_NOVAMART_SETTINGS.branchAddress
      : settings.branchAddress,
  };
}

export function fetchShopTags(): Promise<any[]> {
  return safeFetchJson<any[]>(`${API_BASE_URL}/tags`, []);
}

export function fetchShopAttributes(): Promise<any[]> {
  return safeFetchJson<any[]>(`${API_BASE_URL}/attributes`, []);
}

// ─── Policies ────────────────────────────────────────────────────────────────

export interface PolicyEntry {
  title: string;
  content: string;
}

export type PolicyKey = "delivery" | "refund" | "return" | "cancellation" | "privacy" | "terms";

export interface StorePolicies {
  delivery?:     PolicyEntry;
  refund?:       PolicyEntry;
  return?:       PolicyEntry;
  cancellation?: PolicyEntry;
  privacy?:      PolicyEntry;
  terms?:        PolicyEntry;
}

/** Fetches all policies from the API. Safe – never throws; returns null on failure. */
export async function fetchStorePolicies(): Promise<StorePolicies | null> {
  const result = await safeFetchJson<StorePolicies | null>(`${API_BASE_URL}/policies`, null);
  if (result) return result;
  return {
    delivery: {
      title: "Delivery Information",
      content: "Available delivery options and charges depend on the delivery address. Review the current details during checkout before placing an order.",
    },
    return: {
      title: "7-Day Return & Replacement Policy",
      content: "If your item is damaged, defective, or incorrect upon delivery, you may request a free return or replacement within 7 days. Customer helpline: +880 1722-301927.",
    },
    refund: {
      title: "Instant Refund Guarantee",
      content: "Refunds for returned or canceled orders are processed within 24 to 48 business hours via your original payment method (bKash, Nagad, Card, or Bank transfer).",
    },
    privacy: {
      title: "Data Privacy & Security",
      content: "MiniThailandBD respects your privacy and utilizes SSL bank-grade encryption to protect customer payment and personal information.",
    },
    terms: {
      title: "Terms & Conditions",
      content: "All purchases made on MiniThailandBD Bangladesh are backed by authentic brand guarantees, valid commercial VAT invoices, and consumer protection regulations.",
    },
  };
}

/** Fetches all active campaigns, normalized to English */
export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  const campaigns = await safeFetchJson<Campaign[]>(`${API_BASE_URL}/campaigns`, []);
  return campaigns
    .filter((c) => c.status === "active")
    .map(normalizeCampaignToEnglish);
}

// ─── Product Reviews ─────────────────────────────────────────────────────────

export interface ShopReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  } | null;
}

export function fetchShopProductReviews(productId: string): Promise<ShopReview[]> {
  return safeFetchJson<ShopReview[]>(`${API_BASE_URL}/products/${productId}/reviews`, []);
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export interface CouponItem {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number | string;
  maxUsage: number;
  usedCount: number;
  expiresAt?: string | null;
}

export interface ApplyCouponResult {
  coupon: CouponItem;
  discount: number;
  total: number;
}

export function fetchCoupons(): Promise<CouponItem[]> {
  return safeFetchJson<CouponItem[]>(`${API_BASE_URL}/coupons`, []);
}

export async function applyCouponApi(
  code: string,
  subtotal: number
): Promise<{ success: boolean; data?: ApplyCouponResult; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal }),
    });
    const body = await res.json();
    if (!res.ok) {
      return { success: false, message: body?.message || "Invalid coupon code" };
    }
    return { success: true, data: body };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to validate coupon" };
  }
}

