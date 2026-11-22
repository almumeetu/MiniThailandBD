import { AarongProductCardSkeleton } from "@/components/aarong/aarong-product-card";

export default function ShopPageSkeleton() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center gap-2">
          <div className="h-3.5 w-12 bg-neutral-200 rounded animate-pulse" />
          <span className="text-neutral-300">/</span>
          <div className="h-3.5 w-16 bg-neutral-200 rounded animate-pulse" />
          <span className="text-neutral-300">/</span>
          <div className="h-3.5 w-24 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>

      {/* 2. Page Header / Banner Skeleton */}
      <div className="border-b border-neutral-100 bg-neutral-50/50 py-7 sm:py-9">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 space-y-2.5">
          <div className="h-7 sm:h-8 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="h-3.5 w-64 sm:w-80 bg-neutral-200/70 rounded animate-pulse" />
        </div>
      </div>

      {/* 3. Sticky Toolbar Skeleton */}
      <div className="border-b border-neutral-200 bg-white py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 bg-neutral-200 rounded-full animate-pulse" />
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-9 w-20 bg-neutral-200 rounded-full animate-pulse hidden md:block" />
            <div className="h-9 w-36 bg-neutral-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* 4. Main Body: Sidebar + Product Grid Skeleton */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Skeleton (Desktop) */}
          <aside className="w-64 shrink-0 hidden lg:block space-y-7">
            {/* Categories */}
            <div className="space-y-3 pb-6 border-b border-neutral-100">
              <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
              <div className="space-y-2.5 pt-1">
                {[65, 80, 50, 75, 60, 45, 70].map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <div className="h-3.5 bg-neutral-200 rounded animate-pulse" style={{ width: `${w}%` }} />
                    <div className="h-3 w-5 bg-neutral-200/60 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-3 pb-6 border-b border-neutral-100">
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
              <div className="h-2 w-full bg-neutral-200 rounded-full animate-pulse my-4" />
              <div className="flex justify-between">
                <div className="h-3 w-14 bg-neutral-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-3 pb-6 border-b border-neutral-100">
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-36 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3 pb-6 border-b border-neutral-100">
              <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-5 w-5 rounded-full bg-neutral-200 animate-pulse" />
                ))}
              </div>
            </div>
          </aside>

          {/* Right Product Grid Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <AarongProductCardSkeleton key={idx} />
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-14 flex items-center justify-center gap-2">
              <div className="h-9 w-20 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-9 w-9 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-9 w-9 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-9 w-20 bg-neutral-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
