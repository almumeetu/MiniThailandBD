"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Package, Sparkles, Tag, TrendingUp, ShoppingBag } from "lucide-react";
import { fetchShopCategories, type ShopCategory } from "@/lib/shop-api";

export default function EcomMegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<ShopCategory[]>([]);

  useEffect(() => {
    fetchShopCategories().then(setCategories).catch(console.error);
  }, []);

  // Split categories into 4 columns
  const categoriesPerColumn = Math.ceil(categories.length / 4);
  const columns = [
    categories.slice(0, categoriesPerColumn),
    categories.slice(categoriesPerColumn, categoriesPerColumn * 2),
    categories.slice(categoriesPerColumn * 2, categoriesPerColumn * 3),
    categories.slice(categoriesPerColumn * 3),
  ];

  const menuItems = [
    { name: "Shop All", hasDropdown: true },
    { name: "New In", hasDropdown: true },
    { name: "Deals", hasDropdown: true },
  ];

  return (
    <nav className="relative">
      {/* Menu Items */}
      <div className="flex items-center gap-7">
        {menuItems.map((item) => (
          <div
            key={item.name}
            onMouseEnter={() => setActiveMenu(item.name)}
            onMouseLeave={() => setActiveMenu(null)}
            className="relative"
          >
            <button className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors hover:text-neutral-600">
              {item.name}
              {item.hasDropdown && (
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    activeMenu === item.name ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Mega Menu Dropdown */}
      {activeMenu && (
        <div
          onMouseEnter={() => setActiveMenu(activeMenu)}
          onMouseLeave={() => setActiveMenu(null)}
          className="absolute left-0 right-0 top-full z-50 mt-0"
        >
          <div className="bg-white shadow-2xl border-t border-neutral-200">
            <div className="mx-auto max-w-[1400px] px-8 py-12">
              {/* Shop All Menu */}
              {activeMenu === "Shop All" && (
                <div className="grid grid-cols-4 gap-x-12 gap-y-8">
                  {columns.map((column, colIndex) => (
                    <div key={colIndex}>
                      <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-900 border-b border-neutral-200 pb-3">
                        <Package className="h-4 w-4 text-neutral-500" />
                        {colIndex === 0 ? "Top Categories" : `Categories ${colIndex + 1}`}
                      </h3>
                      <ul className="space-y-3.5">
                        {column.map((cat) => (
                          <li key={cat.id}>
                            <Link
                              href={`/products?categoryId=${cat.id}`}
                              className="group flex items-center text-[13px] text-neutral-600 transition-colors hover:text-black"
                            >
                              <span className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">
                                →
                              </span>
                              <span className="inline-block transition-transform group-hover:translate-x-1">
                                {cat.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* New In Menu */}
              {activeMenu === "New In" && (
                <div className="grid grid-cols-4 gap-x-12 gap-y-8">
                  <div>
                    <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-900 border-b border-neutral-200 pb-3">
                      <Sparkles className="h-4 w-4 text-neutral-500" />
                      This Week
                    </h3>
                    <ul className="space-y-3.5">
                      <li>
                        <Link href="/products?sort=newest" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Latest Products</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?stock=available" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Restocked Items</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?featured=true" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Featured Products</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-900 border-b border-neutral-200 pb-3">
                      <TrendingUp className="h-4 w-4 text-neutral-500" />
                      Trending Now
                    </h3>
                    <ul className="space-y-3.5">
                      <li>
                        <Link href="/products?sort=popular" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Best Sellers</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?sort=views" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Most Viewed</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?sort=rating" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Customer Favorites</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Deals Menu */}
              {activeMenu === "Deals" && (
                <div className="grid grid-cols-4 gap-x-12 gap-y-8">
                  <div>
                    <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-900 border-b border-neutral-200 pb-3">
                      <Tag className="h-4 w-4 text-neutral-500" />
                      By Discount
                    </h3>
                    <ul className="space-y-3.5">
                      <li>
                        <Link href="/products?discount=20" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Up to 20% Off</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?discount=40" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Up to 40% Off</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?discount=60" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Up to 60% Off</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?clearance=true" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Clearance Sale</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-900 border-b border-neutral-200 pb-3">
                      <ShoppingBag className="h-4 w-4 text-neutral-500" />
                      Flash Deals
                    </h3>
                    <ul className="space-y-3.5">
                      <li>
                        <Link href="/products?deals=today" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Today's Deals</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?deals=weekend" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Weekend Specials</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?deals=limited" className="group flex items-center text-[13px] text-neutral-600 hover:text-black">
                          <span className="mr-2 opacity-0 group-hover:opacity-100">→</span>
                          <span className="group-hover:translate-x-1 inline-block transition-transform">Limited Time Offers</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quick Links */}
            <div className="border-t border-neutral-200 bg-neutral-50/50 px-8 py-5">
              <div className="mx-auto flex max-w-[1400px] items-center justify-between">
                <div className="flex items-center gap-8 text-[13px] text-neutral-600">
                  <Link href="/delivery" className="flex items-center gap-2 hover:text-black transition-colors">
                    <TrendingUp className="h-4 w-4" />
                    <span>Free Delivery</span>
                  </Link>
                  <Link href="/returns" className="flex items-center gap-2 hover:text-black transition-colors">
                    <Package className="h-4 w-4" />
                    <span>Easy Returns</span>
                  </Link>
                  <Link href="/gift-sets" className="flex items-center gap-2 hover:text-black transition-colors">
                    <Sparkles className="h-4 w-4" />
                    <span>Gift Sets</span>
                  </Link>
                  <Link href="/contact" className="flex items-center gap-2 hover:text-black transition-colors">
                    <Tag className="h-4 w-4" />
                    <span>Customer Support</span>
                  </Link>
                </div>
                <Link
                  href="/products"
                  className="text-[13px] font-semibold uppercase tracking-wider text-black underline decoration-2 underline-offset-4 hover:text-neutral-600 transition-colors"
                >
                  View All Products →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
