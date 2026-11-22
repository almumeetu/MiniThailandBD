'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiInfo, FiHelpCircle, FiShield } from 'react-icons/fi';

export interface PolicyNavProps {
  currentKey?: 'delivery' | 'returns' | 'terms' | 'privacy' | 'contact' | 'about';
}

interface NavGroup {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  links: {
    key: string;
    label: string;
    href: string;
  }[];
}

const POLICY_CATEGORIES: NavGroup[] = [
  {
    category: 'Who We Are',
    icon: FiInfo,
    links: [
      { key: 'about', label: 'About Us', href: '/about' },
      { key: 'contact', label: 'Contact & Showrooms', href: '/contact' },
    ],
  },
  {
    category: 'Customer Support',
    icon: FiHelpCircle,
    links: [
      { key: 'delivery', label: 'Shipping & Delivery', href: '/delivery' },
      { key: 'returns', label: 'Return & Refund Policy', href: '/returns' },
    ],
  },
  {
    category: 'Policies & Legal',
    icon: FiShield,
    links: [
      { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { key: 'terms', label: 'Terms & Conditions', href: '/terms' },
    ],
  },
];

export default function PolicyNav({ currentKey }: PolicyNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Customer care and policy pages"
      className="sticky top-[56px] z-30 w-full border-b border-zinc-200/90 bg-white/95 shadow-2xs backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-2 sm:px-6 md:px-10 lg:px-16">
        <div className="no-scrollbar flex min-w-0 items-center gap-3 sm:gap-5 overflow-x-auto scroll-smooth py-0.5">
          {POLICY_CATEGORIES.map((group, groupIdx) => (
            <React.Fragment key={group.category}>
              {/* Visual Divider between categories */}
              {groupIdx > 0 && (
                <div className="hidden sm:block h-5 w-px bg-zinc-200 shrink-0" />
              )}

              {/* Category Group */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {/* Category label badge */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md shrink-0 border border-zinc-200/60">
                  <group.icon className="w-3 h-3 text-[#ec1c67]" />
                  <span>{group.category}</span>
                </span>

                {/* Links in this category */}
                <div className="flex items-center gap-1">
                  {group.links.map((link) => {
                    const isActive =
                      currentKey === link.key ||
                      (pathname ? pathname === link.href || pathname.startsWith(`${link.href}/`) : false);

                    return (
                      <Link
                        key={link.key}
                        href={link.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`relative flex shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                          isActive
                            ? 'text-[#ec1c67] font-bold bg-rose-50 border border-rose-200/80 shadow-2xs'
                            : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
                        }`}
                      >
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
}
