import type { ReactNode } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  trailingContent?: ReactNode;
}

export default function Breadcrumbs({ items, trailingContent }: BreadcrumbsProps) {
  return (
    <div className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-4 text-xs sm:px-6 sm:py-5 sm:text-sm md:px-10 lg:px-16">
        <nav
          aria-label="Breadcrumb"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ol className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
            <li className="shrink-0">
              <Link
                href="/"
                className="font-medium text-zinc-500 transition-colors hover:text-store-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary"
              >
                Home
              </Link>
            </li>

            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="inline-flex min-w-0 shrink-0 items-center gap-1.5">
                  <FiChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-zinc-400" />
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="max-w-[140px] truncate font-medium text-zinc-500 transition-colors hover:text-store-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary sm:max-w-[200px]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className="max-w-[180px] truncate font-medium text-store-ink sm:max-w-[320px]"
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
