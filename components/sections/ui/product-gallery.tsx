'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoExpandOutline,
} from 'react-icons/io5';
import ImageLightbox from './image-lightbox';
import { useCarouselAutoplay } from '@/app/_hooks/use-carousel-autoplay';
import CarouselPlayback from '@/components/ui/carousel-playback';

interface ProductGalleryProps {
  images: string[];
  activeImage?: string;
  productName?: string;
  productId?: string;
  productPrice?: number;
  productSlug?: string;
  category?: string;
  onBack?: () => void;
  onShare?: () => void;
}

export default function ProductGallery({
  images,
  activeImage,
  productName = 'Product',
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Sync index if activeImage changes from parent (e.g. variant color selection)
  useEffect(() => {
    if (activeImage) {
      const idx = images.indexOf(activeImage);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [activeImage, images]);

  const displayImages = images.length > 0 ? images : ['/images/no-image-icon-6.png'];
  const currentImg = displayImages[activeIndex] || displayImages[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  const playback = useCarouselAutoplay(
    galleryRef,
    () => setActiveIndex((index) => (index + 1) % displayImages.length),
    {
      enabled: displayImages.length > 1 && !lightboxOpen,
      delay: 7000,
    }
  );

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <div ref={galleryRef} className="w-full flex flex-col font-sans select-none">
        
        {/* ══════════════════════════════════════════════════════════════════
            DESKTOP GALLERY: Modern High-End Lookbook
            1. Large Main Hero Showcase Frame (rounded-2xl)
            2. Quick-Switch Thumbnails Strip (rounded-xl)
            3. Secondary Multi-Angle Grid (rounded-xl)
           ══════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col w-full space-y-3">
          
          {/* Main Hero Showcase Frame */}
          <div
            ref={imageContainerRef}
            onMouseEnter={() => {
              if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                setIsZoomed(true);
              }
            }}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => openLightboxAt(activeIndex)}
            className="relative w-full aspect-[3/4] rounded-none border border-zinc-200/90 bg-white overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-xs transition-all hover:border-rose-200 hover:shadow-md"
          >
            <div key={currentImg} className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <Image
                src={currentImg}
                alt={`${productName} view`}
                fill
                priority
                quality={95}
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-contain p-4 will-change-transform transition-transform duration-200"
                style={{
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: isZoomed ? 'scale(1.28)' : 'scale(1)',
                }}
              />
            </div>

            {displayImages.length > 1 && (
              <div
                className="absolute right-14 top-3 z-10 rounded-full bg-white/95 border border-zinc-200 shadow-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <CarouselPlayback playback={playback} label="Product images" />
              </div>
            )}

            {/* Expand Fullscreen Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightboxAt(activeIndex);
              }}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-[#ec1c67] hover:text-white text-zinc-700 flex items-center justify-center border border-zinc-200 shadow-xs transition-colors cursor-pointer"
              title="Click to Zoom Fullscreen"
              aria-label="Expand image"
            >
              <IoExpandOutline className="w-4 h-4" />
            </button>

            {/* Left / Right Flipping Arrows on Hover */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-[#ec1c67] hover:text-white text-zinc-700 flex items-center justify-center border border-zinc-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <IoChevronBackOutline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-[#ec1c67] hover:text-white text-zinc-700 flex items-center justify-center border border-zinc-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <IoChevronForwardOutline className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Counter badge */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white rounded-none shadow-sm">
                {activeIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>

          {/* Quick-Switch Thumbnail Strip */}
          {displayImages.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto py-1 storefront-scroll-track">
              {displayImages.map((img, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-16 h-20 rounded-none overflow-hidden bg-white border-2 transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'border-[#ec1c67] ring-2 ring-[#ec1c67]/20 opacity-100 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-400 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${productName} thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Secondary 2-Column Grid */}
          {displayImages.length >= 2 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {displayImages.slice(1, 3).map((img, idx) => {
                const realIdx = idx + 1;
                return (
                  <div
                    key={realIdx}
                    onClick={() => openLightboxAt(realIdx)}
                    className="relative aspect-[4/3] rounded-none overflow-hidden bg-white border border-zinc-200/90 group cursor-zoom-in flex items-center justify-center transition-all hover:border-[#ec1c67] shadow-2xs"
                  >
                    <Image
                      src={img}
                      alt={`${productName} angle ${realIdx + 1}`}
                      fill
                      sizes="(max-width: 1023px) 50vw, 25vw"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-end p-2.5">
                      <span className="w-7 h-7 rounded-full bg-white text-zinc-700 flex items-center justify-center border border-zinc-200 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <IoExpandOutline className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tertiary Full-Width Macro Detail Shot */}
          {displayImages.length >= 4 && (
            <div
              onClick={() => openLightboxAt(3)}
              className="relative w-full aspect-[16/9] rounded-none overflow-hidden bg-white border border-zinc-200/90 group cursor-zoom-in flex items-center justify-center transition-all hover:border-[#ec1c67] shadow-2xs"
            >
              <Image
                src={displayImages[3]}
                alt={`${productName} detail view`}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-end p-3">
                <span className="w-8 h-8 rounded-full bg-white text-zinc-700 flex items-center justify-center border border-zinc-200 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <IoExpandOutline className="w-4 h-4" />
                </span>
              </div>
            </div>
          )}

          {/* Remaining images in pairs */}
          {displayImages.length > 4 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {displayImages.slice(4).map((img, idx) => {
                const realIdx = idx + 4;
                return (
                  <div
                    key={realIdx}
                    onClick={() => openLightboxAt(realIdx)}
                    className="relative aspect-[4/3] rounded-none overflow-hidden bg-white border border-zinc-200/90 group cursor-zoom-in flex items-center justify-center transition-all hover:border-[#ec1c67] shadow-2xs"
                  >
                    <Image
                      src={img}
                      alt={`${productName} view ${realIdx + 1}`}
                      fill
                      sizes="(max-width: 1023px) 50vw, 25vw"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-end p-2.5">
                      <span className="w-7 h-7 rounded-full bg-white text-zinc-700 flex items-center justify-center border border-zinc-200 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <IoExpandOutline className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MOBILE GALLERY: Clean Showcase, Rounded Frame, Smooth Thumbnails
           ══════════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden w-full flex flex-col">
          
          {/* Main Mobile Frame */}
          <div
            onClick={() => openLightboxAt(activeIndex)}
            className="relative w-full aspect-[4/5] bg-white border-b border-zinc-200 overflow-hidden flex items-center justify-center cursor-zoom-in"
          >
            <Image
              src={currentImg}
              alt={`${productName} mobile view`}
              fill
              priority
              quality={95}
              sizes="100vw"
              className="object-contain p-4"
            />

            {/* Left / Right Tap Controls */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 text-zinc-800 flex items-center justify-center shadow-xs cursor-pointer z-10"
                  aria-label="Previous"
                >
                  <IoChevronBackOutline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 text-zinc-800 flex items-center justify-center shadow-xs cursor-pointer z-10"
                  aria-label="Next"
                >
                  <IoChevronForwardOutline className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Counter Badge */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-white rounded-none shadow-2xs z-10">
                {activeIndex + 1} / {displayImages.length}
              </div>
            )}

            {/* Lightbox Expand */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightboxAt(activeIndex);
              }}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 text-zinc-800 flex items-center justify-center shadow-xs cursor-pointer"
              aria-label="Expand image"
            >
              <IoExpandOutline className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Thumbnails Row */}
          {displayImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto p-3 bg-zinc-50 border-b border-zinc-200 storefront-scroll-track">
              {displayImages.map((img, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-14 h-16 rounded-none overflow-hidden bg-white border-2 transition-all shrink-0 ${
                      isActive
                        ? 'border-[#ec1c67] ring-1 ring-[#ec1c67] opacity-100'
                        : 'border-zinc-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-contain p-0.5"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Fullscreen Lightbox Modal ───────────────────────────────── */}
      <ImageLightbox
        images={displayImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        productName={productName}
      />
    </>
  );
}
