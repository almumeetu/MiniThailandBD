"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineBars3BottomRight } from "react-icons/hi2";
import {
  LuArrowRight,
  LuChevronDown,
  LuX,
  LuShoppingBag,
  LuUser,
  LuHeart,
  LuTruck,
  LuPhone,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";
import { IoLocationSharp } from "react-icons/io5";
import type { NavigationProps } from "@/data/types";
import { DEFAULT_NOVAMART_CATEGORIES, type ShopCategory } from "@/lib/shop-api";
import Logo from "@/components/ui/logo";

type MobileMenuProps = NavigationProps & {
  categories?: ShopCategory[];
  triggerClassName?: string;
};

export default function MobileMenu({ navItems, categories = [], triggerClassName }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const visibleCategories = categories.length ? categories : DEFAULT_NOVAMART_CATEGORIES;

  useEffect(() => {
    setOpen(false);
    setCategoriesOpen(false);
    setExpandedCategory(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      } else if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const dismissMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="xl:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="store-mobile-menu"
        onClick={() => setOpen(true)}
        className={`grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl transition-colors cursor-pointer ${
          triggerClassName || "text-slate-200 hover:text-white hover:bg-white/10"
        }`}
      >
        <HiOutlineBars3BottomRight className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div id="store-mobile-menu" className="fixed inset-0 z-[100] xl:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={dismissMenu}
            className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Store menu"
            className="relative flex h-dvh w-[min(88vw,380px)] flex-col overflow-hidden bg-white shadow-2xl animate-fadeIn"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-[#121214] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <Logo variant="light" size="sm" />
                <div className="border-l border-white/20 pl-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec1c67] block">
                    Bangkok Atelier
                  </span>
                  <span className="text-xs text-white/80 font-medium">Boutique Fashion</span>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close menu"
                onClick={dismissMenu}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <LuX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <nav
              className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 storefront-scroll-track"
              aria-label="Mobile navigation"
            >
              {/* Quick Customer Action Strip */}
              <div className="grid grid-cols-3 gap-2 pb-2">
                <Link
                  href="/profile?tab=orders"
                  onClick={closeMenu}
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-zinc-800 transition-colors"
                >
                  <LuTruck className="w-4 h-4 text-[#ec1c67] mb-1" />
                  <span className="text-[11px] font-semibold">Track Order</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={closeMenu}
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-zinc-800 transition-colors"
                >
                  <LuHeart className="w-4 h-4 text-[#ec1c67] mb-1" />
                  <span className="text-[11px] font-semibold">Wishlist</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-zinc-800 transition-colors"
                >
                  <LuUser className="w-4 h-4 text-[#ec1c67] mb-1" />
                  <span className="text-[11px] font-semibold">My Account</span>
                </Link>
              </div>

              {/* Main Nav Items List */}
              <div className="space-y-1">
                {/* Expandable Categories Accordion */}
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/products"
                      onClick={closeMenu}
                      className="flex min-h-12 flex-1 items-center px-4 text-sm font-bold text-zinc-900 hover:text-[#ec1c67] transition-colors"
                    >
                      <LuShoppingBag className="w-4 h-4 mr-2.5 text-[#ec1c67]" />
                      <span>Shop All Products</span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Toggle categories"
                      aria-expanded={categoriesOpen}
                      onClick={() => setCategoriesOpen((value) => !value)}
                      className="grid h-12 w-12 place-items-center border-l border-zinc-100 text-zinc-600 hover:text-[#ec1c67] transition-colors cursor-pointer"
                    >
                      <LuChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {categoriesOpen && (
                    <div className="border-t border-zinc-100 bg-zinc-50/70 p-2 space-y-0.5">
                      {visibleCategories.map((category) => {
                        const children = category.children ?? [];
                        const expanded = expandedCategory === category.id;
                        return (
                          <div key={category.id}>
                            <div className="flex items-center">
                              <Link
                                href={`/products?category=${encodeURIComponent(category.name)}`}
                                onClick={closeMenu}
                                className="flex min-h-10 flex-1 items-center rounded-lg px-3 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-white hover:text-[#ec1c67] transition-colors"
                              >
                                {category.name}
                              </Link>
                              {children.length > 0 && (
                                <button
                                  type="button"
                                  aria-label={`Show ${category.name} subcategories`}
                                  aria-expanded={expanded}
                                  onClick={() => setExpandedCategory(expanded ? null : category.id)}
                                  className="grid h-10 w-10 place-items-center text-zinc-400 hover:text-zinc-800"
                                >
                                  <LuChevronDown
                                    className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                                    aria-hidden="true"
                                  />
                                </button>
                              )}
                            </div>
                            {expanded &&
                              children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/products?category=${encodeURIComponent(child.name)}`}
                                  onClick={closeMenu}
                                  className="block rounded-lg py-2 pl-7 pr-3 text-xs text-zinc-600 hover:bg-white hover:text-[#ec1c67] transition-colors"
                                >
                                  {child.name}
                                </Link>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Other Nav Links */}
                {navItems
                  .filter((item) => item.label !== "Home" && item.label !== "Shop")
                  .map((item) => {
                    const isOffers = item.label.toLowerCase().includes("offer");
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-all ${
                          isOffers
                            ? "bg-rose-50/80 text-[#ec1c67] hover:bg-rose-100"
                            : "text-zinc-800 hover:bg-zinc-50 hover:text-[#ec1c67]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.label}</span>
                          {isOffers && (
                            <span className="rounded-full bg-[#ec1c67] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider">
                              Sale
                            </span>
                          )}
                        </span>
                        <LuArrowRight className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                      </Link>
                    );
                  })}
              </div>

              {/* Direct WhatsApp Ordering Banner */}
              <div className="pt-2">
                <a
                  href="https://wa.me/8801706126663?text=Hello%20Mini%20Thailand,%20I%20want%20to%20order..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FaWhatsapp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Order via WhatsApp</p>
                      <p className="text-[11px] text-emerald-700 font-medium">+880 1706-126663</p>
                    </div>
                  </div>
                  <LuArrowRight className="w-4 h-4 text-emerald-600" />
                </a>
              </div>

              {/* 4 Dhaka Outlets info card */}
              <div className="rounded-xl bg-zinc-900 p-4 text-white space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <IoLocationSharp className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">4 Dhaka Outlets</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Jamuna Future Park • Dhanmondi • Uttara • Adabor
                </p>
                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-rose-400 transition-colors pt-1"
                >
                  <span>View Branch Addresses</span>
                  <LuArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Footer Phone Hotline */}
              <div className="pt-1 pb-4 text-center">
                <a
                  href="tel:01706126663"
                  className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  <LuPhone className="w-3.5 h-3.5 text-[#ec1c67]" />
                  <span>Helpline: 01706-126663 (10 AM - 10 PM)</span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
