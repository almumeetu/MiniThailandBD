"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
 * 5 Default Curated Hero Sliders using MiniThailandBD/public/images/campaign
 */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-campaign-1",
    title: "Autumn & Winter Haute Couture",
    subtitle: "Imported luxury Bangkok coordinates, tailored blazers & signature boutique silhouettes for the modern woman.",
    ctaText: "EXPLORE COLLECTION",
    ctaLink: "/products?category=Cord%20Sets",
    secondaryCtaText: "ALL PRODUCTS",
    secondaryCtaLink: "/products",
    image: "/images/campaign/minit-2.webp",
    bgColor: "#12141a",
  },
  {
    id: "slide-campaign-2",
    title: "Luxury Velvet & Evening Gowns",
    subtitle: "Hand-beaded lace, opulent velvet finishes & sweeping floor-length gowns crafted for regal celebrations.",
    ctaText: "DISCOVER GOWNS",
    ctaLink: "/products?category=Party%20Gowns",
    secondaryCtaText: "NEW ARRIVALS",
    secondaryCtaLink: "/products",
    image: "/images/campaign/minit-3.webp",
    bgColor: "#1a1218",
  },
  {
    id: "slide-campaign-5",
    title: "Winter Outerwear & Velvet Edit",
    subtitle: "Statement luxury coats, warm velvet dresses & boutique essentials that turn every entrance into a moment.",
    ctaText: "SHOP WINTER EDIT",
    ctaLink: "/products?category=Winter%20Collection",
    secondaryCtaText: "SHOP ALL",
    secondaryCtaLink: "/products",
    image: "/images/campaign/minit-7.webp",
    bgColor: "#1d1416",
  },
  {
    id: "slide-slider-3",
    title: "Exclusive Bangkok Co-ord Sets",
    subtitle: "Chic premium matching sets, lightweight fabrics & contemporary Thai boutique silhouettes.",
    ctaText: "SHOP CO-ORD SETS",
    ctaLink: "/products?category=Cord%20Sets",
    secondaryCtaText: "ALL PRODUCTS",
    secondaryCtaLink: "/products",
    image: "/images/sliders/slider-3.webp",
    bgColor: "#10141b",
  },
  {
    id: "slide-slider-4",
    title: "Regal Velvet & Festive Party Wear",
    subtitle: "Intricate handcrafted embroidery, rich royal textures & timeless evening fashion curated from Bangkok.",
    ctaText: "EXPLORE PARTY WEAR",
    ctaLink: "/products?category=Party%20Gowns",
    secondaryCtaText: "NEW ARRIVALS",
    secondaryCtaLink: "/products",
    image: "/images/sliders/slider-4.webp",
    bgColor: "#181116",
  },
  {
    id: "slide-slider-5",
    title: "Signature Dubai Abaya & Modest Luxury",
    subtitle: "Flowing layered silhouettes, modest elegance & artisanal detailing designed for modern occasions.",
    ctaText: "VIEW ABAYAS",
    ctaLink: "/products?category=Luxury%20Abayas",
    secondaryCtaText: "SHOP COLLECTION",
    secondaryCtaLink: "/products",
    image: "/images/sliders/slider-5.webp",
    bgColor: "#14151a",
  },
];

export const CAMPAIGN_IMAGES = [
  "/images/campaign/minit-2.webp",
  "/images/campaign/minit-3.webp",
  "/images/campaign/minit-7.webp",
  "/images/sliders/slider-3.webp",
  "/images/sliders/slider-4.webp",
  "/images/sliders/slider-5.webp",
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
        const mapped = activeCampaigns.map(mapCampaignToHeroSlide);
        setSlides(mapped);
        setCurrent((prev) => (prev >= mapped.length ? 0 : prev));
        return;
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
    if (slides.length <= 1) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length, handleNext]);

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
    pointerStartX.current = null;
    pointerStartY.current = null;
    setTimeout(() => {
      draggedFar.current = false;
    }, 60);
  };

  const handlePointerCancel = () => {
    isPointerDown.current = false;
    pointerStartX.current = null;
    pointerStartY.current = null;
    draggedFar.current = false;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggedFar.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      aria-label="Hero Highlights"
      className="relative w-full h-[58vw] min-h-[460px] max-h-[840px] overflow-hidden bg-zinc-950 select-none group touch-pan-y cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
      {/* Top dark gradient overlay for transparent header contrast - softened for model visibility */}
      <div className="absolute top-0 left-0 right-0 h-28 sm:h-40 md:h-52 bg-gradient-to-b from-black/55 via-black/20 to-transparent pointer-events-none z-20" />

      {/* Bottom dark gradient overlay for slider controls and caption */}
      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-44 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none z-20" />

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
            {/* Background Image with subtle scale */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                quality={95}
                priority={idx === 0}
                sizes="100vw"
                className={`object-cover object-center transition-transform duration-1000 ease-out ${
                  isActive ? "scale-100" : "scale-105"
                } group-hover:scale-[1.02]`}
              />

              {/* Ambient Center Scrim for optimal centered text contrast */}
              <div className="absolute inset-0 bg-black/25 via-black/15 to-black/40 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/10 to-black/45 pointer-events-none" />

              {/* Centered Editorial Text & CTA Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 lg:px-20 pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14">
                <div className="max-w-3xl space-y-2 sm:space-y-4 md:space-y-5 flex flex-col items-center">
                  {/* Centered Headline */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-[1.08] drop-shadow-2xl">
                    {slide.title}
                  </h1>

                  {/* Centered Subtitle */}
                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-100 font-normal leading-relaxed max-w-xl drop-shadow-md line-clamp-2 sm:line-clamp-3">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Centered CTA Buttons */}
                  <div className="pt-2 sm:pt-5 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-white text-zinc-950 hover:bg-amber-400 hover:text-zinc-950 active:scale-95 text-[11px] sm:text-xs md:text-sm font-black tracking-[0.14em] uppercase transition-all duration-200 shadow-2xl group/btn cursor-pointer"
                    >
                      <span>{slide.ctaText}</span>
                      <span className="transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
                    </Link>

                    {slide.secondaryCtaText && (
                      <Link
                        href={slide.secondaryCtaLink || "/products"}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4.5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/25 text-white text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer shadow-lg"
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

      {/* Simple & Clean Pagination Indicators (Centered at bottom) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrent(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer drop-shadow ${
                i === current
                  ? "w-7 sm:w-9 bg-white shadow-md"
                  : "w-2 sm:w-2.5 bg-white/45 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
