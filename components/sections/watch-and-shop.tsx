"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveImageUrl } from "@/lib/admin-api";
import {
  fetchPublicVideos,
  type VideoItem,
  getWhatsAppVideoLink,
  FALLBACK_VIDEOS,
} from "@/lib/video-api";
import VideoPlayerModal from "./video-player-modal";
import {
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuHeart,
  LuPlay,
  LuSparkles,
  LuExternalLink,
} from "react-icons/lu";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa6";

export default function WatchAndShop() {
  const [videos, setVideos] = useState<VideoItem[]>(FALLBACK_VIDEOS);
  const [loading, setLoading] = useState(true);
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Load videos on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchPublicVideos({ limit: 12, sort: "featured" });
        if (res && res.data && res.data.length > 0) {
          setVideos(res.data);
        }
      } catch (err) {
        console.warn("Could not load backend videos, using static showcase:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Check URL param ?video=ID on load or navigation
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

  // Carousel navigation arrows
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleOpenPlayer = (video: VideoItem) => {
    setActiveModalVideo(video);
    setIsModalOpen(true);
  };

  return (
    <section
      aria-label="Watch & Shop Our Reels"
      className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12"
    >
      {/* ── Section Container with Luxury Rose / Burgundy Palette ── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1a0210] via-[#2a051a] to-[#12000b] p-6 sm:p-8 lg:p-10 text-white shadow-2xl border border-rose-950/50 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-rose-900/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

        {/* ── Section Header ── */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-rose-900/40 pb-6 mb-7">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-rose-300">
                AS SEEN ON FACEBOOK
              </span>
            </div>

            {/* Serif Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white">
              Watch & Shop Our Reels
            </h2>

            {/* Bengali Subtitle */}
            <p className="text-xs sm:text-sm text-rose-200/80 leading-relaxed font-sans">
              আমাদের ফেসবুক লাইভ ও রিলসের ট্রেন্ডিং কালেকশন দেখে সরাসরি ভিডিও থেকে অর্ডার করুন
            </p>
          </div>

          {/* Actions: Follow on Facebook + View All Videos + Nav Arrows */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Follow on Facebook Button */}
            <Link
              href="https://www.facebook.com/minithailand2022/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#1567d3] transition-all shadow-md active:scale-95"
            >
              <FaFacebookF className="h-3.5 w-3.5" />
              <span>Follow Facebook</span>
            </Link>

            {/* View All Videos Link */}
            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-800/80 bg-rose-950/40 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-200 hover:bg-rose-900/50 hover:text-white transition-all"
            >
              <span>View all</span>
              <LuArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Desktop Navigation Chevrons */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                aria-label="Scroll left"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-900/60 bg-white/5 text-rose-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LuChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                aria-label="Scroll right"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-900/60 bg-white/5 text-rose-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LuChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Horizontal Scroll-Snap Carousel ── */}
        <div
          ref={carouselRef}
          className="relative z-10 flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((item, idx) => {
            const isHovered = hoveredVideoId === item.id;
            const canPreviewHover =
              item.source === "upload" && Boolean(item.videoUrl);

            // Product data
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
                onMouseEnter={() => setHoveredVideoId(item.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                className="group relative shrink-0 w-[72vw] sm:w-[270px] md:w-[290px] lg:w-[305px] snap-start"
              >
                {/* 9:16 Vertical Card Box */}
                <div
                  onClick={() => handleOpenPlayer(item)}
                  className="relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-rose-900/30 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-rose-500/50 hover:shadow-2xl"
                >
                  {/* Thumbnail / Desktop Hover Preview Video */}
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
                      sizes="(max-width: 640px) 75vw, (max-width: 1024px) 290px, 310px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={item.thumbnailUrl.startsWith("http")}
                    />
                  )}

                  {/* Gradient Overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />

                  {/* Top Badges: Featured Tag & Views */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                    {item.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                        <LuSparkles className="h-2.5 w-2.5" />
                        <span>{idx % 2 === 0 ? "LIVE HIT" : "VIRAL ON FB"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-rose-200 border border-white/10">
                        {item.type === "reel" ? "Reel" : "Video"}
                      </span>
                    )}

                    {/* Duration badge */}
                    {item.durationSec > 0 && (
                      <span className="rounded-full bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/10">
                        {Math.floor(item.durationSec / 60)}:
                        {String(item.durationSec % 60).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Center Animated Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xl transition-all duration-300 group-hover:scale-115 group-hover:bg-rose-600">
                      <LuPlay className="h-5 w-5 translate-x-0.5 fill-current" />
                    </span>
                  </div>

                  {/* Bottom Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 space-y-2.5 z-10">
                    {/* Views and Likes chips */}
                    <div className="flex items-center gap-2.5 text-[11px] text-zinc-300">
                      {item.views && (
                        <span className="flex items-center gap-1 font-medium">
                          <LuEye className="h-3 w-3 text-zinc-400" />
                          <span>{item.views}</span>
                        </span>
                      )}
                      {item.likes && (
                        <span className="flex items-center gap-1 font-medium">
                          <LuHeart className="h-3 w-3 text-rose-400 fill-rose-400/40" />
                          <span>{item.likes}</span>
                        </span>
                      )}
                    </div>

                    {/* Caption / Title */}
                    <p className="text-xs font-semibold text-white line-clamp-2 leading-snug drop-shadow-sm">
                      {item.caption || item.title}
                    </p>

                    {/* Linked Product Mini-Strip */}
                    {product ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl border border-white/15 bg-black/70 backdrop-blur-md p-2 flex flex-col gap-1.5 shadow-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                            {product.media?.[0]?.media?.url && (
                              <Image
                                src={resolveImageUrl(product.media[0].media.url)}
                                alt={product.name}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold text-white">
                              {product.name}
                            </p>
                            <p className="text-[11px] font-extrabold text-store-primary">
                              {productPrice ? `৳${productPrice.toLocaleString()}` : "Shop Now"}
                            </p>
                          </div>
                        </div>

                        {/* Order on WhatsApp + View Product Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-1.5 px-2 text-[10px] font-bold text-white transition-colors"
                          >
                            <FaWhatsapp className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>

                          <Link
                            href={`/products/${product.slug}`}
                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 py-1.5 px-2 text-[10px] font-semibold text-white transition-colors"
                          >
                            <span>Details</span>
                            <LuExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      /* Fallback WhatsApp Order button */
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                      >
                        <FaWhatsapp className="h-3.5 w-3.5" />
                        <span>Order on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reels Player Modal ── */}
      <VideoPlayerModal
        video={activeModalVideo}
        videoList={videos}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectVideo={(v) => setActiveModalVideo(v)}
      />
    </section>
  );
}
