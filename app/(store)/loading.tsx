import { AarongProductCardSkeleton } from "@/components/aarong/aarong-product-card";

export default function StoreLoading() {
  return (
    <div className="w-full min-h-screen bg-white font-sans">
      {/* 1. Hero Slider Skeleton */}
      <div className="relative w-full aspect-[16/7] min-h-[360px] sm:min-h-[460px] lg:min-h-[580px] bg-neutral-200 animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6 sm:p-12">
          <div className="max-w-[1440px] w-full mx-auto space-y-3">
            <div className="h-6 sm:h-10 w-2/3 max-w-md bg-white/40 rounded backdrop-blur-xs" />
            <div className="h-4 sm:h-5 w-1/2 max-w-xs bg-white/30 rounded backdrop-blur-xs" />
            <div className="h-9 sm:h-11 w-36 bg-white/60 rounded mt-4" />
          </div>
        </div>
      </div>

      {/* 2. Category Grid Skeleton */}
      <section className="w-full bg-white py-8 sm:py-12">
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

      {/* 3. What's New Skeleton */}
      <section className="w-full bg-white py-12 sm:py-16 border-t border-neutral-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="h-7 sm:h-8 w-44 bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <AarongProductCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
