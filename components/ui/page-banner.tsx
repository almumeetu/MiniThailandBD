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
}: PageBannerProps) {
  return (
    <>
      <section className={`w-full bg-store-page ${className}`}>
        <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 md:px-10 lg:px-16 lg:py-9">
          <div className="max-w-4xl">
            {title && <h1 className="store-page-title">{title}</h1>}

            {subtitle && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 sm:mt-3 sm:text-base sm:leading-7">
                {subtitle}
              </p>
            )}

            {showTrustChips && (
              <ul aria-label="NovaMart service highlights" className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                {trustPoints.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-store-border/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 shadow-[0_2px_8px_rgba(20,38,56,0.035)] sm:text-xs"
                  >
                    <Icon aria-hidden="true" className="h-3.5 w-3.5 text-store-primary" />
                    <span>{label}</span>
                    <FiCheck aria-hidden="true" className="h-3 w-3 text-emerald-600" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <Breadcrumbs items={breadcrumbs} />
    </>
  );
}
