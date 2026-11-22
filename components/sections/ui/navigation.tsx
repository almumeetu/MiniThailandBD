'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { RiArrowDownSLine } from "react-icons/ri";
import { LuLayoutGrid, LuPhoneCall } from "react-icons/lu";
import {
  fetchShopCategories,
  fetchShopSettings,
  parseContactEntries,
  type ShopCategory,
} from "@/lib/shop-api";

const initialFallbackCats: ShopCategory[] = [
  { id: 'cat-cord-sets', name: 'Co-ord Sets', slug: 'cord-sets' },
  { id: 'cat-party-gowns', name: 'Party Gowns', slug: 'party-gowns' },
];

export interface NavLinkItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ShopCategory[]>(initialFallbackCats);
  const [activeCategory, setActiveCategory] = useState<string>("cat-skincare");
  const [hotlinePhone, setHotlinePhone] = useState<string>("+880 1706-126663");
  const [isTeasHovered, setIsTeasHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on pathname change
  useEffect(() => {
    setIsTeasHovered(false);
  }, [pathname]);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsTeasHovered(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadNavData() {
      try {
        const [fetched, settings] = await Promise.all([
          fetchShopCategories(),
          fetchShopSettings(),
        ]);
        const mainCategories = fetched.filter(c => !c.parentId);
        const allCats = mainCategories.length > 0 ? mainCategories : initialFallbackCats;
        setCategories(allCats.slice(0, 2));
        if (allCats.length > 0) {
          setActiveCategory(allCats[0].id);
        }
        if (settings?.contactNumber) {
          const contacts = parseContactEntries(settings.contactNumber);
          if (contacts.length > 0 && contacts[0]?.value) {
            setHotlinePhone(contacts[0].value);
          }
        }
      } catch (err) {
        console.error("Failed to load nav data for menu:", err);
      }
    }
    loadNavData();
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsTeasHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTeasHovered(false);
    }, 250);
  };

  const isDeals = searchParams?.get('deals') === 'true' || searchParams?.get('offer') === 'true' || pathname === '/offers';

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/products?deals=true') {
      return isDeals;
    }
    if (href === '/products') {
      return pathname === '/products' && !isDeals;
    }
    return pathname.startsWith(href);
  };

  const currentCategoryData = categories.find((cat) => cat.id === activeCategory) || categories[0] || null;

  const allNavItems: (NavLinkItem & { isOffer?: boolean })[] = [
    { label: "HOME", href: "/", hasDropdown: false },
    { label: "SHOP", href: "/products", hasDropdown: false },
    { label: "CORD SETS", href: "/products?category=Cord%20Sets", hasDropdown: false },
    { label: "PARTY GOWNS", href: "/products?category=Party%20Gowns", hasDropdown: false },
    { label: "LUXURY ABAYAS", href: "/products?category=Luxury%20Abayas", hasDropdown: false },
    { label: "OFFER ZONE", href: "/products?deals=true", hasDropdown: false, isOffer: true },
    { label: "ABOUT US", href: "/about", hasDropdown: false },
    { label: "CONTACT", href: "/contact", hasDropdown: false },
  ];

  const renderNavItem = (item: NavLinkItem & { isOffer?: boolean }) => (
    <div
      key={item.label}
      className="relative shrink-0"
    >
      <Link
        href={item.href}
        className="block"
      >
        {item.isOffer ? (
          <span
            className={`flex items-center whitespace-nowrap rounded-full border border-[#850f2e] px-3.5 py-1 text-[11px] lg:text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              isActive(item.href)
                ? "bg-[#4a1525] text-white shadow-xs border-rose-500/60"
                : "bg-[#360713]/85 text-[#fecdd3] hover:bg-[#4a1525] hover:text-white hover:border-rose-400/80"
            }`}
          >
            <span>{item.label}</span>
          </span>
        ) : (
          <span
            className={`relative flex items-center whitespace-nowrap py-1 text-[11px] lg:text-xs uppercase tracking-wider transition-colors ${
              isActive(item.href)
                ? "text-[#facc15] font-bold after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-3.5 after:h-[2px] after:bg-[#facc15] after:rounded-full"
                : "text-slate-200 font-semibold hover:text-[#facc15]"
            }`}
          >
            {item.label}
          </span>
        )}
      </Link>
    </div>
  );

  return (
    <nav aria-label="Main navigation" className="relative hidden h-8.5 lg:h-9 w-full items-center justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 lg:flex flex-nowrap whitespace-nowrap font-sans">
      {allNavItems.map(renderNavItem)}
    </nav>
  );
}
