"use client";

import TopSlider from "./ui/topslider";

export default function TopHeader() {
  return (
    <section className="relative z-40 w-full select-none border-b border-white/10 bg-[#14293a] text-xs text-store-light">
      <div className="mx-auto flex min-h-8 max-w-[1440px] items-center justify-center px-4 sm:px-6 md:min-h-10 md:px-10 lg:px-16">
        <div className="w-full max-w-2xl overflow-hidden">
          <TopSlider />
        </div>
      </div>
    </section>
  );
}
