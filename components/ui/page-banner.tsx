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
}

const trustPoints = [
  { label: "Delivery details at checkout", icon: FiTruck },
  { label: "7-day returns", icon: FiRefreshCw },
  { label: "Customer support", icon: FiMessageCircle },
];

export default function PageBanner({
  title,
  subtitle,
  badge,
  breadcrumbs,
  showTrustChips = false,
  className = "",
  bgImage = "/images/bredcump-main.webp",
}: PageBannerProps) {
  return (
    <section
      className={`relative w-full overflow-hidden border-b border-black/20 bg-[#14151a] bg-cover bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* High-end cinematic multi-stop gradient for flawless contrast and warmth */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-16 lg:py-12 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] md:min-h-[250px]">
        {/* Breadcrumb Navigation at top */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <Breadcrumbs items={breadcrumbs} transparent />
          </div>
        )}

        {/* Clean, luxury boutique typography */}
        <div className="max-w-3xl mt-auto">
          {badge && (
            <span className="inline-block text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-rose-400 mb-2 drop-shadow-xs">
              {badge}
            </span>
          )}

          {title && (
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mt-2 max-w-2xl text-xs sm:text-sm md:text-[15px] text-white/90 font-normal leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
              {subtitle}
            </p>
          )}

          {showTrustChips && (
            <ul aria-label="MiniThailandBD highlights" className="mt-4 flex flex-wrap gap-2">
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
