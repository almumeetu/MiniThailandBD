"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/admin-api";
import {
  fetchPublicVideos,
  type VideoItem,
  type VideoType,
  FALLBACK_VIDEOS,
  getWhatsAppVideoLink,
} from "@/lib/video-api";
import {
  LuEye,
  LuHeart,
  LuPlay,
  LuPause,
  LuSearch,
  LuSparkles,
  LuVolume2,
  LuVolumeX,
  LuX,
  LuFilm,
  LuRefreshCw,
  LuExternalLink,
} from "react-icons/lu";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa6";

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

  // In-place inline video playback states
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

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

  // Card click: plays inline on the card
  const handleCardClick = (video: VideoItem) => {
    if (playingVideoId === video.id) {
      if (activeVideoRef.current) {
        if (activeVideoRef.current.paused) {
          activeVideoRef.current.play();
          setIsPlaying(true);
        } else {
          activeVideoRef.current.pause();
          setIsPlaying(false);
        }
      }
    } else {
      setPlayingVideoId(video.id);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleStopInlinePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeVideoRef.current) {
      activeVideoRef.current.pause();
    }
    setPlayingVideoId(null);
    setIsPlaying(false);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeVideoRef.current) {
      activeVideoRef.current.muted = !activeVideoRef.current.muted;
      setIsMuted(activeVideoRef.current.muted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const handleTimeUpdate = () => {
    if (!activeVideoRef.current) return;
    const curr = activeVideoRef.current.currentTime;
    const dur = activeVideoRef.current.duration || 1;
    setProgress((curr / dur) * 100);
  };

  return (
    <div className="min-h-screen bg-store-page">
      {/* ── Page Hero Header ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1b0212] via-[#240417] to-store-page text-white pt-12 pb-16 px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(225,29,72,0.15),transparent_60%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-950/80 border border-rose-800/60 px-4 py-1 text-xs font-bold uppercase tracking-wider text-rose-300">
            <LuSparkles className="h-3.5 w-3.5 text-rose-400" />
            <span>Mini Thailand Video &amp; Reels Showcase</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white">
            Watch &amp; Shop Trending Outfits
          </h1>

          <p className="text-sm sm:text-base text-rose-200/80 max-w-2xl mx-auto font-sans leading-relaxed">
            আমাদের ফেসবুক পেজ ও লাইভের জনপ্রিয় ড্রেস, থাই কর্ড সেট, পার্টি গাউন ও আবায়া কালেকশন একনজরে দেখুন এবং ভিডিও থেকেই সরাসরি অর্ডার করুন।
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

        {/* ── Video Grid with IN-PLACE Inline Playback ── */}
        {loading && videos.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8" style={{ perspective: '1500px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const rotations = [-6, -2, 2, 6];
              const tiltAngle = rotations[i % 4];
              const yOffsets = [0, 20, 10, 25];
              const yOffset = yOffsets[i % 4];
              
              return (
                <div
                  key={i}
                  className="aspect-[9/16] rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 animate-pulse shadow-xl"
                  style={{
                    transform: `translateY(${yOffset}px) rotate(${tiltAngle}deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                />
              );
            })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 lg:gap-12" style={{ perspective: '1500px' }}>
            {videos.map((item, idx) => {
              const isPlayingThis = playingVideoId === item.id;
              const isHovered = hoveredId === item.id;
              const canPreviewHover = Boolean(item.videoUrl) && !isPlayingThis;

              // Tilt angles for idle cards
              const rotations = [-6, -2, 2, 6];
              const tiltAngle = rotations[idx % 4];
              const yOffsets = [0, 20, 10, 25];
              const yOffset = yOffsets[idx % 4];

              const whatsappLink = getWhatsAppVideoLink(
                item.product?.name || item.title,
                undefined,
                item.title,
                item.facebookUrl || undefined
              );

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleCardClick(item)}
                  className={`group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl transition-all duration-500 ${
                    isPlayingThis
                      ? "ring-4 ring-[#ec1c67] shadow-[0_30px_70px_-15px_rgba(225,29,72,0.6)] z-30"
                      : "hover:shadow-[0_30px_70px_-15px_rgba(225,29,72,0.4)]"
                  }`}
                  style={{
                    transform: isPlayingThis
                      ? `translateY(-15px) rotate(0deg) scale(1.05) translateZ(60px)`
                      : isHovered
                      ? `translateY(-20px) rotate(0deg) scale(1.06) translateZ(40px)`
                      : `translateY(${yOffset}px) rotate(${tiltAngle}deg) scale(1) translateZ(0px)`,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                  }}
                >
                  {/* Glowing border effect on hover or play */}
                  <div
                    className={`absolute -inset-[3px] bg-gradient-to-br from-rose-500 via-purple-500 to-blue-500 blur-md transition-opacity duration-700 -z-10 ${
                      isPlayingThis ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />

                  {/* Thumbnail Poster */}
                  <Image
                    src={resolveImageUrl(item.thumbnailUrl)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-all duration-700 ${
                      isPlayingThis ? "opacity-0" : "group-hover:scale-105"
                    }`}
                    quality={95}
                    unoptimized={resolveImageUrl(item.thumbnailUrl).startsWith("http")}
                  />

                  {/* Desktop Hover Video Preview (when not clicked) */}
                  {canPreviewHover && isHovered && (
                    <video
                      src={resolveImageUrl(item.videoUrl) || item.videoUrl!}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 z-[1]"
                    />
                  )}

                  {/* ── IN-PLACE ACTIVE VIDEO PLAYBACK ── */}
                  {isPlayingThis ? (
                    <div className="absolute inset-0 z-20 flex flex-col justify-between bg-black">
                      {Boolean(item.videoUrl) ? (
                        <video
                          ref={activeVideoRef}
                          src={resolveImageUrl(item.videoUrl) || item.videoUrl!}
                          autoPlay
                          playsInline
                          muted={isMuted}
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={() => setIsPlaying(false)}
                          className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                        />
                      ) : item.facebookUrl ? (
                        <iframe
                          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                            item.facebookUrl
                          )}&show_text=false&autoplay=1&width=500`}
                          width="100%"
                          height="100%"
                          style={{ border: "none", overflow: "hidden" }}
                          scrolling="no"
                          frameBorder="0"
                          allowFullScreen={true}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          className="w-full h-full object-cover"
                        />
                      ) : null}

                      {/* Playing Top Header Bar */}
                      <div className="relative z-30 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-[#ec1c67] animate-pulse" />
                          <span>Playing Now</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Audio Toggle */}
                          {Boolean(item.videoUrl) && (
                            <button
                              type="button"
                              onClick={handleToggleMute}
                              aria-label={isMuted ? "Unmute" : "Mute"}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-colors cursor-pointer shadow-lg"
                            >
                              {isMuted ? (
                                <LuVolumeX className="w-4 h-4 text-rose-300" />
                              ) : (
                                <LuVolume2 className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Close / Stop Inline Playback */}
                          <button
                            type="button"
                            onClick={handleStopInlinePlay}
                            aria-label="Close video"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-colors cursor-pointer shadow-lg"
                          >
                            <LuX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Paused Center Indicator */}
                      {!isPlaying && Boolean(item.videoUrl) && (
                        <div className="relative z-30 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/30 shadow-2xl pointer-events-none">
                          <LuPlay className="w-8 h-8 translate-x-1 fill-current" />
                        </div>
                      )}

                      {/* Playing Bottom Bar: Progress & WhatsApp Action */}
                      <div className="relative z-30 p-4 sm:p-5 space-y-3 bg-gradient-to-t from-black via-black/70 to-transparent">
                        {Boolean(item.videoUrl) && (
                          <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${progress}%` }}
                              className="h-full bg-gradient-to-r from-rose-500 to-[#ec1c67] transition-all"
                            />
                          </div>
                        )}

                        <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 drop-shadow-md">
                          {item.title}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                            <span>Order on WhatsApp</span>
                          </a>

                          {item.product && (
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center py-2.5 px-3 rounded-2xl bg-white/90 hover:bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                            >
                              <span>View</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── IDLE POSTER OVERLAYS ── */
                    <>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none z-[2]" />

                      {/* Top Badges */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-10">
                        {item.isFeatured ? (
                          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 px-3 py-1.5 text-[10px] font-extrabold uppercase text-white shadow-lg backdrop-blur-sm">
                            <LuSparkles className="h-3 w-3 animate-pulse" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="rounded-2xl bg-black/70 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-white border border-white/20 shadow-lg">
                            {item.type === "reel" ? "🎬 Reel" : "📹 Video"}
                          </span>
                        )}

                        {item.durationSec > 0 && (
                          <span className="rounded-2xl bg-black/80 backdrop-blur-md px-2.5 py-1.5 text-[10px] font-mono font-bold text-white border border-white/20 shadow-lg">
                            {Math.floor(item.durationSec / 60)}:
                            {String(item.durationSec % 60).padStart(2, "0")}
                          </span>
                        )}
                      </div>

                      {/* Center Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping opacity-0 group-hover:opacity-100" />
                          <span className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/25 backdrop-blur-lg text-white border-2 border-white/40 shadow-2xl transition-all duration-500 group-hover:scale-125 group-hover:bg-gradient-to-br group-hover:from-rose-600 group-hover:to-pink-600 group-hover:border-white/60">
                            <LuPlay className="h-6 w-6 sm:h-8 sm:w-8 translate-x-1 fill-current drop-shadow-lg" />
                          </span>
                        </div>
                      </div>

                      {/* Bottom Content */}
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-3 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-white/90">
                          {item.views && (
                            <span className="flex items-center gap-1.5 font-semibold bg-black/50 backdrop-blur-sm rounded-xl px-2.5 py-1 border border-white/10">
                              <LuEye className="h-3.5 w-3.5 text-blue-400" />
                              <span>{item.views.toLocaleString()}</span>
                            </span>
                          )}
                          {item.likes && (
                            <span className="flex items-center gap-1.5 font-semibold bg-black/50 backdrop-blur-sm rounded-xl px-2.5 py-1 border border-white/10">
                              <LuHeart className="h-3.5 w-3.5 text-rose-400" />
                              <span>{item.likes.toLocaleString()}</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">
                          {item.caption || item.title}
                        </p>
                      </div>
                    </>
                  )}
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
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition-all shadow-sm cursor-pointer"
            >
              {loading && <LuRefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>Load More Videos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
