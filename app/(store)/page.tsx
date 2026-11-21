"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ProductCard, { ProductCardSkeleton } from "@/components/sections/ui/product-card";
import StoreHero from "@/components/sections/store-hero";
import BrowseCategories from "@/components/sections/browse-categories";
import HorizontalScroller from "@/components/sections/ui/horizontal-scroller";
import StorefrontCta from "@/components/sections/storefront-cta";
import FacebookLiveShowcase from "@/components/sections/facebook-live-showcase";
import StyleLookbook from "@/components/sections/style-lookbook";
import BoutiqueTrust from "@/components/sections/boutique-trust";
import FacebookReviews from "@/components/sections/facebook-reviews";
import FloatingSocialWidget from "@/components/sections/floating-social-widget";
import {
  fetchShopProducts,
  fetchShopCategories,
  type ShopProduct,
  type ShopCategory,
  DEFAULT_NOVAMART_CATEGORIES,
} from "@/lib/shop-api";
import {
  LuBadgeCheck,
  LuRefreshCw,
  LuSearch,
  LuArrowRight,
  LuCheck,
  LuSlidersHorizontal,
  LuTruck,
  LuWalletCards,
} from "react-icons/lu";
import CampaignBanner from "@/components/sections/campaign-banner";

export default function Home() {
  const [categories, setCategories] = useState<ShopCategory[]>(DEFAULT_NOVAMART_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rating" | "discount">("featured");
  const [activeMarqueeIndex, setActiveMarqueeIndex] = useState(0);

  // Load Categories & Products on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchShopCategories(),
          fetchShopProducts({ page: 1, limit: 200 }),
        ]);

        if (cats && cats.length > 0) {
          setCategories(cats);
        }
        if (prods && prods.data) {
          setProducts(prods.data);
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    requestAnimationFrame(() => {
      document.getElementById("featured-picks-section")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  };

  // Filter and sort products
  const displayedProducts = useMemo(() => {
    let result = products;

    // Filter by selected category tab
    if (selectedCategory === "Offers") {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    } else if (selectedCategory !== "All") {
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const team = (p.team || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const sel = selectedCategory.toLowerCase();

        // Exact or substring match
        if (cat === sel || cat.includes(sel) || sel.includes(cat)) return true;

        // Normalized comparison (remove punctuation, hyphens, ampersands, spaces)
        const normCat = cat.replace(/[^a-z0-9]/g, "");
        const normSel = sel.replace(/[^a-z0-9]/g, "");
        if (normCat === normSel || (normCat && normSel && (normCat.includes(normSel) || normSel.includes(normCat)))) {
          return true;
        }

        // Category-specific semantic aliases for boutique fashion
        if (sel.includes("cord") || sel.includes("two piece") || sel.includes("set")) {
          return cat.includes("cord") || name.includes("cord") || name.includes("set");
        }
        if (sel.includes("gown") || sel.includes("anarkali") || sel.includes("party")) {
          return cat.includes("gown") || cat.includes("party") || name.includes("gown") || name.includes("anarkali");
        }
        if (sel.includes("abaya") || sel.includes("borka") || sel.includes("modest") || sel.includes("kaftan")) {
          return cat.includes("abaya") || cat.includes("modest") || name.includes("abaya") || name.includes("borka");
        }
        if (sel.includes("velvet")) {
          return cat.includes("velvet") || name.includes("velvet");
        }
        if (sel.includes("winter") || sel.includes("coat") || sel.includes("jacket") || sel.includes("sweatshirt")) {
          return cat.includes("winter") || name.includes("coat") || name.includes("jacket") || name.includes("sweatshirt");
        }
        if (sel.includes("three") || sel.includes("3-piece") || sel.includes("designer")) {
          return cat.includes("3-piece") || cat.includes("three") || name.includes("3-piece") || name.includes("kurti");
        }
        if (sel.includes("casual")) {
          return cat.includes("casual") || name.includes("maxi") || name.includes("peplum");
        }
        if (sel.includes("hijab") || sel.includes("scarf")) {
          return cat.includes("hijab") || name.includes("hijab") || name.includes("scarf");
        }

        return false;
      });
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.team?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating || 4.7) - (a.rating || 4.7));
    } else if (sortBy === "discount") {
      result = [...result].sort((a, b) => {
        const aDisc =
          a.originalPrice && a.originalPrice > a.price
            ? (a.originalPrice - a.price) / a.originalPrice
            : 0;
        const bDisc =
          b.originalPrice && b.originalPrice > b.price
            ? (b.originalPrice - b.price) / b.originalPrice
            : 0;
        return bDisc - aDisc;
      });
    } else if (sortBy === "featured") {
      // Prioritize on-sale/discounted items when viewing featured collection
      const discounted = result.filter(
        (p) => p.originalPrice && p.originalPrice > p.price
      );
      if (discounted.length > 0) {
        const regular = result.filter((p) => !discounted.includes(p));
        result = [...discounted, ...regular];
      }
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Quick category list for tabs
  const categoryTabs = useMemo(() => {
    const discountedCount = products.filter(
      (p) => p.originalPrice && p.originalPrice > p.price
    ).length;

    return [
      { id: "all", name: "All Products", slug: "All" },
      ...(discountedCount > 0
        ? [
            {
              id: "deals",
              name: `Special Offers (${discountedCount})`,
              slug: "Offers",
            },
          ]
        : []),
      ...categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.name,
      })),
    ];
  }, [categories, products]);

  const featuredProducts = useMemo(() => {
    const discounted = products.filter(
      (product) => product.originalPrice && product.originalPrice > product.price
    );
    const preferredProducts = [...discounted, ...products.filter((product) => !discounted.includes(product))];
    return preferredProducts.slice(0, 16);
  }, [products]);

  const apparelProducts = useMemo(() => {
    const seenImages = new Set<string>();
    return products.filter((product) => {
      if (!/cloth|fashion|apparel|outerwear|garment/i.test(product.category || "")) return false;

      const imageKey = product.image?.split("?")[0] || product.id;
      if (seenImages.has(imageKey)) return false;
      seenImages.add(imageKey);
      return true;
    });
  }, [products]);

  const categoryProductGroups = useMemo(() => {
    const groups = new Map<string, ShopProduct[]>();
    for (const product of products) {
      const category = product.category?.trim();
      if (!category) continue;
      const group = groups.get(category) ?? [];
      group.push(product);
      groups.set(category, group);
    }

    const priorityCategories = [
      "Cord Sets",
      "Party Gowns",
      "Luxury Abayas",
      "Velvet Collection",
      "Winter Collection",
    ];

    const sorted = [...groups.entries()]
      .filter(([, items]) => items.length >= 3)
      .sort((a, b) => {
        const aPriority = priorityCategories.findIndex(
          (p) => p.toLowerCase() === a[0].toLowerCase() || a[0].toLowerCase().includes(p.toLowerCase())
        );
        const bPriority = priorityCategories.findIndex(
          (p) => p.toLowerCase() === b[0].toLowerCase() || b[0].toLowerCase().includes(p.toLowerCase())
        );
        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        return b[1].length - a[1].length;
      });

    return sorted.slice(0, 3);
  }, [products]);

  const activeMarqueeGroup =
    categoryProductGroups[activeMarqueeIndex] || categoryProductGroups[0];

  const renderProductCard = (product: ShopProduct) => (
    <ProductCard
      key={product.id}
      id={product.id}
      name={product.name}
      price={`৳ ${product.price.toLocaleString()}`}
      originalPrice={
        product.originalPrice
          ? `৳ ${product.originalPrice.toLocaleString()}`
          : undefined
      }
      image={product.image}
      slug={product.slug}
      category={product.category}
      brand={product.team}
      rating={product.rating}
      badge={product.badge}
      unit={product.unit}
      variantId={product.variantId}
    />
  );

  const showStorefrontHighlights =
    !loading && selectedCategory === "All" && searchTerm.trim() === "";
  const visibleProducts = displayedProducts.slice(0, 15);
  const shoppingBenefits = [
    {
      icon: LuBadgeCheck,
      title: "Genuine products",
      description: "Sourced from verified suppliers",
    },
    {
      icon: LuTruck,
      title: "Delivery options",
      description: "Available details are shown at checkout",
    },
    {
      icon: LuWalletCards,
      title: "Cash on delivery",
      description: "Pay when your order arrives",
    },
    {
      icon: LuRefreshCw,
      title: "After-purchase support",
      description: "Help when you need it",
    },
  ];

  return (
    <main className="w-full min-h-screen bg-store-page font-sans text-zinc-900 pb-16 sm:pb-20">
      <div className="space-y-12 pt-7 sm:space-y-16 sm:pt-10 lg:space-y-20">
        {/* ── 2. Hero Section: Category Sidebar + Dynamic Campaign Slider ── */}
        <StoreHero
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* The Style Edit Section - Hidden as requested */}
        {/* {showStorefrontHighlights && apparelProducts.length > 0 && (
          <StorefrontStyleRail products={apparelProducts} />
        )} */}

        <section
          aria-label="Shop with confidence"
          className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16"
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {shoppingBenefits.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex min-w-0 flex-col items-start gap-3 rounded-2xl bg-white border border-zinc-200/80 px-4 py-4 sm:flex-row sm:items-center sm:gap-3.5 sm:px-5 sm:py-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold leading-5 text-zinc-900 sm:text-sm">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-zinc-500 sm:text-xs">
                    {description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Browse Categories Section ── */}
        <BrowseCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* ── Mini Thailand Trust & Service Guarantees ── */}
        <BoutiqueTrust />

        {/* ── Mini Thailand Lookbook & Occasions ── */}
        <StyleLookbook />

        {/* ── Trending Outfits from Facebook Live & Reels ── */}
        <FacebookLiveShowcase />

        <StorefrontCta featuredProduct={featuredProducts[0]} />

        {showStorefrontHighlights && products.length > 0 && categoryProductGroups.length > 0 && activeMarqueeGroup && (
          <section
            className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16 space-y-4 sm:space-y-5"
            aria-label="Featured category collections"
          >
            {/* Header: Dynamic 3 Category Tabs + View All Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-200/80">
              {/* 3 Interactive Dynamic Category Tabs with Underline Indicator */}
              <div
                role="tablist"
                aria-label="Select featured collection"
                className="storefront-scroll-track flex items-center gap-5 sm:gap-7 overflow-x-auto max-w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {categoryProductGroups.map(([catName, items], idx) => {
                  const isActive =
                    activeMarqueeIndex === idx ||
                    (idx === 0 && activeMarqueeIndex >= categoryProductGroups.length);

                  return (
                    <button
                      key={catName}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveMarqueeIndex(idx)}
                      className={`group relative shrink-0 pb-3 pt-1 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-2 bg-transparent border-0 outline-none ${
                        isActive
                          ? "text-store-primary"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      <span className="tracking-tight">{catName}</span>
                      <span
                        className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                          isActive
                            ? "bg-store-primary/10 text-store-primary font-semibold"
                            : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200/80 group-hover:text-zinc-700"
                        }`}
                      >
                        {items.length}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-store-primary rounded-full transition-all duration-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic View All Link */}
              <Link
                href={`/products?category=${encodeURIComponent(activeMarqueeGroup[0])}`}
                className="shrink-0 pb-3 pt-1 text-xs sm:text-sm font-medium text-store-accent hover:text-store-primary transition-colors flex items-center gap-1.5 group self-end sm:self-center"
              >
                <span>View all {activeMarqueeGroup[0]}</span>
                <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Single Container-Width Marquee with Smooth Fade Transition */}
            <div key={activeMarqueeGroup[0]} className="w-full overflow-hidden animate-fadeIn">
              <HorizontalScroller
                trackId={`showcase-marquee-${encodeURIComponent(activeMarqueeGroup[0])}`}
                label={`${activeMarqueeGroup[0]} products`}
                marquee={true}
                fullWidth={false}
                reverse={false}
                marqueeDuration={75}
              >
                {activeMarqueeGroup[1].slice(0, 16).map((product) => (
                  <div
                    key={product.id}
                    className="w-[160px] shrink-0 sm:w-[185px] md:w-[210px] lg:w-[220px]"
                  >
                    {renderProductCard(product)}
                  </div>
                ))}
              </HorizontalScroller>
            </div>
          </section>
        )}

        {/* ── Campaign / Brand Banner Section ── */}
        <CampaignBanner />

        {/* ── 4. Featured Picks and Product Catalog ── */}
        <section id="featured-picks-section" className="scroll-mt-44 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 sm:scroll-mt-48">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6 sm:mb-7">
            <div>
              <h2 className="store-section-title">
                {selectedCategory === "All" ? "Explore all products" : selectedCategory}
              </h2>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Quick in-page Search */}
              <div className="relative flex-1 min-w-[180px] sm:min-w-[240px]">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  aria-label="Search homepage products"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full pl-9 pr-8 text-xs sm:text-sm rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none    transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    aria-label="Clear product search"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Select */}
              <div className="flex h-10 items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3">
                <LuSlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  aria-label="Sort products"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs sm:text-sm font-medium text-zinc-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured Items</option>
                  <option value="discount">Special Offers & Discounts</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Category Filter Tabs (Pill Buttons) ── */}
          <div className="storefront-scroll-track flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-7">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab.slug;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(tab.slug)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white text-zinc-700 hover:bg-rose-50 hover:text-rose-600 border border-zinc-200/80 shadow-2xs"
                  }`}
                >
                  {isActive && <LuCheck className="w-3.5 h-3.5 text-white" />}
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Responsive product grid (5 Columns on Desktop matching Shop Page) */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {visibleProducts.map((product) => (
                <div key={product.id}>{renderProductCard(product)}</div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200/80 p-8">
              <p className="text-zinc-500 text-sm">
                No products found matching your filter or search.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchTerm("");
                }}
                className="mt-4 px-5 py-2 rounded-lg bg-store-accent text-white text-xs font-medium hover:bg-store-hover transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* View Full Catalog Link */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 text-center">
            {displayedProducts.length > visibleProducts.length && (
              <p className="text-[11px] text-zinc-500">
                Showing {visibleProducts.length} of {displayedProducts.length} products
              </p>
            )}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-600 text-rose-600 hover:text-white font-semibold text-sm shadow-2xs active:scale-95 transition-all duration-200"
            >
              <span>Explore All Products</span>
              <LuArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
        {/* ── Real Customer Love from Facebook ── */}
        <FacebookReviews />

        {/* ── Floating WhatsApp & Messenger Support Widget ── */}
        <FloatingSocialWidget />
      </div>
    </main>
  );
}
