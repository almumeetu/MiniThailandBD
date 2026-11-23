import type { ReactNode } from "react";
import Link from "next/link";
import { FiChevronRight, FiHome } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  title?: string;
  trailingContent?: ReactNode;
  transparent?: boolean;
  variant?: "banner" | "normal" | "transparent" | "plain";
  bgImage?: string;
  className?: string;
}

export default function Breadcrumbs({
  items,
  title,
  trailingContent,
  transparent = false,
  variant,
  bgImage = "/images/bredcump-main.webp",
  className = "",
}: BreadcrumbsProps) {
  // Deduplicate leading "Home" item if provided by caller to prevent "Home > Home > ..."
  const normalizedItems = (items || []).filter(
    (item, index) => !(index === 0 && (item.href === "/" || item.label.trim().toLowerCase() === "home"))
  );

  const isTransparent = transparent || variant === "transparent";
  const isNormal = variant === "normal";

  if (variant === "plain") {
    return (
      <div className={`flex items-center justify-between gap-4 ${className}`}>
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5"
        >
          <ol className="flex min-w-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-[13px]">
            <li className="shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-medium text-neutral-500 transition-colors hover:text-neutral-950"
              >
                <FiHome className="h-3.5 w-3.5 text-neutral-400" />
                <span>Home</span>
              </Link>
            </li>

            {normalizedItems.map((item, index) => {
              const isLast = index === normalizedItems.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="inline-flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
                  <FiChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-neutral-400" />
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="max-w-[140px] sm:max-w-[220px] truncate font-medium text-neutral-500 transition-colors hover:text-neutral-950"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className="max-w-[180px] sm:max-w-[340px] md:max-w-[480px] truncate font-semibold text-neutral-900"
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

  if (isNormal) {
    return (
      <div className={`w-full border-b border-zinc-200/80 bg-[#fbfaf7]/90 backdrop-blur-xs ${className}`}>
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-8 xl:px-10">
          <nav
            aria-label="Breadcrumb"
            className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ol className="flex min-w-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-[13px]">
              <li className="shrink-0">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 font-medium text-neutral-500 transition-colors hover:text-zinc-950"
                >
                  <FiHome className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Home</span>
                </Link>
              </li>

              {normalizedItems.map((item, index) => {
                const isLast = index === normalizedItems.length - 1;

                return (
                  <li key={`${item.label}-${index}`} className="inline-flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
                    <FiChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-neutral-400" />
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="max-w-[140px] sm:max-w-[220px] truncate font-medium text-neutral-500 transition-colors hover:text-zinc-950"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        className="max-w-[180px] sm:max-w-[340px] md:max-w-[480px] truncate font-semibold text-zinc-900"
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

  if (isTransparent) {
    return (
      <div className={`flex items-center justify-between gap-4 ${className}`}>
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5"
        >
          <ol className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs text-white/85 whitespace-nowrap shadow-xs">
            <li className="shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-medium text-white/80 transition-colors hover:text-white"
              >
                <FiHome className="h-3.5 w-3.5 text-rose-300" />
                <span>Home</span>
              </Link>
            </li>

            {normalizedItems.map((item, index) => {
              const isLast = index === normalizedItems.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="inline-flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
                  <FiChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-white/40" />
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="max-w-[140px] truncate font-medium text-white/80 transition-colors hover:text-white sm:max-w-[200px]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className="max-w-[180px] truncate font-semibold text-white drop-shadow-xs sm:max-w-[320px]"
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
      className={`relative w-full overflow-hidden border-b border-black/20 bg-[#14151a] bg-cover bg-right md:bg-[position:center_right] bg-no-repeat shadow-inner ${className}`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

      <div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-2 px-4 sm:px-6 md:px-10 lg:px-12 py-5 sm:py-6 md:py-7 min-h-[155px] sm:min-h-[170px] md:min-h-[185px]">
        <div className="flex items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ol className="flex min-w-0 items-center gap-2 sm:gap-2.5 whitespace-nowrap text-xs sm:text-sm md:text-base">
              <li className="shrink-0">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 font-medium text-white/85 transition-colors hover:text-white"
                >
                  <FiHome className="h-4 w-4 sm:h-4.5 sm:w-4.5 opacity-90 text-rose-300" />
                  <span>Home</span>
                </Link>
              </li>

              {normalizedItems.map((item, index) => {
                const isLast = index === normalizedItems.length - 1;

                return (
                  <li key={`${item.label}-${index}`} className="inline-flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
                    <FiChevronRight aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-white/50" />
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="max-w-[180px] truncate font-medium text-white/85 transition-colors hover:text-white sm:max-w-[280px] md:max-w-[360px]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        className="max-w-[260px] truncate font-semibold text-white drop-shadow-sm sm:max-w-[480px] md:max-w-[700px] lg:max-w-[900px] xl:max-w-none"
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
        {title && (
          <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] truncate">
            {title}
          </h1>
        )}
      </div>
    </div>
  );
}
