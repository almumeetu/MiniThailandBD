'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PolicyNavProps {
  currentKey?: 'delivery' | 'returns' | 'terms' | 'privacy' | 'contact' | 'about';
}

const POLICY_LINKS = [
  { key: 'delivery', label: 'Delivery & Shipping', href: '/delivery' },
  { key: 'returns',  label: 'Returns & Refunds',   href: '/returns'  },
  { key: 'terms',    label: 'Terms & Conditions',  href: '/terms'    },
  { key: 'privacy',  label: 'Privacy Policy',       href: '/privacy'  },
  { key: 'contact',  label: 'Customer FAQs',        href: '/contact'  },
  { key: 'about',    label: 'About NovaMart',       href: '/about'    },
];

export default function PolicyNav({ currentKey }: PolicyNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Customer care and policy pages"
      className="sticky top-[60px] z-30 w-full border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur-md sm:top-[68px]"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-0 sm:px-6 md:px-10 lg:px-16">
        <div className="flex items-center gap-4">
          {/* Help Center label */}
          <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 lg:inline">
            Help center
          </span>

          {/* Divider after label */}
          <div className="hidden h-4 w-px bg-zinc-200 lg:block" />

          {/* Links */}
          <div className="no-scrollbar flex min-w-0 items-center overflow-x-auto scroll-smooth">
            {POLICY_LINKS.map((link, index) => {
              const isActive =
                currentKey === link.key ||
                (pathname ? pathname.startsWith(link.href) : false);

              return (
                <React.Fragment key={link.key}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative flex shrink-0 items-center whitespace-nowrap px-3.5 py-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary sm:py-3.5 sm:text-[13px] ${
                      isActive
                        ? 'text-store-primary'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {link.label}
                    {/* Active underline indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-store-primary" />
                    )}
                  </Link>

                  {/* Separator dot between links (not after last) */}
                  {index < POLICY_LINKS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="shrink-0 select-none text-zinc-300"
                    >
                      ·
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
