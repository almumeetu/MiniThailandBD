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

  // Hide on individual product details (where MobileStickyBuyBar takes over) and checkout
  const isProductDetailPage = pathname.startsWith('/products/') && pathname !== '/products';
  const isCheckout = pathname === '/checkout';

  if (isProductDetailPage || isCheckout) {
    return null;
  }

  const cartCount = mounted ? itemCount : 0;

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_35px_rgba(0,0,0,0.6)] md:hidden transition-all duration-300">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              aria-label={label === 'Cart' && cartCount > 0 ? `Cart, ${cartCount} items` : label}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all duration-200 active:scale-95 ${
                active ? 'text-[#c5a880] font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="relative">
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    active ? 'scale-110 drop-shadow-[0_2px_8px_rgba(197,168,128,0.5)]' : ''
                  }`}
                  aria-hidden="true"
                />
                {label === 'Cart' && cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-[#c5a880] px-1 text-[9px] font-black leading-none text-zinc-950 shadow-sm animate-pulse"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              <span className="tracking-wide">{label}</span>
              {active && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#c5a880] shadow-[0_0_6px_#c5a880]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
