export default function VideosLoading() {
  return (
    <div className="min-h-screen bg-store-page py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="space-y-3 mb-8">
          <div className="h-8 sm:h-10 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-neutral-200/70 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[9/16] w-full rounded-xl bg-neutral-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
