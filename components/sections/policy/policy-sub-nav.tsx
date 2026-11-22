'use client';

import React from 'react';
import Link from 'next/link';

export interface PolicySubNavProps {
  currentKey: 'delivery' | 'returns' | 'terms' | 'privacy';
}

const POLICY_LINKS = [
  { key: 'delivery', label: 'Shipping & Delivery', href: '/delivery' },
  { key: 'returns', label: 'Return & Refund Policy', href: '/returns' },
  { key: 'terms', label: 'Terms & Conditions', href: '/terms' },
  { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
] as const;

export default function PolicySubNav({ currentKey }: PolicySubNavProps) {
  return (
    <nav
      aria-label="Policy Sub Navigation"
      className="border-b border-zinc-200/90 bg-white"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs sm:text-sm">
          {POLICY_LINKS.map((link) => {
            const isActive = currentKey === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`py-3 whitespace-nowrap transition-colors border-b-2 font-medium ${
                  isActive
                    ? 'border-zinc-950 text-zinc-950 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
