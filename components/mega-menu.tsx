"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Package, Sparkles, TrendingUp, Tag } from "lucide-react";
import { fetchShopCategories, type ShopCategory } from "@/lib/shop-api";

interface SubCategory {
  name: string;
  href: string;
  description?: string;
  image?: string;
}

interface MenuCategory {
  name: string;
  href: string;
  icon?: React.ReactNode;
  featured?: {
    title: string;
    description: string;
    image: string;
    href: string;
  };
  sections?: {
    title: string;
    items: SubCategory[];
  }[];
}

const staticMenuData: MenuCategory[] = [
  {
    name: "New In",
    href: "/products",
    icon: <Sparkles className="h-4 w-4" />,
    featured: {
      title: "Latest Arrivals",
      description: "Discover fresh products across all categories",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
      href: "/products",
    },
    sections: [
      {
        title: "This Week",
        items: [
          { name: "Latest Products", href: "/products?sort=newest" },
          { name: "Restocked Items", href: "/products?stock=available" },
          { name: "Featured Products", href: "/products?featured=true" },
        ],
      },
      {
        title: "Trending Now",
        items: [
          { name: "Best Sellers", href: "/products?sort=popular" },
          { name: "Most Viewed", href: "/products?sort=views" },
          { name: "Customer Favorites", href: "/products?sort=rating" },
        ],
      },
    ],
  },
  {
    name: "Deals",
    href: "/products?discount=true",
    icon: <Tag className="h-4 w-4" />,
    featured: {
      title: "Special Offers",
      description: "Save big on your favorite products",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80",
      href: "/products?discount=true",
    },
    sections: [
      {
        title: "By Discount",
        items: [
          { name: "Up to 20% Off", href: "/products?discount=20" },
          { name: "Up to 40% Off", href: "/products?discount=40" },
          { name: "Up to 60% Off", href: "/products?discount=60" },
          { name: "Clearance Sale", href: "/products?clearance=true" },
        ],
      },
      {
        title: "Flash Deals",
        items: [
          { name: "Today's Deals", href: "/products?deals=today" },
          { name: "Weekend Specials", href: "/products?deals=weekend" },
          { name: "Limited Time Offers", href: "/products?deals=limited" },
        ],
      },
    ],
  },
];

export default function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [menuData, setMenuData] = useState<MenuCategory[]>(staticMenuData);

  // Load real categories from API
  useEffect(() => {
    async function loadCategories() {
      try {
        const fetchedCategories = await fetchShopCategories();
        setCategories(fetchedCategories);
        
        // Build Shop menu with real categories
        const shopMenu: MenuCategory = {
          name: "Shop All",
          href: "/products",
          icon: <Package className="h-4 w-4" />,
          featured: {
            title: "Explore All Categories",
            description: "Browse our complete collection across all departments",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
            href: "/products",
          },
          sections: [],
        };

        // Group categories - take first 16 categories and split into 4 columns
        const mainCategories = fetchedCategories.slice(0, 16);
        const categoriesPerColumn = 4;
        
        for (let i = 0; i < 4; i++) {
          const columnCategories = mainCategories.slice(
            i * categoriesPerColumn,
            (i + 1) * categoriesPerColumn
          );
          
          if (columnCategories.length > 0) {
            shopMenu.sections?.push({
              title: i === 0 ? "Top Categories" : `More Categories ${i}`,
              items: columnCategories.map((cat) => ({
                name: cat.name,
                href: `/products?categoryId=${cat.id}`,
                image: cat.imageUrl || undefined,
              })),
            });
          }
        }

        // Combine with static menus
        setMenuData([shopMenu, ...staticMenuData]);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }

    loadCategories();
  }, []);

  const handleMouseEnter = (menuName: string) => {
    setActiveMenu(menuName);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTimeout(() => {
      if (!isHovering) {
        setActiveMenu(null);
      }
    }, 100);
  };

  return (
    <nav className="relative">
      {/* Navigation Items */}
      <div className="flex items-center gap-7">
        {menuData.map((category) => (
          <div
            key={category.name}
            onMouseEnter={() => handleMouseEnter(category.name)}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <Link
              href={category.href}
              className="group flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors hover:text-neutral-600"
            >
              {category.name}
              {category.sections && (
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    activeMenu === category.name ? "rotate-180" : ""
                  }`}
                />
              )}
            </Link>
          </div>
        ))}
      </div>

      {/* Mega Menu Dropdown */}
      {activeMenu && (
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 right-0 top-full z-50 mt-0 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white shadow-2xl border-t border-neutral-200">
            <div className="mx-auto max-w-[1400px] px-8 py-12">
              {menuData
                .filter((cat) => cat.name === activeMenu)
                .map((category) => (
                  <div key={category.name}>
                    {/* Category sections grid - no featured image */}
                    {category.sections && (
                      <div className="grid grid-cols-4 gap-x-12 gap-y-8">
                        {category.sections.map((section) => (
                          <div key={section.title}>
                            <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-900 border-b border-neutral-200 pb-3">
                              {category.icon && <span className="text-neutral-500">{category.icon}</span>}
                              {section.title}
                            </h3>
                            <ul className="space-y-3.5">
                              {section.items.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    href={item.href}
                                    className="group flex items-center text-[13px] text-neutral-600 transition-colors hover:text-black"
                                  >
                                    <span className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                                    <span className="inline-block transition-transform group-hover:translate-x-1">
                                      {item.name}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Bottom Quick Links Bar */}
            <div className="border-t border-neutral-200 bg-neutral-50/50 px-8 py-5">
              <div className="mx-auto flex max-w-[1400px] items-center justify-between">
                <div className="flex items-center gap-8 text-[13px] text-neutral-600">
                  <Link
                    href="/delivery"
                    className="flex items-center gap-2 transition-colors hover:text-black"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Free Delivery</span>
                  </Link>
                  <Link
                    href="/returns"
                    className="flex items-center gap-2 transition-colors hover:text-black"
                  >
                    <Package className="h-4 w-4" />
                    <span>Easy Returns</span>
                  </Link>
                  <Link
                    href="/gift-sets"
                    className="flex items-center gap-2 transition-colors hover:text-black"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Gift Sets</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center gap-2 transition-colors hover:text-black"
                  >
                    <Tag className="h-4 w-4" />
                    <span>Customer Support</span>
                  </Link>
                </div>
                <Link
                  href="/products"
                  className="text-[13px] font-semibold uppercase tracking-wider text-black underline decoration-2 underline-offset-4 transition-colors hover:text-neutral-600"
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
