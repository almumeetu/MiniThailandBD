"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchActiveHeroCampaigns, CAMPAIGNS_UPDATED_EVENT } from "@/lib/campaign-store";
import { resolveImageUrl, type Campaign } from "@/lib/admin-api";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  bgColor?: string;
}

/**
 * Curated Arch Collection Hero Sliders using MiniThailandBD/public/images/sliders
 */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-arch-wine",
    title: "Signature Burgundy & Wine Luxury",
    subtitle: "Deep vintage wine hues, fluid evening contours & signature Bangkok atelier designs curated exclusively for you.",
    ctaText: "SHOP WINE COLLECTION",
    ctaLink: "/products?category=Party%20Gowns",
    secondaryCtaText: "WHATSAPP STYLIST",
    secondaryCtaLink: "/contact",
    image: "/images/sliders/arch-wine.webp",
    bgColor: "#181014",
  },
  {
    id: "slide-arch-purple-2",
    title: "Regal Violet & Pleated Rose Grandeur",
    subtitle: "Artisan rosette appliqués, cascading accordion pleats & signature Bangkok couture crafted for majestic celebrations.",
    ctaText: "SHOP VIOLET COLLECTION",
    ctaLink: "/products?category=Party%20Gowns",
    secondaryCtaText: "VIEW COLLECTION",
    secondaryCtaLink: "/products",
    image: "/images/sliders/arch-purple-2.webp",
    bgColor: "#180829",
  },
  {
    id: "slide-arch-blue",
    title: "Royal Sapphire & Evening Drapes",
    subtitle: "Statement flowing gowns, luminous silk-touch fabrics & hand-finished Bangkok atelier details for regal celebrations.",
    ctaText: "DISCOVER SAPPHIRE",
    ctaLink: "/products?category=Party%20Gowns",
    secondaryCtaText: "NEW ARRIVALS",
    secondaryCtaLink: "/products?sort=newest",
    image: "/images/sliders/arch-blue.webp",
    bgColor: "#101622",
  },
  {
    id: "slide-arch-maroon",
    title: "Imperial Maroon & Velvet Grandeur",
    subtitle: "Opulent festive tones, rich tactile textures & majestic silhouettes designed to turn every entrance into a moment.",
    ctaText: "SHOP MAROON EDIT",
    ctaLink: "/products?category=Party%20Gowns",
    secondaryCtaText: "VIEW COLLECTION",
    secondaryCtaLink: "/products",
    image: "/images/sliders/arch-maroon.webp",
    bgColor: "#1a1012",
  },
];

export const CAMPAIGN_IMAGES = [
  "/images/sliders/arch-wine.webp",
  "/images/sliders/arch-purple-2.webp",
  "/images/sliders/arch-blue.webp",
  "/images/sliders/arch-maroon.webp",
];

function mapCampaignToHeroSlide(c: Campaign, idx: number): HeroSlide {
  const rawImg = c.images?.[0]?.images?.[0];
  const fallbackImg = CAMPAIGN_IMAGES[idx % CAMPAIGN_IMAGES.length];
  const imgUrl = rawImg && (rawImg.startsWith("/images/campaign/") || rawImg.startsWith("/images/sliders/") || rawImg.startsWith("/images/"))
    ? rawImg
    : fallbackImg;

  return {
    id: c.id,
    title: c.title || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length]?.title || "Boutique Collection",
    subtitle: c.description || "",
    ctaText: c.ctaText || "SHOP NOW",
    ctaLink: c.linkUrl || "/products",
    secondaryCtaText: "ALL PRODUCTS",
    secondaryCtaLink: "/products",
    image: imgUrl,
    bgColor: idx % 2 === 0 ? "#12141a" : "#1a1218",
  };
}

export default function AarongHeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isAdvancingRef = useRef<boolean>(false);

  const ZOOM_DURATION = 6500; // 6.5s subtle Ken Burns synchronized with slide transition

  // Touch & Pointer Swipe Handling ("হাত দিয়ে সোয়াইপ")
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const isPointerDown = useRef<boolean>(false);
  const draggedFar = useRef<boolean>(false);

  // Sync dynamic slides from API / localStorage
  const syncSlides = useCallback(async () => {
    try {
      const activeCampaigns = await fetchActiveHeroCampaigns();
      if (activeCampaigns && activeCampaigns.length > 0) {
        const mapped = activeCampaigns
          .map(mapCampaignToHeroSlide)
          .filter(
            (s) =>
              !s.image.includes("arch-black") &&
              !s.image.includes("arch-red") &&
              !s.image.includes("minit-3") &&
              !s.title.toLowerCase().includes("midnight noir") &&
              !s.title.toLowerCase().includes("black edition") &&
              !s.title.toLowerCase().includes("scarlet") &&
              !s.title.toLowerCase().includes("luxury velvet & evening")
          );
        if (mapped.length > 0) {
          setSlides(mapped);
          setCurrent((prev) => (prev >= mapped.length ? 0 : prev));
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to sync hero slides:", err);
    }
    setSlides(DEFAULT_HERO_SLIDES);
  }, []);

  useEffect(() => {
    syncSlides();

    const handleUpdate = () => syncSlides();
    window.addEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    };
  }, [syncSlides]);

  const handlePrev = useCallback(() => {
    if (slides.length <= 1 || isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 600);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    if (slides.length <= 1 || isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setCurrent((prev) => (prev + 1) % slides.length);
    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 600);
  }, [slides.length]);

  // Transition to next slide exactly when the zoom-in finishes
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setTimeout(() => {
      handleNext();
    }, ZOOM_DURATION);
    return () => clearTimeout(timer);
  }, [current, isPaused, slides.length, handleNext, ZOOM_DURATION]);

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    draggedFar.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      draggedFar.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - (touchStartY.current || 0);

    // If horizontal swipe > 35px and more horizontal than vertical
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setTimeout(() => {
      draggedFar.current = false;
    }, 60);
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    draggedFar.current = false;
  };

  // Pointer / Mouse Drag handlers for desktop drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // Touch is handled by touch events
    if (e.button !== 0) return; // Only left-click
    isPointerDown.current = true;
    setIsPaused(true);
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    draggedFar.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null) return;
    const diffX = e.clientX - pointerStartX.current;
    if (Math.abs(diffX) > 10) {
      draggedFar.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null) return;
    const diffX = e.clientX - pointerStartX.current;
    const diffY = e.clientY - (pointerStartY.current || 0);

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    isPointerDown.current = false;
    setIsPaused(false);
    pointerStartX.current = null;
    pointerStartY.current = null;
    setTimeout(() => {
      draggedFar.current = false;
    }, 60);
  };

  const handlePointerCancel = () => {
    isPointerDown.current = false;
    setIsPaused(false);
    pointerStartX.current = null;
    pointerStartY.current = null;
    draggedFar.current = false;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    if (draggedFar.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      aria-label="Hero Highlights"
      className="relative w-full h-[55vh] min-h-[420px] max-h-[520px] sm:h-[56vw] sm:min-h-[520px] sm:max-h-[820px] overflow-hidden bg-zinc-950 select-none group touch-pan-y cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
    >
      {/* Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide.id || `slide-${idx}`}
            style={{ backgroundColor: slide.bgColor || "#080808" }}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
            }`}
          >
            {/* Background Image with slow cinematic Ken Burns zoom */}
            <div className="relative w-full h-full overflow-hidden">
              <div
                key={isActive ? `zoom-active-${slide.id}-${current}` : `zoom-idle-${slide.id}`}
                className={`absolute inset-0 w-full h-full will-change-transform ${
                  isActive ? "animate-hero-ken-burns" : "scale-[1.02] transition-transform duration-1000 ease-out"
                }`}
                style={
                  isActive
                    ? {
                        animationDuration: `${ZOOM_DURATION}ms`,
                        animationPlayState: isPaused ? "paused" : "running",
                      }
                    : undefined
                }
                onAnimationEnd={(e) => {
                  if (e.target === e.currentTarget && isActive && slides.length > 1) {
                    handleNext();
                  }
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  quality={95}
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover object-[center_top] pointer-events-none select-none"
                />
              </div>

              {/* Vignette & contrast gradients: behind text (z-10), keeps header and centered text readable */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/85 pointer-events-none z-10" />

              {/* Editorial Text & CTA Overlay: vertically and horizontally centered in responsive */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 lg:px-20 pt-16 sm:pt-20 pb-4 sm:pb-8 pointer-events-none">
                <div
                  key={isActive ? `content-${slide.id}-${current}` : `content-${slide.id}-idle`}
                  className="max-w-2xl space-y-2 sm:space-y-3.5 flex flex-col items-center pointer-events-auto"
                >
                  {/* Headline */}
                  <h1
                    className={`text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-snug sm:leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] max-w-[310px] sm:max-w-xl ${
                      isActive ? "animate-hero-title" : "opacity-0"
                    }`}
                  >
                    {slide.title}
                  </h1>

                  {/* Subtitle / Description */}
                  {slide.subtitle && (
                    <p
                      className={`text-[11.5px] sm:text-sm md:text-base text-white/95 font-medium leading-relaxed max-w-[290px] sm:max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] line-clamp-2 px-2 sm:px-0 ${
                        isActive ? "animate-hero-desc" : "opacity-0"
                      }`}
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  {/* CTA Buttons */}
                  <div
                    className={`pt-1.5 sm:pt-3 flex items-center justify-center gap-2 sm:gap-3.5 flex-wrap ${
                      isActive ? "animate-hero-btn" : "opacity-0"
                    }`}
                  >
                    <Link
                      href={slide.ctaLink}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      className="inline-flex items-center justify-center gap-1.5 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white text-zinc-950 hover:bg-amber-400 hover:text-zinc-950 active:scale-95 text-[11px] sm:text-xs md:text-sm font-black tracking-[0.14em] uppercase transition-all duration-200 shadow-2xl group/btn cursor-pointer"
                    >
                      <span>{slide.ctaText}</span>
                      <span className="transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
                    </Link>

                    {slide.secondaryCtaText && (
                      <Link
                        href={slide.secondaryCtaLink || "/products"}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-black/40 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/35 text-white text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer shadow-lg"
                      >
                        {slide.secondaryCtaText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 2 Clean Desktop Navigation Buttons (Smooth hover on desktop, touch swipe on mobile) */}
      {slides.length > 1 && (
        <>
          {/* Left Navigation Button - Hidden on mobile/tablets (< md) to avoid text collision, shown on desktop hover */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-35 w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-full bg-black/50 hover:bg-white text-white hover:text-zinc-950 border border-white/30 hover:border-white shadow-2xl backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-3 pointer-events-auto transition-all duration-300 ease-out hover:scale-108 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white group/navbtn"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 -translate-x-0.5 transition-transform duration-200 group-hover/navbtn:-translate-x-1 stroke-[2.2]" />
          </button>

          {/* Right Navigation Button - Hidden on mobile/tablets (< md) to avoid text collision, shown on desktop hover */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Next slide"
            className="hidden md:flex absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-35 w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-full bg-black/50 hover:bg-white text-white hover:text-zinc-950 border border-white/30 hover:border-white shadow-2xl backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-3 pointer-events-auto transition-all duration-300 ease-out hover:scale-108 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white group/navbtn"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 translate-x-0.5 transition-transform duration-200 group-hover/navbtn:translate-x-1 stroke-[2.2]" />
          </button>
        </>
      )}

      {/* Simple & Clean Pagination Indicators (Centered at bottom with safe mobile height) */}
      {slides.length > 1 && (
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="absolute bottom-2.5 sm:bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2.5"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (current !== i && !isAdvancingRef.current) {
                  isAdvancingRef.current = true;
                  setCurrent(i);
                  setTimeout(() => {
                    isAdvancingRef.current = false;
                  }, 600);
                }
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer drop-shadow ${
                i === current
                  ? "w-6 sm:w-9 bg-white shadow-md"
                  : "w-2 sm:w-2.5 bg-white/45 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
