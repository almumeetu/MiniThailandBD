"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/admin-api";
import { fetchVideosForProduct, type VideoItem } from "@/lib/video-api";
import {
  LuPlay,
  LuSparkles,
  LuEye,
  LuHeart,
  LuFilm,
  LuVolume2,
  LuVolumeX,
  LuX,
} from "react-icons/lu";
import { FaFacebookF } from "react-icons/fa6";

interface ProductVideoStripProps {
  productId: string;
}

export default function ProductVideoStrip({ productId }: ProductVideoStripProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function load() {
      if (!productId) return;
      try {
        const data = await fetchVideosForProduct(productId);
        setVideos(data || []);
      } catch (err) {
        console.warn("Failed to load product videos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  // If no videos attached to this product, don't show the strip
  if (!loading && videos.length === 0) {
    return null;
  }

  const handleCardClick = (vid: VideoItem) => {
    if (playingId === vid.id) {
      if (activeVideoRef.current) {
        if (activeVideoRef.current.paused) {
          activeVideoRef.current.play();
        } else {
          activeVideoRef.current.pause();
        }
      }
    } else {
      setPlayingId(vid.id);
    }
  };

  const handleStopPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeVideoRef.current) {
      activeVideoRef.current.pause();
    }
    setPlayingId(null);
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

  return (
    <div className="w-full my-6 sm:my-8 rounded-2xl bg-gradient-to-r from-[#1c0211] via-[#2d051c] to-[#16000c] p-4 sm:p-5 text-white border border-rose-950/60 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-store-primary text-white shadow-xs">
            <LuPlay className="h-4 w-4 translate-x-0.5" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Watch It in Action
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.2 text-[10px] font-bold text-rose-300">
                <LuSparkles className="h-2.5 w-2.5" />
                <span>Reel</span>
              </span>
            </div>
            <p className="text-[11px] text-rose-200/80">
              See how this outfit drapes, fits, and looks in real motion.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-rose-300/80">
          {videos.length} {videos.length === 1 ? "Video" : "Videos"} Available
        </span>
      </div>

      {/* Video Cards Grid/Carousel with In-Place Playback */}
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {videos.map((vid) => {
          const isPlayingThis = playingId === vid.id;

          return (
            <div
              key={vid.id}
              onClick={() => handleCardClick(vid)}
              className={`group relative shrink-0 w-36 sm:w-44 aspect-[9/16] cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border transition-all duration-300 shadow-md ${
                isPlayingThis
                  ? "ring-2 ring-rose-500 border-rose-500 scale-105 z-20"
                  : "border-rose-900/40 hover:scale-105 hover:border-rose-500/60"
              }`}
            >
              {/* Poster Thumbnail */}
              {vid.thumbnailUrl && (
                <Image
                  src={resolveImageUrl(vid.thumbnailUrl)}
                  alt={vid.title}
                  fill
                  quality={90}
                  sizes="(max-width: 640px) 144px, 176px"
                  className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                    isPlayingThis ? "opacity-0" : ""
                  }`}
                  unoptimized={resolveImageUrl(vid.thumbnailUrl).startsWith("http")}
                />
              )}

              {/* In-Place Video Playback */}
              {isPlayingThis ? (
                <div className="absolute inset-0 z-20 bg-black flex flex-col justify-between">
                  {Boolean(vid.videoUrl) ? (
                    <video
                      ref={activeVideoRef}
                      src={resolveImageUrl(vid.videoUrl) || vid.videoUrl!}
                      autoPlay
                      playsInline
                      muted={isMuted}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : vid.facebookUrl ? (
                    <iframe
                      src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                        vid.facebookUrl
                      )}&show_text=false&autoplay=1&width=400`}
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

                  {/* Top Bar Controls */}
                  <div className="relative z-30 p-2 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                    {Boolean(vid.videoUrl) && (
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-colors"
                      >
                        {isMuted ? (
                          <LuVolumeX className="w-3.5 h-3.5 text-rose-300" />
                        ) : (
                          <LuVolume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStopPlay}
                      className="p-1 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-colors ml-auto"
                    >
                      <LuX className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title overlay */}
                  <div className="relative z-30 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[10px] font-semibold text-white line-clamp-1">
                      {vid.title}
                    </p>
                  </div>
                </div>
              ) : (
                /* Idle poster overlay */
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

                  {/* Play Button Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg group-hover:scale-110 group-hover:bg-store-primary transition-all">
                      <LuPlay className="h-4 w-4 translate-x-0.5 fill-current" />
                    </span>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[9px] font-medium text-white z-10">
                    <span className="rounded-full bg-black/60 px-1.5 py-0.5 backdrop-blur-xs">
                      {vid.source === "facebook" ? (
                        <FaFacebookF className="h-2 w-2 text-[#1877F2]" />
                      ) : (
                        <LuFilm className="h-2 w-2 text-rose-400" />
                      )}
                    </span>

                    {vid.durationSec > 0 && (
                      <span className="rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-zinc-300">
                        {Math.floor(vid.durationSec / 60)}:
                        {String(vid.durationSec % 60).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Bottom Caption & Views */}
                  <div className="absolute inset-x-0 bottom-0 p-2 space-y-1 z-10">
                    <div className="flex items-center gap-2 text-[9px] text-zinc-300">
                      {vid.views && (
                        <span className="flex items-center gap-0.5">
                          <LuEye className="h-2.5 w-2.5" />
                          <span>{vid.views}</span>
                        </span>
                      )}
                      {vid.likes && (
                        <span className="flex items-center gap-0.5">
                          <LuHeart className="h-2.5 w-2.5 text-rose-400" />
                          <span>{vid.likes}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-white line-clamp-2 leading-tight">
                      {vid.title}
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
