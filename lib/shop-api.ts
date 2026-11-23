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
      if (mapped.length > 0) {
        return {
          data: mapped,
          total: paginated.meta?.total ?? mapped.length,
        };
      }
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

export const DEFAULT_SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "cat-cord-sets",
    name: "Co-ord Sets",
    slug: "cord-sets",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=90",
  },
  {
    id: "cat-party-gowns",
    name: "Party Gowns",
    slug: "party-gowns",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=90",
  },
  {
    id: "cat-luxury-abayas",
    name: "Luxury Abayas",
    slug: "luxury-abayas",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=90",
  },
  {
    id: "cat-velvet-collection",
    name: "Velvet Collection",
    slug: "velvet-collection",
    imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=90",
  },
  {
    id: "cat-winter-collection",
    name: "Winter Collection",
    slug: "winter-collection",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=90",
  },
  {
    id: "cat-designer-3piece",
    name: "Designer 3-Piece",
    slug: "designer-3piece",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=90",
  },
  {
    id: "cat-casual-modest",
    name: "Casual & Modest",
    slug: "casual-modest",
    imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=90",
  },
  {
    id: "cat-hijabs-scarves",
    name: "Hijabs & Scarves",
    slug: "hijabs-scarves",
    imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=90",
  },
];
export const DEFAULT_NOVAMART_CATEGORIES = DEFAULT_SHOP_CATEGORIES;

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  id: "minithailand-settings-default",
  shopName: "Mini Thailand",
  slogan: "Exclusive Thai Cord Sets, Luxury Party Gowns, Dubai Abayas & Velvet Boutique Fashion",
  contactNumber: [
    { title: "Hotline & WhatsApp", value: "+880 1706-126663" },
    { title: "Order Desk", value: "01706126663" },
  ],
  email: [
    { title: "Customer Care", value: "support@minithailand.com" },
    { title: "Wholesale & Inquiries", value: "orders@minithailand.com" },
  ],
  socialContact: {
    whatsapp: "8801706126663",
    facebook: "https://www.facebook.com/minithailand2022/",
    instagram: "https://www.instagram.com/mini_thailand123",
    youtube: "https://www.youtube.com/@MiniThailand-pk5rs",
  },
  currency: "BDT",
  language: "en",
  deliveryChargeInside: 70,
  deliveryChargeOutside: 130,
  deliveryChargeNearCity: 100,
  branchName: "Mini Thailand Boutique Flagship & Outlets",
  branchAddress: "Jamuna Future Park (Shop 11, Ground Fl) | Dhanmondi Simanto Somvar (Shop 3060, L3) | Uttara Nigar Plaza (Shop 23-24, L2) | Adabor Shahabuddin Plaza (Shop 43, L2), Dhaka, Bangladesh",
  copyrightYear: "2026",
  parentCompany: "Mini Thailand",
  parentCompanyLink: "https://www.facebook.com/minithailand2022/",
  logo: "/images/minithailand-logo.png",
  isTopBarVisible: true,
  hideOutOfStock: false,
};
export const DEFAULT_NOVAMART_SETTINGS = DEFAULT_SHOP_SETTINGS;

export const DEFAULT_SHOP_BRANDS: ShopBrand[] = [
  { id: "b-minithai", name: "Mini Thailand Exclusive", slug: "mini-thailand-exclusive" },
  { id: "b-bangkok", name: "Bangkok Boutique", slug: "bangkok-boutique" },
  { id: "b-dubai", name: "Dubai Modest Wear", slug: "dubai-modest-wear" },
  { id: "b-pakistani", name: "Pakistani Designer", slug: "pakistani-designer" },
  { id: "b-royal-velvet", name: "Royal Velvet Edit", slug: "royal-velvet-edit" },
  { id: "b-thai-silk", name: "Thai Silk & Linen", slug: "thai-silk-linen" },
];
export const DEFAULT_NOVAMART_BRANDS = DEFAULT_SHOP_BRANDS;

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
      content: "If your item is damaged, defective, or incorrect upon delivery, you may request a free return or replacement within 7 days. Customer helpline: +880 1706-126663.",
    },
    refund: {
      title: "Instant Refund Guarantee",
      content: "Refunds for returned or canceled orders are processed within 24 to 48 business hours via your original payment method (bKash, Nagad, Card, or Bank transfer).",
    },
    privacy: {
      title: "Data Privacy & Security",
      content: "Mini Thailand respects your privacy and utilizes SSL bank-grade encryption to protect customer payment and personal information.",
    },
    terms: {
      title: "Terms & Conditions",
      content: "All purchases made on Mini Thailand Bangladesh are backed by authentic brand guarantees, valid commercial VAT invoices, and consumer protection regulations.",
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

