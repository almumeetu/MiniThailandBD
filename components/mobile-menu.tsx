"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronDown, Menu } from "lucide-react";

interface SubCategory {
  name: string;
  href: string;
}

interface MenuCategory {
  name: string;
  href: string;
  sections?: {
    title: string;
    items: SubCategory[];
  }[];
}

const mobileMenuData: MenuCategory[] = [
  {
    name: "Shop",
    href: "/products",
    sections: [
      {
        title: "By Sport",
        items: [
          { name: "Football", href: "/products?sport=football" },
          { name: "Basketball", href: "/products?sport=basketball" },
          { name: "Cricket", href: "/products?sport=cricket" },
          { name: "Tennis", href: "/products?sport=tennis" },
        ],
      },
      {
        title: "By Type",
        items: [
          { name: "Jerseys", href: "/products?type=jerseys" },
          { name: "Training Kits", href: "/products?type=training" },
          { name: "Fan Wear", href: "/products?type=fanwear" },
          { name: "Accessories", href: "/products?type=accessories" },
        ],
      },
    ],
  },
  {
    name: "New In",
    href: "/products?filter=new",
    sections: [
      {
        title: "This Week",
        items: [
          { name: "Latest Releases", href: "/products?new=this-week" },
          { name: "Restocked Items", href: "/products?new=restocked" },
          { name: "Pre-Orders", href: "/products?new=preorder" },
        ],
      },
    ],
  },
  {
    name: "Brands",
    href: "/brands",
    sections: [
      {
        title: "Top Brands",
        items: [
          { name: "Nike", href: "/brands/nike" },
          { name: "Adidas", href: "/brands/adidas" },
          { name: "Puma", href: "/brands/puma" },
        ],
      },
    ],
  },
  {
    name: "Archive",
    href: "/archive",
    sections: [
      {
        title: "By Era",
        items: [
          { name: "1990s", href: "/archive?era=1990s" },
          { name: "2000s", href: "/archive?era=2000s" },
          { name: "Retro Classics", href: "/archive?era=retro" },
        ],
      },
    ],
  },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden text-xl"
        aria-label="Open menu"
      >
        <Menu />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-out Menu */}
          <div className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-300 lg:hidden">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <span className="text-sm font-bold uppercase tracking-wider">
                  Menu
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 hover:bg-neutral-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Main Navigation */}
                <div className="p-4">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-neutral-50"
                  >
                    Home
                  </Link>

                  {mobileMenuData.map((category) => (
                    <div key={category.name} className="border-t border-neutral-100">
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-neutral-50"
                      >
                        {category.name}
                        {category.sections && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedCategory === category.name ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Expanded Content */}
                      {expandedCategory === category.name && category.sections && (
                        <div className="bg-neutral-50 px-4 pb-4">
                          <Link
                            href={category.href}
                            onClick={() => setIsOpen(false)}
                            className="mb-3 flex items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-neutral-100"
                          >
                            View All {category.name}
                            <ChevronRight className="h-4 w-4" />
                          </Link>

                          {category.sections.map((section) => (
                            <div key={section.title} className="mb-4">
                              <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                                {section.title}
                              </h3>
                              <ul className="space-y-1">
                                {section.items.map((item) => (
                                  <li key={item.name}>
                                    <Link
                                      href={item.href}
                                      onClick={() => setIsOpen(false)}
                                      className="block rounded px-2 py-2 text-sm text-neutral-700 transition-colors hover:bg-white hover:text-black"
                                    >
                                      {item.name}
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
              </div>

              {/* Footer Quick Links */}
              <div className="border-t border-neutral-200 bg-neutral-50 p-6">
                <div className="space-y-2 text-xs">
                  <Link
                    href="/delivery"
                    onClick={() => setIsOpen(false)}
                    className="block text-neutral-600 hover:text-black"
                  >
                    Free Delivery
                  </Link>
                  <Link
                    href="/returns"
                    onClick={() => setIsOpen(false)}
                    className="block text-neutral-600 hover:text-black"
                  >
                    Easy Returns
                  </Link>
                  <Link
                    href="/gift-sets"
                    onClick={() => setIsOpen(false)}
                    className="block text-neutral-600 hover:text-black"
                  >
                    Gift Sets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
