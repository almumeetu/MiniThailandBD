"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/admin-api";
import {
  fetchPublicVideos,
  type VideoItem,
  FALLBACK_VIDEOS,
  getWhatsAppVideoLink,
} from "@/lib/video-api";
import {
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuHeart,
  LuPlay,
  LuPause,
  LuVolume2,
  LuVolumeX,
  LuX,
  LuSparkles,
} from "react-icons/lu";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa6";

export function WatchAndShopSkeleton() {
  return (
    <section aria-label="Watch & Shop Loading" className="w-full bg-white text-zinc-900 py-12 sm:py-16 relative">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div className="h-8 sm:h-9 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-28 bg-neutral-200 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-neutral-200 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4 sm:gap-5 overflow-x-hidden pt-6 pb-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[78vw] sm:w-[270px] md:w-[290px] lg:w-[310px] aspect-[9/16] bg-neutral-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WatchAndShop() {
  const [videos, setVideos] = useState<VideoItem[]>(FALLBACK_VIDEOS);
  const [loading, setLoading] = useState(true);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  // In-place inline player state
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

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

  // Carousel navigation arrows
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Handle clicking a video card to play directly in-place
  const handleCardClick = (video: VideoItem) => {
    if (playingVideoId === video.id) {
      // Toggle play / pause on the active playing video
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
      // Switch active playing video to this card inline
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

  if (loading && (!videos || videos.length === 0)) {
    return <WatchAndShopSkeleton />;
  }

  return (
    <section
      aria-label="Mini Thailand Facebook Reels & Stories"
      className="w-full bg-white text-zinc-900 py-12 sm:py-16 relative select-none"
    >
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.16em] text-zinc-950 uppercase">
              WATCH &amp; SHOP REELS
            </h2>
          </div>

          {/* Header Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Follow on Facebook Button */}
            <Link
              href="https://www.facebook.com/minithailand2022/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white px-4 py-2 text-xs font-semibold tracking-wide text-zinc-800 transition-all duration-300 shadow-2xs active:scale-95 cursor-pointer"
            >
              <FaFacebookF className="h-3 w-3" />
              <span>Facebook Page</span>
            </Link>

            {/* View All Videos Button */}
            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white hover:bg-black hover:border-black hover:text-white px-4 py-2 text-xs font-semibold tracking-wide text-zinc-800 transition-all duration-300 shadow-2xs"
            >
              <span>Explore All</span>
              <LuArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Circular Carousel Chevrons */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                aria-label="Previous reels"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer shadow-xs active:scale-90"
              >
                <LuChevronLeft className="h-4 w-4 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                aria-label="Next reels"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer shadow-xs active:scale-90"
              >
                <LuChevronRight className="h-4 w-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Reels Carousel Track ── */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pt-6 pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((item) => {
            const isPlayingThis = playingVideoId === item.id;
            const isHovered = hoveredVideoId === item.id;
            const canPreviewHover = Boolean(item.videoUrl) && !isPlayingThis;

            const whatsappLink = getWhatsAppVideoLink(
              item.product?.name || item.title,
              undefined,
              item.title,
              item.facebookUrl || undefined
            );

            return (
              <article
                key={item.id}
                onMouseEnter={() => setHoveredVideoId(item.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                className="group relative shrink-0 w-[78vw] sm:w-[270px] md:w-[290px] lg:w-[310px] snap-start"
              >
                {/* 9:16 Portrait Reel Card */}
                <div
                  onClick={() => handleCardClick(item)}
                  className={`relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-none bg-zinc-950 border transition-all duration-300 shadow-md ${
                    isPlayingThis
                      ? "ring-2 ring-[#ec1c67] border-[#ec1c67] shadow-2xl scale-[1.01]"
                      : "border-zinc-200/90 hover:-translate-y-1 hover:shadow-xl hover:border-zinc-300"
                  }`}
                >
                  {/* Poster Thumbnail */}
                  <Image
                    src={resolveImageUrl(item.thumbnailUrl)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 290px, 310px"
                    className={`object-cover transition-transform duration-700 ease-out ${
                      isPlayingThis ? "opacity-0" : "group-hover:scale-105"
                    }`}
                    quality={92}
                    unoptimized={item.thumbnailUrl.startsWith("http")}
                  />

                  {/* Desktop Video Autoplay on Hover (When Not Actively Clicked) */}
                  {canPreviewHover && isHovered && (
                    <video
                      src={item.videoUrl!}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                    />
                  )}

                  {/* ── IN-PLACE ACTIVE VIDEO PLAYER ── */}
                  {isPlayingThis && (
                    <div className="absolute inset-0 z-20 flex flex-col justify-between bg-black">
                      {Boolean(item.videoUrl) ? (
                        <video
                          ref={activeVideoRef}
                          src={item.videoUrl!}
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

                      {/* Top Overlay Controls Bar */}
                      <div className="relative z-30 p-3.5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-[#ec1c67] animate-pulse" />
                          <span>Playing</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Audio Toggle */}
                          {Boolean(item.videoUrl) && (
                            <button
                              type="button"
                              onClick={handleToggleMute}
                              aria-label={isMuted ? "Unmute" : "Mute"}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-colors cursor-pointer shadow-md"
                            >
                              {isMuted ? (
                                <LuVolumeX className="w-4 h-4 text-rose-300" />
                              ) : (
                                <LuVolume2 className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Stop / Close In-Place Player */}
                          <button
                            type="button"
                            onClick={handleStopInlinePlay}
                            aria-label="Close reel"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-colors cursor-pointer shadow-md"
                          >
                            <LuX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Center Play/Pause Indicator (shown when paused) */}
                      {!isPlaying && Boolean(item.videoUrl) && (
                        <div className="relative z-30 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/30 shadow-2xl pointer-events-none">
                          <LuPlay className="w-7 h-7 translate-x-0.5 fill-current" />
                        </div>
                      )}

                      {/* Bottom Info + WhatsApp Order Button */}
                      <div className="relative z-30 p-3.5 space-y-2 bg-gradient-to-t from-black via-black/60 to-transparent">
                        {/* Progress Bar */}
                        {Boolean(item.videoUrl) && (
                          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${progress}%` }}
                              className="h-full bg-[#ec1c67] transition-all"
                            />
                          </div>
                        )}

                        <p className="text-xs font-semibold text-white line-clamp-1">
                          {item.title}
                        </p>

                        <div className="flex items-center gap-2 pt-0.5">
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                          >
                            <FaWhatsapp className="w-3.5 h-3.5" />
                            <span>Order on WhatsApp</span>
                          </a>

                          {item.product && (
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white/90 hover:bg-white text-zinc-950 text-[11px] font-bold uppercase tracking-wider transition-all shadow-md"
                            >
                              <span>View</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── IDLE / POSTER STATE OVERLAYS (When not actively playing) ── */}
                  {!isPlayingThis && (
                    <>
                      {/* Subtle Bottom Vignette */}
                      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                      {/* Center Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/40 backdrop-blur-md text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#ec1c67] group-hover:border-[#ec1c67]">
                          <LuPlay className="h-5 w-5 translate-x-0.5 fill-current" />
                        </span>
                      </div>

                      {/* Bottom Information */}
                      <div className="absolute inset-x-0 bottom-0 p-4 space-y-1.5 z-10">
                        {/* View & Like Counter */}
                        <div className="flex items-center gap-3 text-[11px] text-white/90 font-medium">
                          {item.views && (
                            <span className="flex items-center gap-1">
                              <LuEye className="h-3 w-3 text-white/80" />
                              <span>{item.views}</span>
                            </span>
                          )}
                          {item.likes && (
                            <span className="flex items-center gap-1">
                              <LuHeart className="h-3 w-3 text-rose-400 fill-rose-400" />
                              <span>{item.likes}</span>
                            </span>
                          )}
                        </div>

                        {/* Reel Title */}
                        <h3 className="text-xs sm:text-[13px] font-semibold text-white line-clamp-2 leading-snug drop-shadow-md">
                          {item.title}
                        </h3>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
