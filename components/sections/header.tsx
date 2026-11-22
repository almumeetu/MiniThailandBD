"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import MobileMenu from "./ui/mobile-menu";
import Navigation from "./ui/navigation";
import TopHeader from "./top-header";
import { IoHeartOutline } from "react-icons/io5";
import { LuShoppingBag, LuUser, LuChevronDown, LuLogOut, LuTruck, LuX, LuLayoutDashboard, LuSearch } from "react-icons/lu";
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

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

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
      { label: "Shop", href: "/products", hasDropdown: false },
      { label: "Cord Sets", href: "/products?category=Cord%20Sets" },
      { label: "Party Gowns", href: "/products?category=Party%20Gowns" },
      { label: "Luxury Abayas", href: "/products?category=Luxury%20Abayas" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ];
  }, []);

  // Close dropdowns/suggestions and scroll to top on route changes
  useEffect(() => {
    setDropdownOpen(false);
    setShowSuggestions(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  // Close dropdowns/suggestions and track isScrolled without unnecessary re-renders
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 30;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedOutsideDesktop = !desktopDropdownRef.current || !desktopDropdownRef.current.contains(target);
      const clickedOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setDropdownOpen(false);
      }
      if (
        !desktopSearchRef.current?.contains(target) &&
        !mobileSearchRef.current?.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <header
        className={`w-full font-sans transition-all duration-300 z-50 ${
          isHome
            ? `fixed top-0 left-0 right-0 ${
                isScrolled
                  ? "bg-[#121214]/95 backdrop-blur-md shadow-xl"
                  : "bg-gradient-to-b from-black/55 via-black/25 to-transparent pointer-events-auto"
              }`
            : `sticky top-0 ${
                isScrolled
                  ? "bg-[#121214]/95 backdrop-blur-md shadow-xl"
                  : "bg-[#121214] shadow-md"
              }`
        }`}
      >
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-10 opacity-100"
          }`}
        >
          <TopHeader isScrolled={isScrolled} isHome={isHome} />
        </div>

      {/* ═══════════════ Desktop Main Header ═══════════════ */}
      <div className="hidden lg:block bg-transparent">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 flex items-center justify-between h-[60px] gap-6 xl:gap-8">
          {/* Logo */}
          <div className="shrink-0">
            <Logo variant="light" size="lg" />
          </div>

          {/* Search Bar — smart, sleek & compact matching reference image */}
          <div className="flex-1 max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] mx-auto relative" ref={desktopSearchRef}>
            <form
              onSubmit={(e) => { handleSearchSubmit(e); setShowSuggestions(false); }}
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

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-zinc-800 shadow-2xl border border-zinc-200/80 py-2.5 z-[999] rounded-2xl overflow-hidden animate-fadeIn">
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
            )}
          </div>

          {/* Right Actions matching Screenshot */}
          <div className="flex items-center gap-4 xl:gap-5.5 shrink-0 text-xs font-semibold text-white">
            <Link
              href="/wishlist"
              className="relative hover:text-[#facc15] text-white/90 hover:text-white transition-colors hidden sm:flex items-center gap-1.5 py-1"
              aria-label={mounted && wishlistItemCount > 0 ? `Wishlist (${wishlistItemCount} items)` : "Wishlist"}
            >
              <IoHeartOutline className="w-[18px] h-[18px] text-white/90" />
              <span className="font-medium text-[13px] tracking-normal">Wishlist</span>
              {mounted && wishlistItemCount > 0 && (
                <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#ec1c67] text-[10px] text-white font-bold leading-none shadow-xs">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="hover:text-[#facc15] text-white/90 hover:text-white transition-colors font-medium text-[13px] tracking-normal py-1"
            >
              My Cart
            </Link>

            {!mounted || !isAuthenticated ? (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="relative p-1 text-white/90 hover:text-white transition-colors cursor-pointer select-none"
                aria-label="Customer Login"
                title="Customer Login / Account"
              >
                <LuUser className="w-5 h-5" />
              </button>
            ) : (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer focus:outline-none"
                  aria-label="User profile menu"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-store-primary text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                    {user?.avatarUrl || (user as any)?.avatar ? (
                      <Image
                        src={user?.avatarUrl || (user as any)?.avatar || ""}
                        alt={user?.name || "User"}
                        width={32}
                        height={32}
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
                  <div className="text-left hidden lg:block">
                    <p className="text-[10px] text-slate-400 leading-none">Hello,</p>
                    <p className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                      {user?.name?.split(" ")[0] || "Account"}
                    </p>
                  </div>
                  <LuChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Desktop User Dropdown */}
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
            )}

            {/* Cart Icon with Counter - Opens Mini Cart Drawer */}
            <button
              type="button"
              onClick={openBag}
              className="relative p-1 text-white/90 hover:text-white transition-colors cursor-pointer select-none"
              aria-label={mounted && cartItemCount > 0 ? `Shopping Cart (${cartItemCount} items)` : "Shopping Cart"}
            >
              <LuShoppingBag className="w-5 h-5" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#ec1c67] text-[10px] font-bold text-white shadow-xs">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ Desktop Navigation Bar ═══════════════ */}
      <div className="hidden lg:block bg-transparent text-white pb-1">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4">
          <Navigation />
        </div>
      </div>

      {/* ═══════════════ Mobile Header ═══════════════ */}
      <div
        className={`lg:hidden transition-all duration-300 ${
          isHome && !isScrolled
            ? "bg-transparent border-b border-white/10"
            : isScrolled
            ? "bg-[#121214]/95 backdrop-blur-md border-b border-white/10 shadow-xl"
            : "bg-[#121214] border-b border-white/10 shadow-sm"
        }`}
      >
        {/* Mobile top row: menu + logo + icons */}
        <div className="flex items-center justify-between gap-1 px-3 sm:px-4 h-16">
          <div className="flex items-center shrink-0">
            <MobileMenu
              navItems={dynamicNavItems}
              sylhetiTeaItems={storeCategoryItems}
              categories={categories.slice(0, 2)}
              triggerClassName="text-slate-200 hover:text-white hover:bg-white/10"
            />
          </div>

          <div className="min-w-0 flex items-center justify-center">
            <Logo variant="light" size="md" className="storefront-mobile-logo" />
          </div>

          {/* Mobile Right Action Icons (Wishlist & Shopping Bag) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Link
              href="/wishlist"
              className="relative grid h-10 w-10 place-items-center text-slate-200 transition-colors hover:text-[#ec1c67]"
              aria-label="Wishlist"
            >
              <IoHeartOutline className="w-5 h-5" />
              {mounted && wishlistItemCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#ec1c67] text-[9px] text-white font-bold shadow-xs">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openBag}
              className="relative grid h-10 w-10 place-items-center text-slate-200 transition-colors hover:text-[#ec1c67] cursor-pointer select-none"
              aria-label={mounted && cartItemCount > 0 ? `Shopping Cart (${cartItemCount} items)` : "Shopping Cart"}
            >
              <LuShoppingBag className="w-5 h-5" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[17px] h-4 px-1 rounded-full bg-[#ec1c67] text-[9px] text-white font-bold leading-none shadow-xs">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>

            {!mounted || !isAuthenticated ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden md:grid h-10 w-10 cursor-pointer place-items-center text-slate-200 transition-colors hover:text-[#ec1c67]"
                aria-label="Sign in"
              >
                <LuUser className="w-5 h-5" />
              </button>
            ) : (
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-store-primary text-xs font-bold text-white"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
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
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-zinc-200 p-1.5 z-50 font-sans">
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

        {/* Mobile search bar — full width below header row */}
        <div className="relative px-4 pb-3" ref={mobileSearchRef}>
          <form
            onSubmit={(e) => { handleSearchSubmit(e); setShowSuggestions(false); }}
            className="flex items-center w-full relative"
          >
            <LuSearch className="absolute left-3.5 w-4 h-4 text-white/90 pointer-events-none stroke-[2.2]" />
            <input
              type="text"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full h-10 pl-10 pr-12 rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#ec1c67] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                className="absolute right-12 text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                aria-label="Clear search"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Submit Search"
              className="absolute right-1 top-1 bottom-1 px-3.5 rounded-full bg-[#ec1c67] hover:bg-[#d81358] text-white text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
            >
              <LuSearch className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Mobile Search Suggestions */}
          {showSuggestions && searchQuery.trim() !== "" && (
            <div className="absolute left-4 right-4 top-full z-[999] mt-1.5 max-h-[min(240px,45dvh)] overflow-y-auto rounded-lg border border-zinc-200 bg-white py-2 text-zinc-800 shadow-xl">
              {isSearching ? (
                <div className="flex items-center justify-center py-5 gap-2 text-sm text-zinc-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-store-primary border-t-transparent" />
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="max-h-[240px] overflow-y-auto">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug ?? product.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 transition-colors"
                    >
                      <div className="w-9 h-9 shrink-0 relative overflow-hidden bg-zinc-100 rounded border border-zinc-200">
                        <Image
                          src={product.image || "/images/no-image-icon-6.png"}
                          alt={product.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-medium text-zinc-800 truncate">{product.name}</h4>
                        <span className="text-[10px] text-zinc-400">{product.category}</span>
                      </div>
                      <span className="text-xs font-semibold text-zinc-900 shrink-0">
                        ৳{product.price.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-5 text-center text-xs text-zinc-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
