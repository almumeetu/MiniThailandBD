"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveImageUrl } from "@/lib/admin-api";
import {
  fetchPublicVideos,
  type VideoItem,
  type VideoType,
  getWhatsAppVideoLink,
  FALLBACK_VIDEOS,
} from "@/lib/video-api";
import VideoPlayerModal from "@/components/sections/video-player-modal";
import {
  LuEye,
  LuHeart,
  LuPlay,
  LuSearch,
  LuSparkles,
  LuSlidersHorizontal,
  LuExternalLink,
  LuFilm,
  LuRefreshCw,
} from "react-icons/lu";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa6";

const CATEGORIES = [
  "All",
  "Cord Sets",
  "Party Gowns",
  "Luxury Abayas",
  "Velvet Collection",
  "Winter Collection",
  "Korean Style",
];

export default function VideosClientPage({
  initialVideos = [],
}: {
  initialVideos?: VideoItem[];
}) {
  const [videos, setVideos] = useState<VideoItem[]>(
    initialVideos.length > 0 ? initialVideos : FALLBACK_VIDEOS,
  );
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"all" | VideoType>("all");
  const [sortBy, setSortBy] = useState<"featured" | "latest" | "views" | "likes">("featured");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Modal State
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchParams = useSearchParams();

  // Load videos when filters change
  useEffect(() => {
    async function loadFiltered() {
      setLoading(true);
      try {
        const res = await fetchPublicVideos({
          page: 1,
          limit: 24,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          type: selectedType === "all" ? undefined : selectedType,
          sort: sortBy,
          search: search.trim() || undefined,
        });
        if (res && res.data) {
          setVideos(res.data);
          setHasMore(res.meta.page < res.meta.totalPages);
          setPage(1);
        }
      } catch (err) {
        console.warn("Failed to load filtered videos, using local fallback filter:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFiltered();
  }, [selectedCategory, selectedType, sortBy, search]);

  // Handle URL deep link ?video=ID
  useEffect(() => {
    const videoParam = searchParams?.get("video");
    if (videoParam && videos.length > 0) {
      const match = videos.find((v) => v.id === videoParam);
      if (match) {
        setActiveModalVideo(match);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, videos]);

  // Load more pagination
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await fetchPublicVideos({
        page: nextPage,
        limit: 24,
        category: selectedCategory === "All" ? undefined : selectedCategory,
        type: selectedType === "all" ? undefined : selectedType,
        sort: sortBy,
        search: search.trim() || undefined,
      });
      if (res && res.data) {
        setVideos((prev) => [...prev, ...res.data]);
        setHasMore(res.meta.page < res.meta.totalPages);
        setPage(nextPage);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-store-page">
      {/* ── Page Hero Header ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1b0212] via-[#240417] to-store-page text-white pt-12 pb-16 px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(225,29,72,0.15),transparent_60%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-950/80 border border-rose-800/60 px-4 py-1 text-xs font-bold uppercase tracking-wider text-rose-300">
            <LuSparkles className="h-3.5 w-3.5 text-rose-400" />
            <span>Mini Thailand Video & Reels Showcase</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white">
            Watch & Shop Trending Outfits
          </h1>

          <p className="text-sm sm:text-base text-rose-200/80 max-w-2xl mx-auto font-sans leading-relaxed">
            আমাদের ফেসবুক পেজ ও লাইভের জনপ্রিয় ড্রেস, থাই কর্ড সেট, পার্টি গাউন ও আবায়া কালেকশন একনজরে দেখুন এবং ভিডিও থেকেই অর্ডার করুন।
          </p>

          {/* Search bar inside Hero */}
          <div className="pt-4 max-w-lg mx-auto">
            <div className="relative">
              <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300/70" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos (e.g. Cord Set, Velvet, Abaya, Overcoat)..."
                className="w-full rounded-2xl border border-rose-900/60 bg-black/40 backdrop-blur-md pl-11 pr-4 py-3 text-sm text-white placeholder:text-rose-300/50 focus:border-rose-500 focus:outline-none shadow-lg"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-rose-300 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Showcase Area ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 -mt-6 pb-20 space-y-8">
        {/* Filter Bar */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "bg-store-primary text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Type Toggle & Sort Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
            {/* Type selector */}
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedType === "all"
                    ? "bg-white font-bold text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                All Videos
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("reel")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedType === "reel"
                    ? "bg-white font-bold text-store-primary shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Reels (9:16)
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("video")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedType === "video"
                    ? "bg-white font-bold text-blue-700 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Standard
              </button>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:border-store-primary focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="latest">Latest Added</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Video Grid (2 cols mobile, 3 cols tablet, 4-5 cols desktop) ── */}
        {loading && videos.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-[9/16] rounded-2xl bg-zinc-200 animate-pulse"
              />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-store-primary">
              <LuFilm className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              No videos matching your criteria
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try selecting another category or clearing your search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedType("all");
                setSearch("");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-store-primary px-4 py-2 text-xs font-semibold text-white hover:bg-store-primary/90 transition-all shadow-sm"
            >
              <LuRefreshCw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
            {videos.map((item, idx) => {
              const isHovered = hoveredId === item.id;
              const canPreviewHover =
                item.source === "upload" && Boolean(item.videoUrl);

              const product = item.product;
              const productPrice = product?.variants?.[0]?.price
                ? Number(product.variants[0].price)
                : undefined;

              const whatsappUrl = product
                ? getWhatsAppVideoLink(
                    product.name,
                    productPrice,
                    item.title,
                    item.facebookUrl || undefined,
                  )
                : getWhatsAppVideoLink(item.title, undefined, item.title, item.facebookUrl || undefined);

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    setActiveModalVideo(item);
                    setIsModalOpen(true);
                  }}
                  className="group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-200/90 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-store-primary/50 hover:shadow-2xl"
                >
                  {/* Thumbnail / Desktop Hover Preview */}
                  {canPreviewHover && isHovered ? (
                    <video
                      src={item.videoUrl!}
                      poster={resolveImageUrl(item.thumbnailUrl)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={resolveImageUrl(item.thumbnailUrl)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={item.thumbnailUrl.startsWith("http")}
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-10">
                    {item.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white shadow-xs">
                        <LuSparkles className="h-2.5 w-2.5" />
                        <span>Featured</span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-rose-200 border border-white/10">
                        {item.type === "reel" ? "Reel" : "Video"}
                      </span>
                    )}

                    {item.durationSec > 0 && (
                      <span className="rounded-full bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono text-zinc-300 border border-white/10">
                        {Math.floor(item.durationSec / 60)}:
                        {String(item.durationSec % 60).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Center Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xl transition-all duration-300 group-hover:scale-115 group-hover:bg-store-primary">
                      <LuPlay className="h-4 w-4 sm:h-5 sm:w-5 translate-x-0.5 fill-current" />
                    </span>
                  </div>

                  {/* Bottom Strip */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 space-y-2 z-10">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                      {item.views && (
                        <span className="flex items-center gap-1 font-medium">
                          <LuEye className="h-2.5 w-2.5 text-zinc-400" />
                          <span>{item.views}</span>
                        </span>
                      )}
                      {item.likes && (
                        <span className="flex items-center gap-1 font-medium">
                          <LuHeart className="h-2.5 w-2.5 text-rose-400 fill-rose-400/40" />
                          <span>{item.likes}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs font-semibold text-white line-clamp-2 leading-snug">
                      {item.caption || item.title}
                    </p>

                    {/* Product Mini Strip */}
                    {product ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl border border-white/15 bg-black/75 backdrop-blur-md p-1.5 flex items-center justify-between gap-1.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-bold text-white">
                            {product.name}
                          </p>
                          <p className="text-[10px] font-extrabold text-store-primary">
                            {productPrice ? `৳${productPrice.toLocaleString()}` : "Shop"}
                          </p>
                        </div>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                          title="Order on WhatsApp"
                        >
                          <FaWhatsapp className="h-3 w-3" />
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-6">
            <button
              type="button"
              disabled={loading}
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition-all shadow-sm"
            >
              {loading && <LuRefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>Load More Videos</span>
            </button>
          </div>
        )}
      </div>

      {/* Reels Modal Player */}
      <VideoPlayerModal
        video={activeModalVideo}
        videoList={videos}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectVideo={(v) => setActiveModalVideo(v)}
      />
    </div>
  );
}
