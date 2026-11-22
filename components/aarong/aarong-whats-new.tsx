"use client";

import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { type ShopProduct } from "@/lib/shop-api";
import AarongProductCard, { AarongProductCardSkeleton } from "@/components/aarong/aarong-product-card";

interface AarongWhatsNewProps {
  products: ShopProduct[];
  loading?: boolean;
}

export function AarongWhatsNewSkeleton() {
  return (
    <section aria-label="What's New Collection Loading" className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.22em] text-zinc-950 uppercase text-center mb-8 sm:mb-12">
          WHAT&apos;S NEW
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <AarongProductCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AarongWhatsNew({ products, loading }: AarongWhatsNewProps) {
  const [startIndex, setStartIndex] = useState(0);

  const displayProducts = products && products.length > 0 ? products : [];

  if (loading && displayProducts.length === 0) {
    return <AarongWhatsNewSkeleton />;
  }

  const pageSize = 8;
  const totalPages = Math.ceil(displayProducts.length / pageSize) || 1;
  const currentPage = Math.floor(startIndex / pageSize);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - pageSize));
  };

  const handleNext = () => {
    setStartIndex((prev) => {
      const next = prev + pageSize;
      return next < displayProducts.length ? next : prev;
    });
  };

  const visibleSlice = displayProducts.slice(startIndex, startIndex + pageSize);

  return (
    <section aria-label="What's New Collection" className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Heading matching Aarong's exact style */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.22em] text-zinc-950 uppercase text-center mb-8 sm:mb-12">
          WHAT&apos;S NEW
        </h2>

        {/* Products Carousel Area */}
        <div className="relative">
          {/* 4 Portrait Cards Grid / Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {visibleSlice.map((product) => (
              <AarongProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                slug={product.slug}
                category={product.category}
                badge={product.badge}
                variantId={product.variantId}
              />
            ))}
          </div>

          {/* Minimalist Prev/Next Arrows */}
          {startIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous products"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              <LuChevronLeft className="w-5 h-5" />
            </button>
          )}

          {startIndex + pageSize < displayProducts.length && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next products"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              <LuChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Minimalist Dot Pagination Indicator */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStartIndex(idx * pageSize)}
                aria-label={`Go to page ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentPage === idx
                    ? "w-8 bg-black"
                    : "w-2 bg-zinc-300 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
