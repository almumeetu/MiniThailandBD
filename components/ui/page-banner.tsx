"use client";

import { FiCheck, FiMessageCircle, FiRefreshCw, FiTruck } from "react-icons/fi";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/ui/breadcrumbs";

export type { BreadcrumbItem } from "@/components/ui/breadcrumbs";

export interface PageBannerProps {
  title?: string;
  subtitle?: string;
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
  breadcrumbs,
  showTrustChips = false,
  className = "",
  bgImage = "/images/campaign/minit-2.webp",
}: PageBannerProps) {
  return (
    <section
      className={`relative w-full overflow-hidden border-b border-black/15 bg-[#2c2e35] bg-cover bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Minimal clean cinematic overlay: prioritizes the fashion models in the image while maintaining crisp text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/45" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 md:px-10 lg:px-16 lg:py-8 flex flex-col justify-between min-h-[160px] sm:min-h-[190px] md:min-h-[220px]">
        {/* Breadcrumb Navigation at top */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-2 sm:mb-3">
            <Breadcrumbs items={breadcrumbs} transparent />
          </div>
        )}

        {/* Clean, luxury boutique typography */}
        <div className="max-w-2xl sm:max-w-3xl mt-auto">
          {title && (
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-white/85 font-normal leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              {subtitle}
            </p>
          )}

          {showTrustChips && (
            <ul aria-label="MiniThailandBD highlights" className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              {trustPoints.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white/90 shadow-sm sm:text-xs"
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
