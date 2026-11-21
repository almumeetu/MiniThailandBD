"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=85",
    title: "Vintage football stories",
    copy: "Archive jerseys, warm-up jackets, and one-off pieces selected for everyday wear.",
  },
  {
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
    title: "Curated streetwear",
    copy: "Statement layers, classic silhouettes, and fresh arrivals from the NovaMart collection.",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=85",
    title: "Football corner",
    copy: "Find club colors, training tops, and retro match-day essentials.",
  },
];

export default function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide((current) => (current + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === activeSlide) return;
    setIsTransitioning(true);
    setActiveSlide(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, activeSlide]);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = window.setInterval(() => {
      nextSlide();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section 
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[58vh] min-h-[460px] overflow-hidden sm:h-[74vh]">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              activeSlide === index 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-105"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50 sm:left-8"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50 sm:right-8"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-white sm:px-12 sm:pb-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-90">NovaMart</p>
          <h1 className="mt-4 max-w-3xl font-bembo text-5xl font-bold leading-none sm:text-7xl animate-in slide-in-from-bottom-4 fade-in duration-700">
            {slides[activeSlide].title}
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 sm:text-lg animate-in slide-in-from-bottom-2 fade-in duration-700 delay-150">
            {slides[activeSlide].copy}
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition-all hover:bg-black hover:text-white hover:scale-105 animate-in slide-in-from-bottom fade-in duration-700 delay-300"
          >
            Shop Now
          </Link>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-5 right-6 flex gap-2 sm:right-12">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`h-2.5 rounded-full transition-all duration-500 disabled:opacity-50 ${
                activeSlide === index 
                  ? "w-8 bg-white" 
                  : "w-2.5 bg-white/55 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className={`h-full bg-white transition-all ${
              isPaused ? "w-0" : "w-full"
            }`}
            style={{
              transitionDuration: isPaused ? "0ms" : "5000ms",
              transitionTimingFunction: "linear",
            }}
          />
        </div>
      </div>
    </section>
  );
}
