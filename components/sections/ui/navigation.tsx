'use client';

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export interface NavLinkItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

const allNavItems: NavLinkItem[] = [
  { label: "HOME", href: "/" },
  { label: "SHOP", href: "/products" },
  { label: "CORD SETS", href: "/products?category=Cord%20Sets" },
  { label: "PARTY GOWNS", href: "/products?category=Party%20Gowns" },
  { label: "LUXURY ABAYAS", href: "/products?category=Luxury%20Abayas" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDeals = searchParams?.get('deals') === 'true' || searchParams?.get('offer') === 'true' || pathname === '/offers';

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/products?deals=true') {
      return isDeals;
    }
    if (href.startsWith('/products?category=')) {
      const catParam = new URLSearchParams(href.split('?')[1]).get('category')?.toLowerCase();
      const currentCat = searchParams?.get('category')?.toLowerCase();
      return pathname.startsWith('/products') && currentCat === catParam;
    }
    if (href === '/products') {
      const currentCat = searchParams?.get('category');
      return pathname === '/products' && !isDeals && !currentCat;
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavLinkItem) => {
    const active = isActive(item.href);

    return (
      <div key={item.label} className="relative shrink-0">
        <Link href={item.href} className="group block py-1">
          <span
            className={`relative inline-flex items-center whitespace-nowrap text-xs xl:text-[13px] tracking-wider uppercase font-semibold transition-all duration-200 ${
              active
                ? "text-[#facc15] font-bold after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-[#facc15] after:rounded-full"
                : "text-slate-200 hover:text-[#facc15] group-hover:scale-[1.03]"
            }`}
          >
            {item.label}
          </span>
        </Link>
      </div>
    );
  };

  return (
    <nav
      aria-label="Main navigation"
      className="relative flex items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-4 xl:gap-7 2xl:gap-8 flex-nowrap whitespace-nowrap font-sans"
    >
      {allNavItems.map(renderNavItem)}
    </nav>
  );
}
