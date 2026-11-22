"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { IoStar, IoCheckmark } from "react-icons/io5";
import { FaQuoteLeft, FaQuoteRight, FaFacebookF, FaWhatsapp } from "react-icons/fa6";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export interface TestimonialReview {
  id: string;
  customerName: string;
  location: string;
  productName: string;
  avatarUrl: string;
  initials: string;
  message: string;
  rating: number;
}

const TESTIMONIALS: TestimonialReview[] = [
  {
    id: "review-1",
    customerName: "Tanjina Akter",
    location: "Dhanmondi, Dhaka • Verified Buyer",
    productName: "Thai Cord Set — Rose Pink Edition",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    initials: "TA",
    message:
      "Alhamdulillah parcel peyechi! Dress ta truly oshadharon! Fabric er quality eto soft ar comfortable, shotti bolar moto na! Picture thekeo real e onek beshi gorgeous lagche. Thank you Mini Thailand for authentic Bangkok quality!",
    rating: 5,
  },
  {
    id: "review-2",
    customerName: "Sadia Islam Mim",
    location: "Nasirabad, Chattogram • Verified Buyer",
    productName: "Wine Red Tiered Velvet Party Gown",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    initials: "SM",
    message:
      "My sister's wedding party outfit arrived right on time! The velvet party gown fits absolutely like a dream, and everyone at the event kept asking where I bought it from. 2 days delivery to Ctg was remarkably fast!",
    rating: 5,
  },
  {
    id: "review-3",
    customerName: "Nusrat Jahan Chowdhury",
    location: "Upashahar, Sylhet • Verified Buyer",
    productName: "Dubai Style Beige Shrug & Abaya Set",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    initials: "NC",
    message:
      "Normally online e dress kinte voy pay, kintu video call e pura dress live dekhiye parcel pathiyechen tai trust kore order korechilam. Abaya set er stitching, finish ar packaging 100 out of 100! Will definitely order more.",
    rating: 5,
  },
  {
    id: "review-4",
    customerName: "Mehnaz Rahman",
    location: "Uttara, Dhaka • Verified Buyer",
    productName: "Textured Animal Print Long Overcoat",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    initials: "MR",
    message:
      "Received the winter overcoat today! Perfect fitting and fabric weight is just right for this season. Truly authentic imported piece with superb packaging. Mini Thailand BD has earned a loyal customer!",
    rating: 5,
  },
  {
    id: "review-5",
    customerName: "Farhana Yasmin",
    location: "Gulshan-2, Dhaka • Verified Buyer",
    productName: "Bangkok Luxury Co-ord Set",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
    initials: "FY",
    message:
      "Eto fast customer support ar authentic product delivery rarely dekha jay. Material quality 10/10, color is vibrant exactly as shown in their live videos. Mini Thailand is definitely my favorite boutique now!",
    rating: 5,
  },
];

export default function ChatTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const total = TESTIMONIALS.length;
  const current = TESTIMONIALS[currentIndex];

  const handleNext = useCallback(() => {
    setAvatarError(false);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setAvatarError(false);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay slider every 6 seconds, paused when hovered/touched
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Touch swipe handling for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      aria-label="Customer Testimonials"
      className="relative w-full overflow-hidden select-none py-12 sm:py-16 md:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ══════════ Top Zone: Light background with 45-degree diagonal pinstripe lines ══════════ */}
      <div
        className="absolute inset-0 z-0 bg-[#ffffff]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.022) 0px, rgba(0,0,0,0.022) 1px, transparent 1px, transparent 14px)",
        }}
      />

      {/* ══════════ Bottom Zone: Rich Brand Theme Colored Angular Geometric Shape ══════════ */}
      <div
        className="absolute inset-x-0 bottom-0 h-[64%] sm:h-[62%] md:h-[60%] z-0 pointer-events-none overflow-hidden"
        style={{
          clipPath: "polygon(0 20%, 100% 8%, 100% 100%, 0% 100%)",
        }}
      >
        {/* Rich boutique gradient matching Mini Thailand signature colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#701a75] via-[#9f1239] to-[#ec1c67]" />
        {/* Subtle radial sheen glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.18),_transparent_70%)]" />
        {/* Depth vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Bottom-left diagonal accent wedge (matching reference image) */}
      <div
        className="absolute left-0 bottom-0 w-32 sm:w-56 h-32 sm:h-56 z-0 pointer-events-none opacity-40"
        style={{
          background: "linear-gradient(135deg, #ec1c67 0%, transparent 70%)",
          clipPath: "polygon(0 0, 100% 100%, 0 100%)",
        }}
      />

      {/* ══════════ Decorative Accents: Cross markers matching reference image ══════════ */}
      {/* Top-Left Cross Marks */}
      <div className="absolute top-8 left-6 sm:left-12 lg:left-20 hidden sm:flex flex-col gap-1.5 text-zinc-300 font-mono text-base font-bold select-none opacity-80 pointer-events-none z-10">
        <span>+</span>
        <span>+</span>
        <span>+</span>
      </div>

      {/* Top-Right Social Badges */}
      <div className="absolute top-8 right-6 sm:right-12 lg:right-20 hidden sm:flex items-center gap-2 z-10">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mini Thailand Facebook"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ec1c67] text-white flex items-center justify-center text-xs shadow-sm hover:scale-110 active:scale-95 transition-all"
        >
          <FaFacebookF className="w-3.5 h-3.5" />
        </a>
        <a
          href="https://wa.me/8801706126663"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mini Thailand WhatsApp"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs shadow-sm hover:scale-110 active:scale-95 transition-all"
        >
          <FaWhatsapp className="w-4 h-4" />
        </a>
      </div>

      {/* Bottom-Right Cross Marks */}
      <div className="absolute bottom-8 right-6 sm:right-12 lg:right-20 hidden sm:flex flex-col gap-1.5 text-white/30 font-mono text-base font-bold select-none pointer-events-none z-10">
        <span>+</span>
        <span>+</span>
        <span>+</span>
      </div>

      {/* ══════════ Main Content Container ══════════ */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Title Header */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm font-extrabold tracking-[0.2em] text-[#ec1c67] uppercase mb-1.5">
            WHAT OUR CLIENTS
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
            Say About Us!
          </h2>
        </div>

        {/* ══════════ Interactive Testimonial Card Stage ══════════ */}
        <div className="relative max-w-xl sm:max-w-2xl mx-auto">
          {/* Desktop Left/Right Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="hidden md:flex absolute -left-6 lg:-left-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-zinc-800 shadow-xl border border-zinc-200/80 items-center justify-center hover:bg-[#ec1c67] hover:text-white hover:border-[#ec1c67] transition-all duration-200 cursor-pointer active:scale-90 z-30"
          >
            <LuChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next testimonial"
            className="hidden md:flex absolute -right-6 lg:-right-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-zinc-800 shadow-xl border border-zinc-200/80 items-center justify-center hover:bg-[#ec1c67] hover:text-white hover:border-[#ec1c67] transition-all duration-200 cursor-pointer active:scale-90 z-30"
          >
            <LuChevronRight className="w-5 h-5" />
          </button>

          {/* ══════════ Speech Bubble Card ══════════ */}
          <div className="relative bg-white rounded-[26px] sm:rounded-[32px] shadow-[0_22px_55px_rgba(0,0,0,0.14)] border border-zinc-100/90 pt-8 sm:pt-9 px-6 sm:px-12 pb-14 sm:pb-16 transition-all duration-300">
            {/* Top Pill Badge: 5 Golden Stars */}
            <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-20">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#18181b] border-2 border-white/40 shadow-lg text-amber-400">
                {Array.from({ length: current.rating || 5 }).map((_, i) => (
                  <IoStar key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current drop-shadow-xs" />
                ))}
              </div>
            </div>

            {/* Testimonial Quote with Opening & Closing Quotation Marks */}
            <div className="relative mt-2 sm:mt-3">
              <FaQuoteLeft className="text-amber-400 w-4 h-4 sm:w-5 sm:h-5 mb-2 opacity-90 inline-block align-top mr-2" />
              <p className="text-xs sm:text-[14.5px] md:text-[15px] leading-relaxed sm:leading-7 text-zinc-700 font-normal inline">
                {current.message}
              </p>
              <FaQuoteRight className="text-amber-400 w-4 h-4 sm:w-5 sm:h-5 ml-2 opacity-90 inline-block align-bottom" />
            </div>

            {/* Speech Bubble Triangular Pointer / Tail pointing down-right */}
            <div className="absolute -bottom-[21px] right-10 sm:right-16 w-8 sm:w-9 h-6 sm:h-7 pointer-events-none z-10">
              <svg
                viewBox="0 0 32 26"
                className="w-full h-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.08)]"
              >
                <path
                  d="M0 0 L32 0 L26 23 C25 25 23 25 22 23 L10 8 Z"
                  fill="#ffffff"
                />
              </svg>
            </div>

            {/* Circular Avatar Cutout (Overlapping the center-bottom of the bubble) */}
            <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 z-20">
              <div className="relative">
                {/* Left golden accent dot */}
                <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-xs z-30" />

                {/* Avatar circular frame with theme color ring */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 sm:ring-[5px] ring-[#ec1c67] border-4 border-white shadow-xl bg-gradient-to-tr from-[#ec1c67] to-[#f59e0b]">
                  {!avatarError && current.avatarUrl ? (
                    <Image
                      src={current.avatarUrl}
                      alt={current.customerName}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover object-center"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-xl sm:text-2xl">
                      {current.initials}
                    </div>
                  )}
                </div>

                {/* Right golden accent dot */}
                <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-xs z-30" />
              </div>
            </div>
          </div>

          {/* ══════════ Customer Name, Details & Verified Product (on Colored Background) ══════════ */}
          <div className="mt-14 sm:mt-16 text-center text-white space-y-1">
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              {current.customerName}
            </h4>
            <p className="text-xs sm:text-sm text-white/85 font-medium tracking-wide">
              {current.location}
            </p>

            {current.productName && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] sm:text-xs text-white/95 font-medium backdrop-blur-xs">
                  <IoCheckmark className="w-3.5 h-3.5 text-amber-300" />
                  <span>Purchased: {current.productName}</span>
                </span>
              </div>
            )}
          </div>

          {/* ══════════ Mobile Navigation Controls & Pagination Dots ══════════ */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {/* Mobile Prev Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="md:hidden w-8 h-8 rounded-full bg-white/20 text-white border border-white/30 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            >
              <LuChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAvatarError(false);
                    setCurrentIndex(i);
                  }}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === i
                      ? "w-7 sm:w-8 h-2 sm:h-2.5 bg-amber-400 shadow-sm"
                      : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            {/* Mobile Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="md:hidden w-8 h-8 rounded-full bg-white/20 text-white border border-white/30 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            >
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
