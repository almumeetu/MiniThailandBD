"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronDown, Menu } from "lucide-react";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";

interface SubCategory {
  name: string;
  href: string;
}

interface MenuCategory {
  name: string;
  href: string;
  badge?: string;
  sections?: {
    title: string;
    items: SubCategory[];
  }[];
}

const mobileMenuData: MenuCategory[] = [
  {
    name: "Thai Cord Sets",
    href: "/products?category=Cord%20Sets",
    badge: "Trending",
    sections: [
      {
        title: "By Style",
        items: [
          { name: "All Cord Sets", href: "/products?category=Cord%20Sets" },
          { name: "Pastel & Solid Sets", href: "/products?category=Cord%20Sets" },
          { name: "Floral & Printed Sets", href: "/products?category=Cord%20Sets" },
          { name: "Embroidered Festive Sets", href: "/products?category=Cord%20Sets" },
        ],
      },
    ],
  },
  {
    name: "Party Gowns",
    href: "/products?category=Party%20Gowns",
    badge: "Festive",
    sections: [
      {
        title: "Festive Collection",
        items: [
          { name: "All Party Gowns", href: "/products?category=Party%20Gowns" },
          { name: "Velvet Tiered Gowns", href: "/products?category=Party%20Gowns" },
          { name: "Embellished Evening Gowns", href: "/products?category=Party%20Gowns" },
          { name: "Sequin Party Dresses", href: "/products?category=Party%20Gowns" },
        ],
      },
    ],
  },
  {
    name: "Luxury Abayas",
    href: "/products?category=Luxury%20Abayas",
    sections: [
      {
        title: "Modest Fashion",
        items: [
          { name: "Dubai Shrug & Abaya Sets", href: "/products?category=Luxury%20Abayas" },
          { name: "Front-Open Borka Sets", href: "/products?category=Luxury%20Abayas" },
          { name: "Embroidered Modest Abayas", href: "/products?category=Luxury%20Abayas" },
          { name: "Kaftan & Modest Dresses", href: "/products?category=Luxury%20Abayas" },
        ],
      },
    ],
  },
  {
    name: "Velvet Collection",
    href: "/products?category=Velvet%20Collection",
    badge: "Winter Edit",
    sections: [
      {
        title: "Royal Velvet",
        items: [
          { name: "Crimson & Wine Velvet", href: "/products?category=Velvet%20Collection" },
          { name: "Navy & Black Velvet", href: "/products?category=Velvet%20Collection" },
          { name: "Flared Velvet Maxis", href: "/products?category=Velvet%20Collection" },
        ],
      },
    ],
  },
  {
    name: "Winter Wear",
    href: "/products?category=Winter%20Collection",
    sections: [
      {
        title: "Coats & Warm Wear",
        items: [
          { name: "Animal Print Long Coats", href: "/products?category=Winter%20Collection" },
          { name: "Velvet Long Jackets", href: "/products?category=Winter%20Collection" },
          { name: "Cozy Fleece Sweatshirts", href: "/products?category=Winter%20Collection" },
          { name: "Winter Fleece Co-ords", href: "/products?category=Winter%20Collection" },
        ],
      },
    ],
  },
  {
    name: "Designer 3-Piece",
    href: "/products?category=Designer%203-Piece",
  },
  {
    name: "Hijabs & Scarves",
    href: "/products?category=Hijabs%20&%20Scarves",
  },
  {
    name: "Special Offers",
    href: "/offers",
    badge: "Sale",
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
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-black hover:text-[#c0185a] transition-colors p-1"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Content */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 bg-[#fff5f8]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight">
              <span className="text-[#c0185a]">Mini</span>
              <span className="text-[#e8a020]">Thailand</span>
              <span className="text-neutral-700">BD</span>
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Announcement Bar in Drawer */}
        <div className="bg-[#c0185a] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
          ✨ 534K Followers • Hotline: 01706-126663
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <Link
            href="/products"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-neutral-900 hover:bg-rose-50 hover:text-[#c0185a] transition-colors"
          >
            <span>Explore All Products</span>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </Link>

          {mobileMenuData.map((category) => {
            const hasSub = !!category.sections && category.sections.length > 0;
            const isExpanded = expandedCategory === category.name;

            return (
              <div key={category.name} className="border-b border-neutral-100 pb-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={category.href}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 px-3 text-sm font-semibold text-neutral-800 hover:text-[#c0185a] transition-colors flex items-center gap-2"
                  >
                    <span>{category.name}</span>
                    {category.badge && (
                      <span className="rounded-full bg-rose-100 text-[#c0185a] px-2 py-0.5 text-[10px] font-bold">
                        {category.badge}
                      </span>
                    )}
                  </Link>

                  {hasSub && (
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.name)}
                      className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors"
                      aria-label={`Toggle ${category.name}`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {hasSub && isExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-rose-200 py-1 space-y-1">
                    {category.sections?.map((section) =>
                      section.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setIsOpen(false)}
                          className="block py-1.5 text-xs font-medium text-neutral-600 hover:text-[#c0185a] transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Footer with Direct Social & WhatsApp Contact */}
        <div className="border-t border-neutral-200 p-4 bg-neutral-50 space-y-2.5">
          <a
            href="https://wa.me/8801706126663?text=Hello%20Mini%20Thailand,%20I%20want%20to%20order..."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-xs"
          >
            <FaWhatsapp className="h-4 w-4" />
            <span>Order on WhatsApp: 01706-126663</span>
          </a>

          <a
            href="https://www.facebook.com/minithailand2022/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1567d3] transition-colors"
          >
            <FaFacebookF className="h-3.5 w-3.5" />
            <span>Visit Facebook Page</span>
          </a>
        </div>
      </div>
    </>
  );
}
