"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { IoStar } from "react-icons/io5";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa6";
import { LuChevronLeft, LuChevronRight, LuMaximize2, LuX } from "react-icons/lu";

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
    productName: "Bangkok Luxury Noir Co-ord Set",
    avatarUrl: "/images/testiminial/testimonial-1.png",
    initials: "TA",
    message:
      "Alhamdulillah parcel peyechi! Dress ta truly oshadharon! Fabric er quality eto soft ar comfortable, shotti bolar moto na! Picture thekeo real e onek beshi gorgeous lagche. Thank you Mini Thailand for authentic Bangkok quality!",
    rating: 5,
  },
  {
    id: "review-2",
    customerName: "Sadia Islam Mim",
    location: "Nasirabad, Chattogram • Verified Buyer",
    productName: "Wine Red Tiered Velvet & Lace Party Gown",
    avatarUrl: "/images/testiminial/testimonial-2.png",
    initials: "SM",
    message:
      "My sister's wedding party outfit arrived right on time! The crimson lace party gown fits absolutely like a dream, and everyone at the event kept asking where I bought it from. 2 days delivery to Ctg was remarkably fast!",
    rating: 5,
  },
  {
    id: "review-3",
    customerName: "Nusrat Jahan Chowdhury",
    location: "Upashahar, Sylhet • Verified Buyer",
    productName: "Bespoke Bangkok Lace Boutique Gown",
    avatarUrl: "/images/testiminial/testimonial-3.png",
    initials: "NC",
    message:
      "Normally online e dress kinte voy pay, kintu video call e pura dress live dekhiye parcel pathiyechen tai trust kore order korechilam. Dress er stitching, finish ar packaging 100 out of 100! Will definitely order more.",
    rating: 5,
  },
  {
    id: "review-4",
    customerName: "Mehnaz Rahman",
    location: "Uttara, Dhaka • Verified Buyer",
    productName: "Thai Cord Set — Rose Pink Edition",
    avatarUrl: "/images/testiminial/testimonial-4.png",
    initials: "MR",
    message:
      "Received the rose pink lace outfit today! Perfect fitting and fabric weight is just right for festive occasions. Truly authentic imported piece with superb packaging. Mini Thailand BD has earned a loyal customer!",
    rating: 5,
  },
];

export default function ChatTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
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

  // Autoplay slider every 6 seconds, paused when hovered/touched or image modal open
  useEffect(() => {
    if (isPaused || isImageModalOpen) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, isImageModalOpen, handleNext]);

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

      {/* ══════════ Bottom Zone: Angular Geometric Shape with minit-7.webp Image ══════════ */}
      <div
        className="absolute inset-x-0 bottom-0 h-[64%] sm:h-[62%] md:h-[60%] z-0 pointer-events-none overflow-hidden"
        style={{
          clipPath: "polygon(0 20%, 100% 8%, 100% 100%, 0% 100%)",
        }}
      >
        {/* Background Image: minit-7.webp */}
        <Image
          src="/images/campaign/minit-7.webp"
          alt="Testimonials boutique background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Elegant overlay to preserve boutique ambiance while keeping customer text legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
      </div>

      {/* ══════════ Main Content Container ══════════ */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Title Header — Aligned with Aarong & Mini Thailand site typography */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-xs sm:text-[13px] font-semibold tracking-[0.22em] text-[#ec1c67] uppercase mb-2">
            WHAT OUR CLIENTS
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.20em] text-zinc-950 uppercase font-sans">
            SAY ABOUT US
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
          <div className="relative bg-white rounded-[26px] sm:rounded-[32px] shadow-[0_22px_55px_rgba(0,0,0,0.12)] border border-zinc-100/90 pt-7 sm:pt-8 px-6 sm:px-12 pb-14 sm:pb-16 transition-all duration-300">
            {/* 5 Golden Stars (no background container) */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-amber-400 mb-3 sm:mb-4">
              {Array.from({ length: current.rating || 5 }).map((_, i) => (
                <IoStar key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ))}
            </div>

            {/* Testimonial Quote with Opening & Closing Quotation Marks */}
            <div className="relative">
              <FaQuoteLeft className="text-amber-400 w-4 h-4 sm:w-5 sm:h-5 mb-2 opacity-90 inline-block align-top mr-2" />
              <p className="text-xs sm:text-[14.5px] md:text-[15px] leading-relaxed sm:leading-7 text-zinc-700 font-normal inline font-sans">
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
              <div
                className="relative group/avatar cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
                title="Click to view full photo"
              >
                {/* Left golden accent dot */}
                <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-xs z-30" />

                {/* Avatar circular frame with theme color ring */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 sm:ring-[5px] ring-[#ec1c67] border-4 border-white shadow-xl bg-gradient-to-tr from-[#ec1c67] to-[#f59e0b] group-hover/avatar:scale-105 group-hover/avatar:ring-[#ec1c67] transition-all duration-300">
                  {!avatarError && current.avatarUrl ? (
                    <Image
                      src={current.avatarUrl}
                      alt={current.customerName}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover object-top"
                      onError={() => setAvatarError(true)}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-xl sm:text-2xl">
                      {current.initials}
                    </div>
                  )}

                  {/* Subtle hover zoom badge */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <LuMaximize2 className="w-5 h-5 drop-shadow-md" />
                  </div>
                </div>

                {/* Right golden accent dot */}
                <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-xs z-30" />
              </div>
            </div>
          </div>

          {/* ══════════ Customer Name (on Image Background) ══════════ */}
          <div className="mt-14 sm:mt-16 text-center text-white">
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md font-sans">
              {current.customerName}
            </h4>
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

      {/* ══════════ Full Customer Photo Lightbox Modal ══════════ */}
      {isImageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-4 sm:p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              aria-label="Close photo preview"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#ec1c67] transition-colors cursor-pointer"
            >
              <LuX className="w-4 h-4" />
            </button>

            <div className="relative w-full aspect-[4/5] sm:aspect-square max-h-[62vh] rounded-xl overflow-hidden bg-zinc-900">
              <Image
                src={current.avatarUrl}
                alt={current.customerName}
                fill
                sizes="(max-width: 640px) 90vw, 450px"
                className="object-contain object-center"
                unoptimized
              />
            </div>

            <div className="pt-4 text-white">
              <h4 className="text-base sm:text-lg font-bold font-sans">{current.customerName}</h4>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
