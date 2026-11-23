"use client";

import { FiCheck, FiMessageCircle, FiRefreshCw, FiTruck } from "react-icons/fi";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/ui/breadcrumbs";

export type { BreadcrumbItem } from "@/components/ui/breadcrumbs";

export interface PageBannerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs: BreadcrumbItem[];
  showTrustChips?: boolean;
  className?: string;
  bgImage?: string;
  variant?: "cinematic" | "ecommerce";
  itemCount?: number;
}

const trustPoints = [
  { label: "Delivery details at checkout", icon: FiTruck },
  { label: "7-day returns", icon: FiRefreshCw },
  { label: "Customer support", icon: FiMessageCircle },
];

export default function PageBanner({
  title,
  subtitle,
  breadcrumbs,
  showTrustChips = false,
  className = "",
  bgImage = "/images/bredcump-main.webp",
  itemCount,
}: PageBannerProps) {
  return (
    <section
      className={`relative w-full overflow-hidden border-b border-black/20 bg-[#121318] bg-cover bg-right md:bg-[position:center_right] bg-no-repeat ${className}`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Refined gradient overlay: left side dark for crystal-clear typography, right side transparent so fashion model is vibrant & visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/60 via-45% to-black/15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

      {/* Standardized Unified Height Across ALL Pages: 155px mobile, 170px sm, 185px md/lg */}
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-12 py-5 sm:py-6 md:py-7 flex flex-col justify-between min-h-[155px] sm:min-h-[170px] md:min-h-[185px]">
        {/* Breadcrumb Navigation at top */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-2.5 sm:mb-3">
            <Breadcrumbs items={breadcrumbs} transparent />
          </div>
        )}

        {/* Clean Luxury Boutique Typography */}
        <div className="max-w-3xl mt-auto">
          {title && (
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-white/85 font-normal leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] line-clamp-2">
              {subtitle}
            </p>
          )}

          {showTrustChips && (
            <ul aria-label="MiniThailandBD highlights" className="mt-3 flex flex-wrap gap-2">
              {trustPoints.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-3.5 py-1 text-[11px] font-medium text-white/90 shadow-sm sm:text-xs"
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 text-rose-400" />
                  <span>{label}</span>
                  <FiCheck aria-hidden="true" className="h-3 w-3 text-emerald-400" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
