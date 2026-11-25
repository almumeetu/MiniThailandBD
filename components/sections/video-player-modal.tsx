"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/admin-api";
import { type VideoItem, getWhatsAppVideoLink } from "@/lib/video-api";
import { useCart } from "@/app/_providers/cart-provider";
import { toast } from "sonner";
import {
  LuChevronDown,
  LuChevronUp,
  LuEye,
  LuHeart,
  LuLink,
  LuPause,
  LuPlay,
  LuShare2,
  LuShoppingBag,
  LuVolume2,
  LuVolumeX,
  LuX,
  LuExternalLink,
  LuSparkles,
} from "react-icons/lu";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa6";

interface VideoPlayerModalProps {
  video: VideoItem | null;
  videoList?: VideoItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo?: (video: VideoItem) => void;
}

export default function VideoPlayerModal({
  video,
  videoList = [],
  isOpen,
  onClose,
  onSelectVideo,
}: VideoPlayerModalProps) {
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(video);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const { addItem, openBag } = useCart();

  // Sync current video when prop changes
  useEffect(() => {
    if (video) {
      setCurrentVideo(video);
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);

      // Default variant
      if (video.product?.variants?.length) {
        const def =
          video.product.variants.find((v) => v.isDefault) ||
          video.product.variants[0];
        setSelectedVariantId(def?.id || "");
      } else {
        setSelectedVariantId("");
      }

      // Update URL deep link
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("video", video.id);
        window.history.pushState({ videoId: video.id }, "", url.toString());
      }
    }
  }, [video]);

  // Current index in videoList
  const currentIndex = videoList.findIndex((v) => v.id === currentVideo?.id);
  const hasNext = currentIndex < videoList.length - 1;
  const hasPrev = currentIndex > 0;

  const goToNext = useCallback(() => {
    if (hasNext && videoList[currentIndex + 1]) {
      const nextVid = videoList[currentIndex + 1];
      setCurrentVideo(nextVid);
      onSelectVideo?.(nextVid);
    }
  }, [hasNext, currentIndex, videoList, onSelectVideo]);

  const goToPrev = useCallback(() => {
    if (hasPrev && videoList[currentIndex - 1]) {
      const prevVid = videoList[currentIndex - 1];
      setCurrentVideo(prevVid);
      onSelectVideo?.(prevVid);
    }
  }, [hasPrev, currentIndex, videoList, onSelectVideo]);

  // Handle close and clear URL deep link
  const handleClose = useCallback(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("video");
      window.history.pushState({}, "", url.toString());
    }
    onClose();
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation & space play/pause
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === "m") {
        toggleMute();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, goToNext, goToPrev]);

  // HTML5 Video event listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(curr);
    setDuration(dur);
    setProgress((curr / dur) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * (videoRef.current.duration || 1);
    videoRef.current.currentTime = newTime;
    setProgress(pos * 100);
  };

  // Mobile touch swipe gestures (TikTok / Reels style)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    setTouchStartY(null);

    // Swipe up = next, swipe down = prev
    if (diff > 50 && hasNext) {
      goToNext();
    } else if (diff < -50 && hasPrev) {
      goToPrev();
    }
  };

  // Add to cart action
  const handleAddToCart = async () => {
    if (!currentVideo?.product) return;
    const prod = currentVideo.product;
    const variant =
      prod.variants?.find((v) => v.id === selectedVariantId) ||
      prod.variants?.[0];

    setIsAddingToCart(true);
    try {
      const priceNum = variant?.price ? Number(variant.price) : 0;
      const imageUrl =
        prod.media?.[0]?.media?.url || currentVideo.thumbnailUrl;

      await addItem({
        id: prod.id,
        productId: prod.id,
        variantId: variant?.id || "",
        slug: prod.slug,
        name: prod.name,
        price: priceNum,
        image: resolveImageUrl(imageUrl),
        quantity: 1,
      });

      openBag?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Share actions
  const handleCopyLink = () => {
    if (typeof window === "undefined" || !currentVideo) return;
    const shareUrl = `${window.location.origin}/videos?video=${currentVideo.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Video link copied to clipboard!");
    setIsShareOpen(false);
  };

  if (!isOpen || !currentVideo) return null;

  const linkedProduct = currentVideo.product;
  const activeVariant =
    linkedProduct?.variants?.find((v) => v.id === selectedVariantId) ||
    linkedProduct?.variants?.[0];
  const productPrice = activeVariant?.price
    ? Number(activeVariant.price)
    : undefined;

  const whatsappLink = linkedProduct
    ? getWhatsAppVideoLink(
        linkedProduct.name,
        productPrice,
        currentVideo.title,
        currentVideo.facebookUrl ||
          `${typeof window !== "undefined" ? window.location.origin : ""}/videos?video=${currentVideo.id}`,
      )
    : getWhatsAppVideoLink(
        currentVideo.title,
        undefined,
        currentVideo.title,
        currentVideo.facebookUrl || undefined,
      );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentVideo.title}
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button (top right) */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close modal"
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
      >
        <LuX className="h-5 w-5" />
      </button>

      {/* Up/Down Navigation Buttons (Desktop only) */}
      <div className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={goToPrev}
          aria-label="Previous video"
          className="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black disabled:opacity-20 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          <LuChevronUp className="h-6 w-6" />
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={goToNext}
          aria-label="Next video"
          className="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black disabled:opacity-20 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          <LuChevronDown className="h-6 w-6" />
        </button>
      </div>

      {/* Main Container: Video + Side Panel */}
      <div className="relative flex flex-col lg:flex-row items-center justify-center w-full h-full lg:h-[88vh] max-w-6xl mx-auto p-0 lg:p-4 gap-0 lg:gap-6 overflow-hidden">
        {/* ── Left / Center: 9:16 Video Player ── */}
        <div className="relative w-full h-full lg:h-full lg:w-[460px] lg:max-h-[800px] shrink-0 bg-black flex items-center justify-center overflow-hidden shadow-2xl border border-zinc-800">
          {Boolean(currentVideo.videoUrl) ? (
            /* Uploaded MP4 / Custom Player */
            <div className="relative w-full h-full flex items-center justify-center group">
              <video
                ref={videoRef}
                src={resolveImageUrl(currentVideo.videoUrl) || currentVideo.videoUrl || undefined}
                poster={resolveImageUrl(currentVideo.thumbnailUrl)}
                playsInline
                autoPlay
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                  if (hasNext) {
                    goToNext();
                  } else if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                }}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Play/Pause Overlay indicator on click */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-auto"
                >
                  <span className="flex h-16 w-16 items-center justify-center border border-white/40 bg-black/70 text-white shadow-xl scale-110 transition-transform">
                    <LuPlay className="h-8 w-8 translate-x-1" />
                  </span>
                </div>
              )}

              {/* Custom Player Controls (bottom bar) */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 z-20">
                {/* Progress bar (scrubbable) */}
                <div
                  onClick={handleSeek}
                  className="relative h-1.5 w-full bg-white/20 cursor-pointer hover:h-2 transition-all"
                >
                  <div
                    style={{ width: `${progress}%` }}
                    className="absolute top-0 left-0 h-full bg-store-primary transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                    >
                      {isPlaying ? (
                        <LuPause className="h-4 w-4" />
                      ) : (
                        <LuPlay className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    >
                      {isMuted ? (
                        <LuVolumeX className="h-4 w-4 text-rose-400" />
                      ) : (
                        <LuVolume2 className="h-4 w-4" />
                      )}
                    </button>

                    <span className="text-[11px] font-mono text-zinc-300">
                      {Math.floor(currentTime / 60)}:
                      {String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
                      {Math.floor(duration / 60)}:
                      {String(Math.floor(duration % 60)).padStart(2, "0")}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
                    Mini Thailand Live
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Facebook Video Embed (loaded strictly on click) */
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {currentVideo.facebookUrl ? (
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                    currentVideo.facebookUrl,
                  )}&show_text=false&width=500`}
                  width="100%"
                  height="100%"
                  style={{ border: "none", overflow: "hidden" }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-zinc-400">
                  <p>Facebook video source URL missing</p>
                </div>
              )}
            </div>
          )}

          {/* Quick source badge top left */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/10 uppercase tracking-wider">
              {currentVideo.source === "facebook" ? (
                <>
                  <FaFacebookF className="h-2.5 w-2.5 text-[#1877F2]" />
                  <span>Facebook Reel</span>
                </>
              ) : (
                <>
                  <LuPlay className="h-2.5 w-2.5 text-store-primary" />
                  <span>Watch In Action</span>
                </>
              )}
            </span>

            {currentVideo.isFeatured && (
              <span className="inline-flex items-center gap-1 bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                <LuSparkles className="h-2.5 w-2.5" />
                <span>HOT HIT</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Right: Side Panel (Desktop) / Bottom Sheet (Mobile) ── */}
        <div className="relative flex flex-col justify-between w-full lg:w-[420px] max-h-[46vh] lg:max-h-[800px] lg:h-full bg-zinc-950/95 lg:bg-zinc-950/80 backdrop-blur-xl border-t lg:border border-zinc-800/90 p-5 lg:p-6 text-white shadow-2xl overflow-y-auto">
          {/* Header & Captions */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {currentVideo.title}
                </h2>
                <div className="flex items-center gap-3 text-zinc-400 text-xs">
                  {currentVideo.views && (
                    <span className="flex items-center gap-1">
                      <LuEye className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{currentVideo.views} views</span>
                    </span>
                  )}
                  {currentVideo.likes && (
                    <span className="flex items-center gap-1">
                      <LuHeart className="h-3.5 w-3.5 text-rose-500" />
                      <span>{currentVideo.likes} likes</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Share Menu Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsShareOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center border border-white/20 bg-white/10 hover:bg-white hover:text-black text-white transition-colors cursor-pointer"
                  title="Share Video"
                >
                  <LuShare2 className="h-4 w-4" />
                </button>

                {isShareOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50 text-xs space-y-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-white/10 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <LuLink className="h-3.5 w-3.5" />
                      <span>Copy link</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${currentVideo.title} - ${typeof window !== "undefined" ? window.location.href : ""}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-emerald-400 hover:bg-emerald-500/10 text-left transition-colors"
                    >
                      <FaWhatsapp className="h-3.5 w-3.5" />
                      <span>Share on WhatsApp</span>
                    </a>
                    {currentVideo.facebookUrl && (
                      <a
                        href={currentVideo.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-blue-400 hover:bg-blue-500/10 text-left transition-colors"
                      >
                        <FaFacebookF className="h-3 w-3" />
                        <span>Open on Facebook</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bengali & English caption */}
            {currentVideo.caption && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-24 overflow-y-auto pr-1">
                {currentVideo.caption}
              </p>
            )}

            {currentVideo.facebookUrl && (
              <a
                href={currentVideo.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
              >
                <FaFacebookF className="h-3 w-3" />
                <span>Watch original reel on Facebook</span>
                <LuExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Linked Product Card & Checkout Actions */}
          <div className="mt-4 pt-4 border-t border-zinc-800/90 space-y-3.5">
            {linkedProduct ? (
              <div className="border border-zinc-800 bg-zinc-900/90 p-3.5 space-y-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-zinc-700 bg-zinc-800">
                    {linkedProduct.media?.[0]?.media?.url && (
                      <Image
                        src={resolveImageUrl(linkedProduct.media[0].media.url)}
                        alt={linkedProduct.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-rose-400">
                      Featured in Video
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {linkedProduct.name}
                    </h4>
                    <p className="text-sm font-extrabold text-store-primary mt-0.5">
                      {productPrice ? `৳${productPrice.toLocaleString()}` : "Price in store"}
                    </p>
                  </div>
                </div>

                {/* Variant Quick Select if available */}
                {linkedProduct.variants && linkedProduct.variants.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">
                      Select Option / Size:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedProduct.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            selectedVariantId === v.id
                              ? "bg-white text-black"
                              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          {v.sku.replace(/^MT-/, "").slice(0, 10)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* WhatsApp Direct Order */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-black transition-all shadow-md active:scale-95 text-center cursor-pointer"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <LuShoppingBag className="h-4 w-4" />
                    <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
                  </button>
                </div>

                {/* View Product Details link */}
                <div className="text-center pt-1">
                  <Link
                    href={`/products/${linkedProduct.slug}`}
                    onClick={handleClose}
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors uppercase tracking-wider font-semibold"
                  >
                    <span>View full product details</span>
                    <LuExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Fallback direct WhatsApp inquiry when no product linked */
              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3 px-4 text-xs font-bold uppercase tracking-wider text-black transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
