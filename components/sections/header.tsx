"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import MobileMenu from "./ui/mobile-menu";
import Navigation from "./ui/navigation";
import TopHeader from "./top-header";
import { IoHeartOutline } from "react-icons/io5";
import {
  LuShoppingBag,
  LuUser,
  LuChevronDown,
  LuLogOut,
  LuTruck,
  LuX,
  LuLayoutDashboard,
  LuSearch,
  LuArrowLeft,
} from "react-icons/lu";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { fetchShopProducts, fetchShopCategories, type ShopProduct, type ShopCategory } from "@/lib/shop-api";
import { getAdminToken, isAllowedAdminRole } from "@/lib/admin-api";
import Logo from "@/components/ui/logo";

const storeCategoryItems = [
  { label: "Co-ord Sets", href: "/products?category=Co-ord+Sets" },
  { label: "Party Gowns", href: "/products?category=Party+Gowns" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, setShowAuthModal, logout } = useAuth();
  const { itemCount: cartItemCount, openBag } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ShopProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const stickySearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus sticky search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Fetch categories dynamically for mobile menu navigation
  useEffect(() => {
    fetchShopCategories()
      .then((cats) => {
        const main = cats.filter((c) => !c.parentId);
        if (main.length > 0) setCategories(main);
      })
      .catch((err) => console.error("Failed to load header categories:", err));
  }, []);

  const dynamicNavItems = useMemo(() => {
    return [
      { label: "Home", href: "/" },
      { label: "Shop All", href: "/products", hasDropdown: true },
      { label: "Cord Sets", href: "/products?category=Cord%20Sets" },
      { label: "Party Gowns", href: "/products?category=Party%20Gowns" },
      { label: "Luxury Abayas", href: "/products?category=Luxury%20Abayas" },
      { label: "Velvet Edit", href: "/products?category=Velvet%20Collection" },
      { label: "Special Offers", href: "/offers" },
      { label: "Watch & Shop", href: "/videos" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ];
  }, []);

  // Close dropdowns/suggestions and scroll to top on route changes
  useEffect(() => {
    setDropdownOpen(false);
    setShowSuggestions(false);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Direction-aware scroll tracking with hysteresis to eliminate flicker loops
  useEffect(() => {
    let lastScrollY = typeof window !== "undefined" ? Math.max(0, window.scrollY) : 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);

          // 1. Page Top threshold:
          // <= 20px: Reset to Top Mode (full 3-row header, always visible)
          // > 40px: Enter Sticky Single-Line Mode
          if (currentScrollY <= 20) {
            setIsScrolled(false);
            setIsVisible(true);
            setIsSearchOpen(false);
          } else if (currentScrollY > 40) {
            setIsScrolled(true);

            // On desktop (lg), keep the compact 58px single-line header pinned at top for seamless navigation & sticky sidebar alignment.
            // On mobile, hide when scrolling down past 120px to maximize screen real estate.
            if (typeof window !== "undefined" && window.innerWidth >= 1024) {
              setIsVisible(true);
            } else {
              const diff = currentScrollY - lastScrollY;
              if (Math.abs(diff) > 8) {
                if (diff > 0 && currentScrollY > 120) {
                  // Scrolling DOWN past 120px on mobile: smoothly hide
                  if (!isSearchOpen && !dropdownOpen && !showSuggestions) {
                    setIsVisible(false);
                  }
                } else if (diff < 0) {
                  // Scrolling UP: smoothly reveal header
                  setIsVisible(true);
                }
              }
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearchOpen, dropdownOpen, showSuggestions]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync search input with URL search param
  useEffect(() => {
    const search = searchParams?.get("search") || "";
    setSearchQuery(search);
  }, [searchParams]);

  // Debounced search suggestions fetch
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetchShopProducts({
          page: 1,
          limit: 5,
          search: trimmedQuery,
        });
        if (!cancelled) setSuggestions(res.data);
      } catch (err) {
        console.error("Failed to fetch search suggestions:", err);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const clickedOutsideDesktop = !desktopDropdownRef.current || !desktopDropdownRef.current.contains(target);
      const clickedOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setDropdownOpen(false);
      }
      if (
        !desktopSearchRef.current?.contains(target) &&
        !stickySearchRef.current?.contains(target) &&
        !mobileSearchRef.current?.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ═══════════════ Helper: Search Suggestions Dropdown ═══════════════
  const renderSearchSuggestions = (isStickyOverlay: boolean = false) => (
    <div
      className={`absolute top-full left-0 right-0 mt-2 bg-white text-zinc-800 shadow-2xl border border-zinc-200/80 py-2.5 z-[999] rounded-2xl overflow-hidden animate-fadeIn ${
        isStickyOverlay ? "max-w-[760px]" : ""
      }`}
    >
      {isSearching ? (
        <div className="flex items-center justify-center py-6 px-4 gap-2 text-sm text-zinc-500">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-store-primary border-t-transparent" />
          Searching...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="flex flex-col">
          <div className="px-4 pb-2 mb-1 border-b border-zinc-100 text-[10px] uppercase font-bold tracking-wider text-zinc-400 select-none">
            Matching Products
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug ?? product.id}`}
                onClick={() => {
                  setShowSuggestions(false);
                  if (isStickyOverlay) setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-zinc-50 transition-colors group"
              >
                <div className="w-11 h-11 shrink-0 relative overflow-hidden bg-zinc-100 rounded-lg border border-zinc-200">
                  <Image
                    src={product.image || "/images/no-image-icon-6.png"}
                    alt={product.name}
                    fill
                    sizes="44px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-sm font-medium text-zinc-800 truncate group-hover:text-store-primary transition-colors">
                    {product.name}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                <div className="text-sm font-semibold text-zinc-900 shrink-0">
                  ৳{product.price.toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-zinc-100 mt-1 pt-2.5 px-3">
            <button
              onClick={(e) => {
                handleSearchSubmit(e);
                setShowSuggestions(false);
                if (isStickyOverlay) setIsSearchOpen(false);
              }}
              className="w-full py-2 bg-store-primary hover:bg-store-accent text-white font-semibold text-xs uppercase tracking-wider text-center transition-colors rounded-xl cursor-pointer shadow-xs"
            >
              View All Results
            </button>
          </div>
        </div>
      ) : (
        <div className="py-6 px-4 text-center text-sm text-zinc-500 select-none">
          No products found for &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );

  // ═══════════════ Helper: User Account Dropdown ═══════════════
  const renderUserAccount = (isCompact: boolean = false) => {
    if (!mounted || !isAuthenticated) {
      return (
        <button
          type="button"
          onClick={() => setShowAuthModal(true)}
          className="relative p-1.5 text-white/90 hover:text-[#facc15] transition-colors cursor-pointer select-none"
          aria-label="Customer Login"
          title="Customer Login / Account"
        >
          <LuUser className="w-5 h-5" />
        </button>
      );
    }

    return (
      <div className="relative" ref={desktopDropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer focus:outline-none"
          aria-label="User profile menu"
          aria-expanded={dropdownOpen}
        >
          <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-store-primary text-white flex items-center justify-center font-bold text-[10.5px] overflow-hidden shrink-0 ring-1 ring-white/25">
            {user?.avatarUrl || (user as any)?.avatar ? (
              <Image
                src={user?.avatarUrl || (user as any)?.avatar || ""}
                alt={user?.name || "User"}
                width={28}
                height={28}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {user?.name
                  ? user.name
                      .trim()
                      .split(/\s+/)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "U"}
              </span>
            )}
          </div>
          {!isCompact && (
            <div className="text-left hidden lg:block">
              <p className="text-[10px] text-slate-400 leading-none">Hello,</p>
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                {user?.name?.split(" ")[0] || "Account"}
              </p>
            </div>
          )}
          <LuChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-zinc-200 p-1.5 z-50 font-sans animate-fadeIn">
            <div className="px-3.5 py-3 border-b border-zinc-100 mb-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-store-primary text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                  {user?.avatarUrl || (user as any)?.avatar ? (
                    <Image
                      src={user?.avatarUrl || (user as any)?.avatar || ""}
                      alt={user?.name || "User"}
                      width={36}
                      height={36}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user?.name
                        ? user.name
                            .trim()
                            .split(/\s+/)
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {user?.name || "Account Profile"}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 rounded-lg transition-colors cursor-pointer"
              >
                <LuUser className="w-4 h-4 text-zinc-400" />
                My Account
              </Link>
              <Link
                href="/profile?tab=orders"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 rounded-lg transition-colors cursor-pointer"
              >
                <LuShoppingBag className="w-4 h-4 text-zinc-400" />
                My Orders
              </Link>
              <Link
                href="/profile?tab=track"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 rounded-lg transition-colors cursor-pointer"
              >
                <LuTruck className="w-4 h-4 text-zinc-400" />
                Track Shipment
              </Link>
              <Link
                href="/profile?tab=wishlist"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 rounded-lg transition-colors cursor-pointer"
              >
                <IoHeartOutline className="w-4 h-4 text-zinc-400" />
                Wishlist
              </Link>

              {Boolean(getAdminToken() || isAllowedAdminRole((user as { role?: unknown })?.role)) && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-100"
                >
                  <LuLayoutDashboard className="w-4 h-4 text-store-primary" />
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Customer Support */}
            <div className="px-3.5 py-2 bg-zinc-50 rounded-lg my-1 border border-zinc-100">
              <p className="text-[10px] uppercase font-bold text-zinc-400">
                Customer Support
              </p>
              <a
                href="tel:01706126663"
                className="text-xs font-bold text-store-primary hover:underline"
              >
                +880 1706-126663
              </a>
            </div>

            <div className="my-1 border-t border-zinc-100" />

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LuLogOut className="w-4 h-4 text-red-500" />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════ Helper: Desktop Action Icons ═══════════════
  const renderActions = (isStickyMode: boolean) => (
    <>
      {/* Sticky Search Icon Toggle (Opens Search Overlay within 58px bar) */}
      {isStickyMode && (
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen((prev) => !prev);
            setShowSuggestions(false);
          }}
          className={`p-1.5 transition-colors cursor-pointer select-none rounded-full hover:bg-white/10 ${
            isSearchOpen ? "text-[#ec1c67]" : "text-white/90 hover:text-[#facc15]"
          }`}
          aria-label={isSearchOpen ? "Close search overlay" : "Open search"}
          title={isSearchOpen ? "Close search (Esc)" : "Search products"}
        >
          {isSearchOpen ? (
            <LuX className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <LuSearch className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>
      )}

      {/* Wishlist Link */}
      <Link
        href="/wishlist"
        className="relative text-white/90 hover:text-[#facc15] transition-colors hidden sm:flex items-center gap-1.5 py-1"
        aria-label={mounted && wishlistItemCount > 0 ? `Wishlist (${wishlistItemCount} items)` : "Wishlist"}
      >
        <IoHeartOutline className="w-[18px] h-[18px] text-white/90" />
        {!isStickyMode && (
          <span className="font-medium text-[13px] tracking-normal hidden xl:inline">Wishlist</span>
        )}
        {mounted && wishlistItemCount > 0 && (
          <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#ec1c67] text-[10px] text-white font-bold leading-none shadow-xs">
            {wishlistItemCount}
          </span>
        )}
      </Link>

      {/* My Cart Link */}
      <Link
        href="/cart"
        className="text-white/90 hover:text-[#facc15] transition-colors font-medium text-[13px] tracking-normal py-1 hidden xl:inline"
      >
        My Cart
      </Link>

      {/* User Account / Profile */}
      {renderUserAccount(isStickyMode)}

      {/* Cart Icon with Counter - Opens Mini Cart Drawer */}
      <button
        type="button"
        onClick={openBag}
        className="relative p-1 text-white/90 hover:text-[#facc15] transition-colors cursor-pointer select-none"
        aria-label={mounted && cartItemCount > 0 ? `Shopping Cart (${cartItemCount} items)` : "Shopping Cart"}
      >
        <LuShoppingBag className="w-5 h-5" />
        {mounted && cartItemCount > 0 && (
          <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#ec1c67] text-[10px] font-bold text-white shadow-xs">
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </span>
        )}
      </button>
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full font-sans transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${
          isHome
            ? isScrolled
              ? "bg-[#121214]/98 backdrop-blur-md shadow-2xl border-b border-white/10"
              : "bg-gradient-to-b from-black/80 via-black/45 to-transparent pointer-events-auto"
            : "bg-[#121214] shadow-md border-b border-white/10"
        } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        {/* ──── Top Announcement Bar: only displayed when at top of page ──── */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-10 opacity-100"
          }`}
        >
          <TopHeader isScrolled={isScrolled} isHome={isHome} />
        </div>

        {/* ═══════════════ Desktop Header ═══════════════ */}
        <div className="hidden lg:block bg-transparent relative">
          {!isScrolled ? (
            /* ── TOP MODE: Full 3-Row Header (h-[134px] total) ── */
            <div>
              {/* Row 1: Logo (Left) + Search Bar (Center 3-col Grid) + Actions (Right) */}
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 grid grid-cols-[1fr_minmax(300px,540px)_1fr] items-center h-[64px] gap-4 xl:gap-8">
                {/* Col 1: Logo */}
                <div className="flex items-center justify-start shrink-0 min-w-0">
                  <Logo variant="light" size="lg" />
                </div>

                {/* Col 2: Search Bar (Dead-center horizontally, directly above Navigation) */}
                <div
                  className="w-full flex items-center justify-center min-w-0"
                  ref={desktopSearchRef}
                >
                  <div className="w-full max-w-[540px] relative">
                    <form
                      onSubmit={(e) => {
                        handleSearchSubmit(e);
                        setShowSuggestions(false);
                      }}
                      className="relative flex items-center w-full"
                    >
                      <LuSearch className="absolute left-3.5 w-4 h-4 text-white/90 pointer-events-none stroke-[2.2]" />
                      <input
                        type="text"
                        aria-label="Search products"
                        placeholder="Search skincare, perfumes, fashion, cord sets, gowns, electronics..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full h-9 pl-10 pr-26 rounded-full border border-white/20 bg-white/10 hover:bg-white/[0.14] focus:bg-black/60 focus:border-white/40 backdrop-blur-md text-xs text-white placeholder:text-white/60 outline-none transition-all shadow-inner"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setShowSuggestions(false);
                          }}
                          className="absolute right-22 text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                          aria-label="Clear search"
                        >
                          <LuX className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="submit"
                        aria-label="Submit Search"
                        className="absolute right-1 h-7 px-3.5 rounded-full bg-[#ec1c67] hover:bg-[#d81358] active:scale-95 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <LuSearch className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Search</span>
                      </button>
                    </form>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchQuery.trim() !== "" && renderSearchSuggestions(false)}
                  </div>
                </div>

                {/* Col 3: Actions */}
                <div className="flex items-center justify-end gap-3.5 xl:gap-5 shrink-0 text-xs font-semibold text-white min-w-0">
                  {renderActions(false)}
                </div>
              </div>

              {/* Row 2: Centered Navigation Menu */}
              <div
                className={`border-t border-white/10 text-white py-2 transition-colors duration-200 ${
                  isHome ? "bg-black/30 backdrop-blur-xs" : "bg-[#121214]"
                }`}
              >
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 flex justify-center">
                  <Navigation />
                </div>
              </div>
            </div>
          ) : (
            /* ── STICKY MODE: Single Line Header (h-[58px]) ── */
            <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 flex items-center justify-between h-[58px] gap-4 xl:gap-8 animate-fadeIn">
              {/* Left: Compact Logo */}
              <div className="flex items-center justify-start shrink-0 min-w-0">
                <Logo variant="light" size="md" />
              </div>

              {/* Center: Navigation Menu */}
              <div className="flex-1 flex justify-center px-2 min-w-0">
                <Navigation />
              </div>

              {/* Right: Actions with Search Icon */}
              <div className="flex items-center justify-end gap-3.5 xl:gap-5 shrink-0 text-xs font-semibold text-white min-w-0">
                {renderActions(true)}
              </div>

              {/* Sticky Search Overlay (slides over the 58px bar when search toggle icon is clicked) */}
              {isSearchOpen && (
                <div
                  ref={stickySearchRef}
                  className="absolute inset-0 bg-[#121214] z-50 flex items-center px-4 sm:px-6 md:px-8 xl:px-12 animate-fadeIn border-b border-white/10 shadow-2xl"
                >
                  <div className="max-w-[760px] w-full mx-auto relative flex items-center gap-3">
                    <form
                      onSubmit={(e) => {
                        handleSearchSubmit(e);
                        setShowSuggestions(false);
                        setIsSearchOpen(false);
                      }}
                      className="relative flex items-center flex-1"
                    >
                      <LuSearch className="absolute left-4 w-4 h-4 text-white/70 pointer-events-none stroke-[2.2]" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        aria-label="Search products"
                        placeholder="Search skincare, perfumes, fashion, cord sets, gowns, electronics..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full h-10 pl-11 pr-24 rounded-full border border-white/20 bg-white/10 hover:bg-white/[0.14] focus:bg-black/60 focus:border-[#ec1c67] text-sm text-white placeholder:text-white/50 outline-none transition-all shadow-inner"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setShowSuggestions(false);
                          }}
                          className="absolute right-20 text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                          aria-label="Clear search"
                        >
                          <LuX className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="submit"
                        aria-label="Submit Search"
                        className="absolute right-1 h-8 px-4 rounded-full bg-[#ec1c67] hover:bg-[#d81358] active:scale-95 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <LuSearch className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Search</span>
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-xs font-medium shrink-0"
                      aria-label="Close search"
                      title="Close search (Esc)"
                    >
                      <LuX className="w-5 h-5" />
                      <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        ESC
                      </span>
                    </button>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchQuery.trim() !== "" && renderSearchSuggestions(true)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════ Mobile Header (Single Line) ═══════════════ */}
        <div
          className={`lg:hidden transition-all duration-300 relative ${
            isHome && !isScrolled
              ? "bg-transparent border-b border-white/10"
              : isScrolled
              ? "bg-[#121214]/95 backdrop-blur-md border-b border-white/10 shadow-xl"
              : "bg-[#121214] border-b border-white/10 shadow-sm"
          }`}
        >
          {/* Single-Line Mobile Header: Menu + Logo (Left), Search Input (Center), Actions (Right) */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 h-14 sm:h-15">
            {/* Left: Mobile Menu Trigger + Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
              <div className="flex items-center shrink-0">
                <MobileMenu
                  navItems={dynamicNavItems}
                  sylhetiTeaItems={storeCategoryItems}
                  categories={categories}
                  triggerClassName="text-slate-200 hover:text-white hover:bg-white/10"
                />
              </div>

              <div className="flex items-center shrink-0">
                <Logo variant="light" size="sm" className="storefront-mobile-logo" />
              </div>
            </div>

            {/* Center: Real Single-Line Interactive Search Bar */}
            <div className="flex-1 min-w-0 max-w-[210px] sm:max-w-xs mx-1 sm:mx-2 relative" ref={mobileSearchRef}>
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setShowSuggestions(false);
                }}
                className="relative flex items-center w-full"
              >
                <LuSearch className="absolute left-2.5 w-3.5 h-3.5 text-white/70 pointer-events-none stroke-[2.2]" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  aria-label="Search products"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full h-8 pl-7 pr-6 rounded-full border border-white/20 bg-white/10 hover:bg-white/[0.16] focus:bg-black/90 focus:border-[#ec1c67] text-[11px] text-white placeholder:text-white/60 outline-none transition-all shadow-inner backdrop-blur-md"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="absolute right-2 text-slate-300 hover:text-white p-0.5 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <LuX className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </form>

              {/* Mobile Search Suggestions Dropdown positioned fixed across screen width */}
              {showSuggestions && searchQuery.trim() !== "" && (
                <div className="fixed left-3 right-3 top-16 z-[999] max-h-[min(320px,55dvh)] overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xl animate-fadeIn">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6 px-4 gap-2 text-xs text-zinc-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-store-primary border-t-transparent" />
                      Searching products...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="px-3.5 py-2 border-b border-zinc-100 text-[10px] uppercase font-bold tracking-wider text-zinc-400 select-none">
                        Matching Products ({suggestions.length})
                      </div>
                      <div className="max-h-[240px] overflow-y-auto divide-y divide-zinc-100">
                        {suggestions.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug ?? product.id}`}
                            onClick={() => {
                              setShowSuggestions(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 px-3.5 py-2 hover:bg-zinc-50 transition-colors"
                          >
                            <div className="w-9 h-9 shrink-0 relative overflow-hidden bg-zinc-100 rounded-lg border border-zinc-200">
                              <Image
                                src={product.image || "/images/no-image-icon-6.png"}
                                alt={product.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="text-xs font-semibold text-zinc-800 truncate">{product.name}</h4>
                              <span className="text-[10px] text-zinc-400">{product.category}</span>
                            </div>
                            <span className="text-xs font-bold text-store-primary shrink-0">
                              ৳{product.price.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t border-zinc-100 bg-zinc-50">
                        <button
                          onClick={(e) => {
                            handleSearchSubmit(e);
                            setShowSuggestions(false);
                          }}
                          className="w-full py-1.5 bg-store-primary hover:bg-[#d81358] active:scale-[0.99] text-white font-bold text-[11px] uppercase tracking-wider text-center transition-all rounded-lg cursor-pointer shadow-xs"
                        >
                          View All Results
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 px-4 text-center text-xs text-zinc-500">
                      No products found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Right Action Icons (Wishlist, Shopping Bag & User Profile) */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Link
                href="/wishlist"
                className="relative grid h-9 w-8 sm:w-9 place-items-center text-slate-200 transition-colors hover:text-[#ec1c67]"
                aria-label="Wishlist"
              >
                <IoHeartOutline className="w-4.5 h-4.5" />
                {mounted && wishlistItemCount > 0 && (
                  <span className="absolute top-0.5 right-0 flex items-center justify-center min-w-[15px] h-3.5 px-0.5 rounded-full bg-[#ec1c67] text-[8.5px] text-white font-bold shadow-xs">
                    {wishlistItemCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={openBag}
                className="relative grid h-9 w-8 sm:w-9 place-items-center text-slate-200 transition-colors hover:text-[#ec1c67] cursor-pointer select-none"
                aria-label={mounted && cartItemCount > 0 ? `Shopping Cart (${cartItemCount} items)` : "Shopping Cart"}
              >
                <LuShoppingBag className="w-4.5 h-4.5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute top-0.5 right-0 flex items-center justify-center min-w-[15px] h-3.5 px-0.5 rounded-full bg-[#ec1c67] text-[8.5px] text-white font-bold leading-none shadow-xs">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>

              {!mounted || !isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="grid h-9 w-8 sm:w-9 cursor-pointer place-items-center text-slate-200 transition-colors hover:text-[#ec1c67]"
                  aria-label="Sign in"
                  title="Sign in to your account"
                >
                  <LuUser className="w-4.5 h-4.5" />
                </button>
              ) : (
                <div className="relative flex items-center h-9 px-0.5" ref={mobileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-store-primary text-[10px] font-bold text-white ring-1 ring-white/30 shadow-xs hover:ring-white/60 transition-all select-none"
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                  >
                    {user?.avatarUrl || (user as any)?.avatar ? (
                      <Image
                        src={user?.avatarUrl || (user as any)?.avatar || ""}
                        alt={user?.name || "User"}
                        width={24}
                        height={24}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {user?.name
                          ? user.name
                              .trim()
                              .split(/\s+/)
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </span>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-zinc-200 p-1.5 z-50 font-sans animate-fadeIn">
                      <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                        <p className="text-xs font-bold text-zinc-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg w-full text-left cursor-pointer"
                      >
                        <LuUser className="w-4 h-4 text-zinc-400" /> My Account
                      </Link>
                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg w-full text-left cursor-pointer"
                      >
                        <LuShoppingBag className="w-4 h-4 text-zinc-400" /> My Orders
                      </Link>
                      <Link
                        href="/profile?tab=wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg w-full text-left cursor-pointer"
                      >
                        <IoHeartOutline className="w-4 h-4 text-zinc-400" /> Wishlist
                      </Link>
                      <div className="my-1 border-t border-zinc-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <LuLogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Fixed Reserved Spacer to maintain constant document flow height across all non-home pages ── */}
      {!isHome && (
        <div
          className="w-full pointer-events-none select-none shrink-0 lg:hidden h-14 sm:h-15"
          aria-hidden="true"
        />
      )}
    </>
  );
}
