"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/images/sliders/slider-3.webp",
    title: "এক্সক্লুসিভ ব্যাংকক কর্ড সেট",
    titleEn: "Exclusive Bangkok Co-ord Sets",
    copy: "প্রিমিয়াম থাই কর্ড সেট কালেকশন — এক্সক্লুসিভ ডিজাইন ও অসাধারণ কোয়ালিটি।",
  },
  {
    image: "/images/sliders/slider-4.webp",
    title: "রয়েল ভেলভেট ও পার্টি গাউন",
    titleEn: "Regal Velvet & Festive Party Wear",
    copy: "অভিজাত ভেলভেট ও জমকালো পার্টি পোশাকের এক্সক্লুসিভ সমাহার Mini Thailand-এ।",
  },
  {
    image: "/images/sliders/slider-5.webp",
    title: "দুবাই লাক্সারি আবায়া কালেকশন",
    titleEn: "Signature Dubai Abaya & Modest Luxury",
    copy: "মডেস্ট লাক্সারি ফ্যাশন — প্রিমিয়াম ফেব্রিক ও নিখুঁত ফিনিশিং সরাসরি ব্যাংকক থেকে।",
  },
  {
    image: "/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg",
    title: "থাই কর্ড সেট কালেকশন",
    titleEn: "Thai Cord Set Collection",
    copy: "আমাদের প্রিমিয়াম থাই কর্ড সেট — এক্সক্লুসিভ ডিজাইন, অসাধারণ কোয়ালিটি। এখনই অর্ডার করুন।",
  },
  {
    image: "/products/cords set/907179635_1119377164055012_4690738175147170981_n.jpg",
    title: "নতুন ফ্যাশন কালেকশন",
    titleEn: "New Fashion Arrivals",
    copy: "MiniThailandBD — বাংলাদেশের সেরা থাই ফ্যাশন স্টোর। স্কিনকেয়ার, পারফিউম, পোশাক ও আরও অনেক কিছু।",
  },
  {
    image: "/products/cords set/910465086_1119291994063529_6730173952863950097_n.jpg",
    title: "প্রিমিয়াম কোয়ালিটি",
    titleEn: "Premium Quality Fashion",
    copy: "থাইল্যান্ড থেকে আনা সেরা ফ্যাশন পণ্য — সরাসরি আপনার দরজায়। ৳৳৳ সাশ্রয়ী মূল্যে।",
  },
  {
    image: "/products/cords set/913180013_1120115427314519_7306115019982798276_n.jpg",
    title: "কর্ড ড্রেস কালেকশন",
    titleEn: "Cord Dress Collection",
    copy: "এক্সক্লুসিভ থাই কর্ড ড্রেস — স্টাইলিশ ডিজাইন, লাইটওয়েট ফেব্রিক। সীমিত স্টক।",
  },
  {
    image: "/products/cords set/916496639_2050418568951611_3231227725146044425_n.jpeg",
    title: "সামার স্পেশাল অফার",
    titleEn: "Summer Special Offer",
    copy: "এই মৌসুমে সেরা অফার — MiniThailandBD-তে কেনাকাটা করুন এবং বিশেষ ছাড় পান।",
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
      <div className="relative h-[58vh] min-h-[460px] overflow-hidden sm:h-[80vh]">
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
              alt={slide.titleEn}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
        ))}

        {/* Warm gradient overlay — pink/rose tinted for fashion feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-[#c0185a]/10 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-[#c0185a]/70 disabled:opacity-50 sm:left-8"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-[#c0185a]/70 disabled:opacity-50 sm:right-8"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-white sm:px-12 sm:pb-16">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl font-bengali tracking-normal animate-in slide-in-from-bottom-4 fade-in duration-700">
            {slides[activeSlide].title}
          </h1>
          <div className="mt-7 flex flex-wrap gap-3.5 animate-in slide-in-from-bottom fade-in duration-700 delay-300">
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
