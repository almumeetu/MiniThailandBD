"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/images/sliders/arch-wine.webp",
    title: "সিগনেচার বার্গান্ডি ও ওয়াইন লাক্সারি",
    titleEn: "Signature Burgundy & Wine Luxury",
    copy: "ডিপ ভিন্টেজ ওয়াইন হিউজ ও লাক্সারি থাই ডিজাইনার ফ্যাশন সরাসরি ব্যাংকক থেকে।",
  },
  {
    image: "/images/sliders/arch-maroon.webp",
    title: "ইম্পেরিয়াল মেরুন ও ভেলভেট গ্র্যান্ডার",
    titleEn: "Imperial Maroon & Velvet Grandeur",
    copy: "উৎসবমুখর রাজকীয় মেরুন শেড, প্রিমিয়াম টেক্সচার ও জমকালো এক্সক্লুসিভ গাউন।",
  },
  {
    image: "/images/sliders/arch-blue.webp",
    title: "রয়েল স্যাফায়ার গাউন কালেকশন",
    titleEn: "Royal Sapphire & Evening Drapes",
    copy: "লুমিনাস সিল্ক-টাচ ফেব্রিক ও আভিজাত্যের নিখুঁত ব্যাংকক অ্যাটেলিয়ার ডিজাইন।",
  },
  {
    image: "/images/sliders/arch-purple.webp",
    title: "রিগ্যাল ভায়োলেট সিল্ক কর্ড সেট",
    titleEn: "Regal Violet & Silk Co-ord Sets",
    copy: "এক্সক্লুসিভ থাই কর্ড সেট কালেকশন — সফট ফেব্রিক, মডার্ন ড্র্যাপ ও নিখুঁত ফিনিশিং।",
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
      <div className="relative h-[78vh] min-h-[600px] max-h-[760px] overflow-hidden sm:h-[80vh]">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              activeSlide === index
                ? "opacity-100 z-10"
                : "opacity-0 pointer-events-none z-0"
            }`}
          >
            <div
              key={activeSlide === index ? `zoom-active-${index}` : `zoom-idle-${index}`}
              className={`relative w-full h-full overflow-hidden ${
                activeSlide === index ? "animate-hero-ken-burns" : "scale-[1.015]"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.titleEn}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        ))}

        {/* Warm gradient overlay — pink/rose tinted for fashion feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-[#c0185a]/10 to-transparent pointer-events-none z-10" />

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-[#c0185a]/70 disabled:opacity-50 sm:left-8"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-[#c0185a]/70 disabled:opacity-50 sm:right-8"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div
          key={`hero-text-content-${activeSlide}`}
          className="absolute inset-x-0 bottom-0 px-6 pb-12 text-white sm:px-12 sm:pb-16 pointer-events-none z-20"
        >
          <div className="max-w-3xl pointer-events-auto">
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl font-bengali tracking-normal animate-hero-title">
              {slides[activeSlide].title}
            </h1>
            {slides[activeSlide].copy && (
              <p className="mt-3.5 max-w-2xl text-sm sm:text-base md:text-lg text-white/90 font-normal leading-relaxed animate-hero-desc">
                {slides[activeSlide].copy}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3.5 animate-hero-btn">
              <Link
                href="/products"
                className="inline-flex rounded-xl bg-[#c0185a] px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#c0185a]/30 transition-all hover:bg-[#9e1049] hover:scale-105"
              >
                Shop Now
              </Link>
              <Link
                href="https://www.facebook.com/minithailand2022/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-xl border-2 border-white/80 bg-white/10 backdrop-blur-xs px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#c0185a]"
              >
                Facebook Page
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-5 right-6 flex gap-2 sm:right-12">
          {slides.map((slide, index) => (
            <button
              key={slide.titleEn}
              type="button"
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`h-2.5 rounded-full transition-all duration-500 disabled:opacity-50 ${
                activeSlide === index
                  ? "w-8 bg-[#c0185a]"
                  : "w-2.5 bg-white/55 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className={`h-full bg-[#c0185a] transition-all ${isPaused ? "w-0" : "w-full"}`}
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
