'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiHeart, FiHome, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useCart } from '@/app/_providers/cart-provider';

const items = [
  { href: '/', label: 'Home', icon: FiHome },
  { href: '/products', label: 'Shop', icon: FiGrid },
  { href: '/wishlist', label: 'Wishlist', icon: FiHeart },
  { href: '/cart', label: 'Cart', icon: FiShoppingBag },
  { href: '/profile', label: 'Account', icon: FiUser },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? itemCount : 0;

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-950/40 bg-[#180816]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} aria-label={label === 'Cart' && cartCount > 0 ? `Cart, ${cartCount} items` : label} className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${active ? 'text-[#ec1c67]' : 'text-zinc-400 hover:text-white'}`}>
              <span className="relative"><Icon className="h-5 w-5" aria-hidden="true" />{label === 'Cart' && cartCount > 0 && <span aria-hidden="true" className="absolute -right-2.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-store-primary px-1 text-[9px] font-semibold leading-none text-white">{cartCount > 99 ? '99+' : cartCount}</span>}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
