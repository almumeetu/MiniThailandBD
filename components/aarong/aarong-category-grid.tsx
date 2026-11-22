"use client";

import Image from "next/image";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { type ShopCategory, DEFAULT_NOVAMART_CATEGORIES } from "@/lib/shop-api";

interface AarongCategoryGridProps {
  categories?: ShopCategory[];
  loading?: boolean;
}

export function AarongCategoryGridSkeleton() {
  return (
    <section aria-label="Product Categories Loading" className="w-full bg-white py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex flex-col bg-white overflow-hidden animate-pulse">
              <div className="relative aspect-square w-full bg-neutral-200" />
              <div className="bg-white py-3 sm:py-3.5 flex justify-center">
                <div className="h-3.5 w-24 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AarongCategoryGrid({ categories, loading }: AarongCategoryGridProps) {
  if (loading && (!categories || categories.length === 0)) {
    return <AarongCategoryGridSkeleton />;
  }

  const displayList = (categories && categories.length >= 8)
    ? categories.slice(0, 8)
    : DEFAULT_NOVAMART_CATEGORIES.slice(0, 8);

  return (
    <section aria-label="Product Categories" className="w-full bg-white py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        {/* 2 Rows x 4 Columns Grid matching Aarong's exact design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {displayList.map((cat) => {
            const href = `/products?category=${encodeURIComponent(cat.name)}`;
            const imageUrl = cat.imageUrl || "/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg";

            return (
              <Link
                key={cat.id || cat.name}
                href={href}
                className="group flex flex-col bg-white overflow-hidden transition-all duration-300"
              >
                {/* Image Container with Top-to-Bottom Fade Overlay on Hover */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                  <Image
                    src={imageUrl}
                    alt={cat.name}
                    fill
                    quality={90}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 360px"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Impressive Top-to-Bottom Fade Overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 sm:p-4 text-center bg-gradient-to-b from-black/40 via-black/55 to-black/75 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out">
                    {/* Subtitle tag sliding down from top */}
                    <span className="text-[10px] sm:text-[11px] font-semibold text-rose-300 uppercase tracking-[0.22em] -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out delay-75">
                      Explore Collection
                    </span>

                    {/* Category Title sliding down */}
                    <h3 className="text-white text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider text-center mt-1 mb-3 -translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out delay-100 drop-shadow-md line-clamp-1">
                      {cat.name}
                    </h3>

                    {/* Impressive "View Products" Button dropping in from top */}
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 bg-white text-zinc-950 text-[10px] sm:text-xs font-bold tracking-[0.16em] uppercase rounded-[2px] shadow-xl -translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out delay-150 group-hover:bg-[#ec1c67] group-hover:text-white hover:scale-105 active:scale-95">
                      <span>VIEW PRODUCTS</span>
                      <LuArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>

                {/* White strip label with bold uppercase title below image */}
                <div className="bg-white py-3 sm:py-3.5 text-center">
                  <span className="block text-xs sm:text-[13px] font-bold tracking-[0.18em] text-zinc-900 uppercase group-hover:text-[#ec1c67] transition-colors duration-200">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
