import { apiRequest } from "./admin-api";

export type VideoType = "reel" | "video";
export type VideoSource = "facebook" | "upload";

export interface LinkedProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants?: {
    id: string;
    sku: string;
    price: string | number;
    cost?: string | number;
    stockQuantity?: number;
    isDefault: boolean;
  }[];
  media?: {
    id: string;
    isFeatured: boolean;
    sortOrder: number;
    media: {
      id: string;
      url: string;
      type: string;
    };
  }[];
}

export interface VideoItem {
  id: string;
  title: string;
  caption?: string | null;
  type: VideoType;
  source: VideoSource;
  facebookUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl: string;
  durationSec: number;
  views?: string | null;
  likes?: string | null;
  productId?: string | null;
  product?: LinkedProduct | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoListResponse {
  data: VideoItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VideoFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: VideoType;
  source?: VideoSource;
  category?: string;
  productId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sort?: "latest" | "views" | "likes" | "order" | "featured";
}

const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1")
    : (
        process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_BASE_URL.includes("localhost")
          ? process.env.NEXT_PUBLIC_API_BASE_URL
          : "/api/v1"
      );

/**
 * Fallback static videos in case backend is offline
 */
export const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: "fb-reel-1",
    title: "Thai Cord Set — Rose Pink Special",
    caption: "থাই কর্ড সেট — লাইভ স্পেশাল কালেকশন। পিওর সফট সিল্কি ফিনিশ ও স্টাইলিশ ফিটিং। সরাসরি ফেসবুক লাইভে দেখানো জনপ্রিয় ডিজাইন!",
    type: "reel",
    source: "upload",
    facebookUrl: "https://www.facebook.com/minithailand2022/",
    videoUrl: "/videos/reels-1.mp4",
    thumbnailUrl: "/videos/reels-1-thumb.png",
    durationSec: 30,
    views: "24.8K",
    likes: "1.8K",
    productId: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb-reel-2",
    title: "Wine Red Tiered Velvet Party Gown",
    caption: "ওয়াইন রেড ভেলভেট গর্জিয়াস পার্টি গাউন। রাজকীয় আভিজাত্য ও আধুনিক প্যাটার্ন। যেকোনো ওয়েডিং বা ইভেন্টে মধ্যমণি হন।",
    type: "reel",
    source: "upload",
    facebookUrl: "https://www.facebook.com/minithailand2022/",
    videoUrl: "/videos/reels-2.mp4",
    thumbnailUrl: "/videos/reels-2-thumb.png",
    durationSec: 15,
    views: "32.1K",
    likes: "3.2K",
    productId: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb-reel-3",
    title: "Imported Bangkok 2-Piece Cord Set",
    caption: "ব্যাংকক ইমপোর্টেড এক্সক্লুসিভ ২-পিস কর্ড সেট। গর্জিয়াস কাট, ট্রেন্ডি কালার প্যালেট ও প্রিমিয়াম ম্যাটেরিয়াল।",
    type: "reel",
    source: "upload",
    facebookUrl: "https://www.facebook.com/minithailand2022/",
    videoUrl: "/videos/reels-3.mp4",
    thumbnailUrl: "/videos/reels-3-thumb.png",
    durationSec: 35,
    views: "19.4K",
    likes: "1.5K",
    productId: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb-reel-4",
    title: "Dubai Style Beige Shrug & Luxury Abaya",
    caption: "দুবাই স্টাইল বেইজ আবায়া ও শ্রাগ সেট। সাথে থাকছে ম্যাচিং প্রিমিয়াম শিফন হিজাব। ফ্যাশনেবল ও মার্জিত আউটফিট।",
    type: "reel",
    source: "upload",
    facebookUrl: "https://www.facebook.com/minithailand2022/",
    videoUrl: "/videos/reels-4.mp4",
    thumbnailUrl: "/videos/reels-4-thumb.png",
    durationSec: 29,
    views: "27.9K",
    likes: "2.6K",
    productId: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb-reel-5",
    title: "Textured Animal Print Long Overcoat & Winter Edit",
    caption: "চিটা প্রিন্ট লাক্সারি লং ওভারকোট ও উইন্টার কালেকশন। শীতের ফ্যাশনে ট্রেন্ডি লুক ও সর্বোচ্চ স্বাচ্ছন্দ্য।",
    type: "reel",
    source: "upload",
    facebookUrl: "https://www.facebook.com/minithailand2022/",
    videoUrl: "/videos/reels-5.mp4",
    thumbnailUrl: "/videos/reels-5-thumb.png",
    durationSec: 8,
    views: "15.6K",
    likes: "1.1K",
    productId: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb-reel-6",
    title: "Emerald Green Royal Velvet Kaftan & Party Wear",
    caption: "পান্না সবুজ রাজকীয় ভেলভেট কাফতান। গোল্ডেন এমব্রয়ডারি ওয়ার্ক ও ফ্লোয়ি কাট। উৎসবের সাজে সেরা নির্বাচন।",
    type: "reel",
    source: "upload",
    facebookUrl: "https://www.facebook.com/minithailand2022/",
    videoUrl: "/videos/reels-6.mp4",
    thumbnailUrl: "/videos/reels-6-thumb.png",
    durationSec: 18,
    views: "21.3K",
    likes: "1.9K",
    productId: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Public: Fetch active videos
 */
export async function fetchPublicVideos(
  params?: VideoFilterParams,
): Promise<VideoListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.type) query.set("type", params.type);
  if (params?.source) query.set("source", params.source);
  if (params?.category) query.set("category", params.category);
  if (params?.productId) query.set("productId", params.productId);
  if (params?.isFeatured !== undefined)
    query.set("isFeatured", String(params.isFeatured));
  if (params?.sort) query.set("sort", params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : "";

  try {
    const res = await fetch(`${API_BASE_URL}/videos${queryString}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch videos: ${res.statusText}`);
    }
    const data = await res.json();
    if (data && Array.isArray(data.data)) {
      return data;
    }
    return {
      data: FALLBACK_VIDEOS,
      meta: { total: FALLBACK_VIDEOS.length, page: 1, limit: 20, totalPages: 1 },
    };
  } catch (err) {
    console.warn("Using fallback videos due to fetch failure:", err);
    return {
      data: FALLBACK_VIDEOS,
      meta: { total: FALLBACK_VIDEOS.length, page: 1, limit: 20, totalPages: 1 },
    };
  }
}

/**
 * Public: Fetch single video by ID
 */
export async function fetchVideoById(id: string): Promise<VideoItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/videos/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return FALLBACK_VIDEOS.find((v) => v.id === id) || null;
  }
}

/**
 * Public: Fetch videos linked to a product
 */
export async function fetchVideosForProduct(
  productId: string,
): Promise<VideoItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/videos/product/${productId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Admin: Fetch all videos (including inactive)
 */
export async function fetchAdminVideos(
  params?: VideoFilterParams,
): Promise<VideoListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.type) query.set("type", params.type);
  if (params?.source) query.set("source", params.source);
  if (params?.isActive !== undefined)
    query.set("isActive", String(params.isActive));
  if (params?.isFeatured !== undefined)
    query.set("isFeatured", String(params.isFeatured));

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<VideoListResponse>(`/videos/manage${queryString}`, {
    method: "GET",
  });
}

/**
 * Admin: Create video (supports FormData or JSON)
 */
export async function createAdminVideo(
  payload: FormData | Partial<VideoItem>,
): Promise<VideoItem> {
  if (payload instanceof FormData) {
    return apiRequest<VideoItem>("/videos", {
      method: "POST",
      body: payload,
    });
  }

  return apiRequest<VideoItem>("/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Admin: Update video
 */
export async function updateAdminVideo(
  id: string,
  payload: FormData | Partial<VideoItem>,
): Promise<VideoItem> {
  if (payload instanceof FormData) {
    return apiRequest<VideoItem>(`/videos/${id}`, {
      method: "PATCH",
      body: payload,
    });
  }

  return apiRequest<VideoItem>(`/videos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Admin: Delete video
 */
export async function deleteAdminVideo(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/videos/${id}`, {
    method: "DELETE",
  });
}

/**
 * Admin: Reorder videos
 */
export async function reorderAdminVideos(
  items: { id: string; sortOrder: number }[],
): Promise<{ success: boolean; count: number }> {
  return apiRequest<{ success: boolean; count: number }>("/videos/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

/**
 * Admin: Toggle active or featured
 */
export async function toggleAdminVideo(
  id: string,
  field: "isActive" | "isFeatured",
): Promise<VideoItem> {
  return apiRequest<VideoItem>(`/videos/${id}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field }),
  });
}

/**
 * Admin: Preview Facebook page videos
 */
export async function previewFacebookVideos(
  pageId?: string,
  token?: string,
): Promise<{ configured: boolean; error?: boolean; message?: string; videos: any[] }> {
  const query = new URLSearchParams();
  if (pageId) query.set("pageId", pageId);
  if (token) query.set("token", token);
  const q = query.toString() ? `?${query.toString()}` : "";

  return apiRequest(`/videos/fb-preview${q}`, {
    method: "GET",
  });
}

/**
 * Admin: Import Facebook videos
 */
export async function importFacebookVideos(
  items: any[],
): Promise<{ success: boolean; importedCount: number; data: VideoItem[] }> {
  return apiRequest("/videos/fb-import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

/**
 * Helper to generate prefilled WhatsApp order link for a video
 */
export function getWhatsAppVideoLink(
  productName: string,
  productPrice?: string | number,
  videoTitle?: string,
  videoUrl?: string,
): string {
  const phone = "+8801706126663";
  const priceText = productPrice ? ` (মূল্য: ৳${Number(productPrice).toLocaleString()})` : "";
  const videoText = videoTitle ? `\nরিলস / ভিডিও রেফারেন্স: ${videoTitle}` : "";
  const linkText = videoUrl ? `\nভিডিও লিংক: ${videoUrl}` : "";
  const message = `হ্যালো মিনি থাইল্যান্ড, আমি আপনাদের ফেসবুক ভিডিও/রিলস দেখে এই প্রোডাক্টটি অর্ডার করতে চাই:\n\nপণ্য: ${productName}${priceText}${videoText}${linkText}\n\nদয়া করে এভেইলেবল সাইজ ও ডেলিভারি ডিটেইলস জানান।`;

  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}
