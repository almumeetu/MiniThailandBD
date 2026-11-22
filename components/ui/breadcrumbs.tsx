import type { ReactNode } from "react";
import Link from "next/link";
import { FiChevronRight, FiHome } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  trailingContent?: ReactNode;
  transparent?: boolean;
  bgImage?: string;
  className?: string;
}

export default function Breadcrumbs({
  items,
  trailingContent,
  transparent = false,
  bgImage = "/images/bredcump-main.webp",
  className = "",
}: BreadcrumbsProps) {
  if (transparent) {
    return (
      <div className={`flex items-center justify-between gap-4 ${className}`}>
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ol className="flex min-w-0 items-center gap-2 whitespace-nowrap text-xs sm:text-sm">
            <li className="shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-medium text-white/80 transition-colors hover:text-white"
              >
                <FiHome className="h-3.5 w-3.5 opacity-80" />
                <span>Home</span>
              </Link>
            </li>

            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="inline-flex min-w-0 shrink-0 items-center gap-2">
                  <FiChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-white/40" />
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="max-w-[140px] truncate font-medium text-white/80 transition-colors hover:text-white sm:max-w-[220px]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className="max-w-[200px] truncate font-semibold text-white sm:max-w-[340px]"
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        {trailingContent}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden border-b border-black/15 bg-[#2c2e35] bg-cover bg-center bg-no-repeat shadow-inner ${className}`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Subtle cinematic gradient so fashion models are prominent while typography remains razor sharp */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/50" />

      <div className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-10 lg:px-16 text-xs sm:text-sm">
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ol className="flex min-w-0 items-center gap-2 whitespace-nowrap">
            <li className="shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-medium text-white/80 transition-colors hover:text-white"
              >
                <FiHome className="h-3.5 w-3.5 opacity-80" />
                <span>Home</span>
              </Link>
            </li>

            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="inline-flex min-w-0 shrink-0 items-center gap-2">
                  <FiChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-white/40" />
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="max-w-[140px] truncate font-medium text-white/80 transition-colors hover:text-white sm:max-w-[220px]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className="max-w-[200px] truncate font-semibold text-white drop-shadow-sm sm:max-w-[340px]"
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        {trailingContent}
      </div>
    </div>
  );
}
