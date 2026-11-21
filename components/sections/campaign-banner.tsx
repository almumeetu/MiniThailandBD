"use client";

import Image from "next/image";
import Link from "next/link";
import { LuSparkles, LuArrowRight, LuBadgePercent } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";

export default function CampaignBanner() {
  const whatsappUrl =
    "https://wa.me/8801722301927?text=" +
    encodeURIComponent(
      "Hello Mini Thailand! I want to avail the MINITHAI15 offer for Thai Cord Sets / Party Gowns."
    );

  return (
    <section
      aria-label="Promotional campaign banner"
      className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2b051b] via-[#4a0a2e] to-[#1a0110] p-6 sm:p-10 lg:p-12 text-white shadow-xl border border-rose-900/30">
        {/* Subtle Background Pattern & Glow */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-[#e8a020]/15 blur-2xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          {/* Left Text & CTA Column */}
          <div className="lg:col-span-7 z-10">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
              Limited Edition <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-amber-200">Thai Boutique Edit</span>
            </h2>

            {/* Voucher Coupon Box */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 px-4 py-2">
                <LuBadgePercent className="h-5 w-5 text-amber-300" />
                <span className="text-xs text-rose-200">Coupon Code:</span>
                <span className="font-mono text-sm font-bold tracking-wider text-white bg-rose-600/60 px-2 py-0.5 rounded">
                  MINITHAI15
                </span>
              </div>
              <span className="text-xs text-rose-200/80">Flat 15% OFF (Orders above ৳2,000)</span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-950/40 transition-all active:scale-95"
              >
                <span>Shop The Collection</span>
                <LuArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md active:scale-95"
              >
                <FaWhatsapp className="h-4 w-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Visual Image Showcase Column */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/15 shadow-xl">
                <Image
                  src="/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg"
                  alt="Thai Cord Set"
                  fill
                  sizes="240px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/15 shadow-xl mt-6">
                <Image
                  src="/products/cords set/907179635_1119377164055012_4690738175147170981_n.jpg"
                  alt="Velvet Party Gown"
                  fill
                  sizes="240px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
