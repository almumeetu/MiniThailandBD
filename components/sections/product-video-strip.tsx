"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/admin-api";
import { fetchVideosForProduct, type VideoItem } from "@/lib/video-api";
import VideoPlayerModal from "./video-player-modal";
import {
  LuPlay,
  LuSparkles,
  LuEye,
  LuHeart,
  LuFilm,
} from "react-icons/lu";
import { FaFacebookF } from "react-icons/fa6";

interface ProductVideoStripProps {
  productId: string;
}

export default function ProductVideoStrip({ productId }: ProductVideoStripProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      {/* Video Cards Grid/Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {videos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => {
              setActiveVideo(vid);
              setIsModalOpen(true);
            }}
            className="group relative shrink-0 w-36 sm:w-44 aspect-[9/16] cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-rose-900/40 shadow-md transition-all duration-300 hover:scale-105 hover:border-rose-500/60"
          >
            {vid.thumbnailUrl && (
              <Image
                src={resolveImageUrl(vid.thumbnailUrl)}
                alt={vid.title}
                fill
                sizes="(max-width: 640px) 144px, 176px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={vid.thumbnailUrl.startsWith("http")}
              />
            )}

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
          </div>
        ))}
      </div>

      {/* Modal Player */}
      <VideoPlayerModal
        video={activeVideo}
        videoList={videos}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectVideo={(v) => setActiveVideo(v)}
      />
    </div>
  );
}
