"use client";

import { Children, useEffect, useRef, useState } from "react";
import { Swiper, type SwiperProps } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { useCarouselAutoplay } from "@/app/_hooks/use-carousel-autoplay";
import CarouselPlayback from "./carousel-playback";

export default function StoreCarousel({ children, onSwiper, autoplay, compactPlayback = false, ...props }: SwiperProps & { compactPlayback?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<SwiperInstance | null>(null);
  const [locked, setLocked] = useState(false);
  const count = Children.count(children);
  const delay = typeof autoplay === "object" ? Math.max(4500, autoplay.delay || 5000) : 5000;
  useEffect(() => {
    if (!instance) return;
    const sync = () => setLocked(instance.isLocked);
    sync();
    instance.on("lock", sync);
    instance.on("unlock", sync);
    return () => { instance.off("lock", sync); instance.off("unlock", sync); };
  }, [instance]);
  const playback = useCarouselAutoplay(containerRef, () => {
    if (!instance || instance.destroyed || instance.animating || instance.isLocked) return;
    if (instance.isEnd && !instance.params.loop) instance.slideTo(0);
    else instance.slideNext();
  }, { enabled: count > 1 && !!instance && !locked, delay });

  return (
    <div ref={containerRef} className={compactPlayback ? "flex min-w-0 items-center gap-1" : "min-w-0"}>
      <div className="min-w-0 flex-1">
        <Swiper {...props} autoplay={false} onSwiper={swiper => { setInstance(swiper); onSwiper?.(swiper); }}>{children}</Swiper>
      </div>
      {count > 1 && !locked && <div className={compactPlayback ? "shrink-0" : "mt-2 flex justify-end text-store-accent"}><CarouselPlayback playback={playback} label="Carousel" /></div>}
    </div>
  );
}
