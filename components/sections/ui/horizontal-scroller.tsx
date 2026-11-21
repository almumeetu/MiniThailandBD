"use client";

import { useEffect, useRef, useState, type ReactNode, Children, isValidElement, cloneElement } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useCarouselAutoplay } from "@/app/_hooks/use-carousel-autoplay";
import CarouselPlayback from "@/components/ui/carousel-playback";

interface HorizontalScrollerProps {
  trackId: string;
  children: ReactNode;
  label: string;
  heading?: ReactNode;
  action?: ReactNode;
  controlsPosition?: "header" | "footer";
  trackClassName?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  showPlayback?: boolean;
  marquee?: boolean;
  marqueeDuration?: number;
  reverse?: boolean;
  fullWidth?: boolean;
}

function MarqueeScroller({
  children,
  heading,
  action,
  marqueeDuration,
  reverse = false,
  fullWidth = false,
}: HorizontalScrollerProps) {
  const childArray = Children.toArray(children);
  const count = childArray.length;
  // Ensure enough items are present for continuous seamless looping on wide monitors
  const repeatCount = count > 0 && count < 8 ? Math.ceil(8 / count) : 1;
  const totalItems = count * repeatCount;
  // Comfortable, relaxed reading velocity: ~6.5s per item (minimum 70s)
  const duration = marqueeDuration || Math.max(70, totalItems * 6.5);

  const setA = Array.from({ length: repeatCount }).flatMap((_, rIdx) =>
    childArray.map((child, cIdx) =>
      isValidElement(child)
        ? cloneElement(child, { key: `set-a-${rIdx}-${cIdx}` })
        : child
    )
  );
  const setB = Array.from({ length: repeatCount }).flatMap((_, rIdx) =>
    childArray.map((child, cIdx) =>
      isValidElement(child)
        ? cloneElement(child, { key: `set-b-${rIdx}-${cIdx}` })
        : child
    )
  );

  const headerContainerClass = fullWidth
    ? "max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 mb-4 sm:mb-5 flex items-center justify-between gap-3"
    : "mb-4 sm:mb-5 flex items-center justify-between gap-3";

  return (
    <div className={fullWidth ? "w-full min-w-0" : "min-w-0"}>
      {(heading || action) && (
        <div className={headerContainerClass}>
          {heading}
          {action && <div className="ml-auto flex items-center gap-2.5 sm:gap-4">{action}</div>}
        </div>
      )}

      <div className="relative w-full overflow-hidden py-1 group">
        <div
          className={`${
            reverse ? "marquee-infinite-reverse" : "marquee-infinite"
          } flex w-max hover:[animation-play-state:paused] active:[animation-play-state:paused] focus-within:[animation-play-state:paused] will-change-transform select-none`}
          style={{ animationDuration: `${duration}s` }}
        >
          {/* Set A */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5 pr-3 sm:pr-4 lg:pr-5">
            {setA}
          </div>
          {/* Set B (exact seamless infinite loop mirror) */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5 pr-3 sm:pr-4 lg:pr-5" aria-hidden="true">
            {setB}
          </div>
        </div>
      </div>
    </div>
  );
}

function StandardHorizontalScroller({
  trackId,
  children,
  label,
  heading,
  action,
  controlsPosition = "header",
  trackClassName = "",
  autoplay = true,
  autoplayDelay = 3500,
  showPlayback = false,
}: HorizontalScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(true);

  // Desktop mouse drag support
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStartLeft = useRef(0);
  const hasMoved = useRef(false);

  // Manual button step: scrolls by multiple visible cards
  const getManualScrollStep = () => {
    const track = trackRef.current;
    if (!track) return 300;
    const firstChild = track.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const cardRect = firstChild.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const gap = 16;
      const visibleCount = Math.max(1, Math.floor(track.clientWidth / (cardWidth + gap)));
      return (cardWidth + gap) * visibleCount;
    }
    return Math.max(track.clientWidth * 0.85, 200);
  };

  // Autoplay step: smoothly advances 1 card at a time for graceful carousel movement
  const getAutoplayScrollStep = () => {
    const track = trackRef.current;
    if (!track) return 240;
    const firstChild = track.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const cardRect = firstChild.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const gap = 16;
      return cardWidth + gap;
    }
    return 240;
  };

  const advanceSlide = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = getAutoplayScrollStep();
    const maxScroll = track.scrollWidth - track.clientWidth;
    const remaining = maxScroll - track.scrollLeft;

    if (remaining <= 24) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: Math.min(step, remaining), behavior: "smooth" });
    }
  };

  const playback = useCarouselAutoplay(
    containerRef,
    advanceSlide,
    { enabled: autoplay && hasOverflow, delay: autoplayDelay, ignoreReducedMotion: true }
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollState = () => {
      const overflow = track.scrollWidth > track.clientWidth + 4;
      setHasOverflow(overflow);
    };

    updateScrollState();
    const rafId = requestAnimationFrame(updateScrollState);
    const timerId = setTimeout(updateScrollState, 400);

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
    if (track.lastElementChild && track.lastElementChild !== track.firstElementChild) {
      observer.observe(track.lastElementChild);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      observer.disconnect();
    };
  }, [children]);

  const scroll = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const step = getManualScrollStep();
    if (direction > 0) {
      const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
      if (remaining <= 24) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
    } else {
      if (track.scrollLeft <= 24) {
        track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
        return;
      }
    }
    track.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - track.offsetLeft;
    scrollStartLeft.current = track.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 6) {
      hasMoved.current = true;
    }
    track.scrollLeft = scrollStartLeft.current - walk;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setTimeout(() => {
      hasMoved.current = false;
    }, 60);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const controls = hasOverflow ? (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      {showPlayback && <CarouselPlayback playback={playback} label={label} />}
      <button
        type="button"
        aria-label={`Scroll ${label} left`}
        aria-controls={trackId}
        onClick={() => scroll(-1)}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-store-border bg-white text-store-accent transition-all duration-200 hover:border-store-primary hover:text-store-primary hover:scale-105 active:scale-95 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary cursor-pointer"
      >
        <LuChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={`Scroll ${label} right`}
        aria-controls={trackId}
        onClick={() => scroll(1)}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-store-border bg-white text-store-accent transition-all duration-200 hover:border-store-primary hover:text-store-primary hover:scale-105 active:scale-95 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary cursor-pointer"
      >
        <LuChevronRight className="h-4 w-4" />
      </button>
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="min-w-0">
      {(heading || action || (controlsPosition === "header" && controls)) && (
        <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
          {heading}
          <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
            {action}
            {controlsPosition === "header" && controls}
          </div>
        </div>
      )}
      <div
        ref={trackRef}
        id={trackId}
        role="region"
        aria-label={label}
        tabIndex={0}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
        className={`storefront-scroll-track [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex min-w-0 snap-x snap-proximity gap-3 sm:gap-4 lg:gap-5 overflow-x-auto overscroll-x-contain pb-2 pt-1 select-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-primary ${trackClassName}`}
      >
        {children}
      </div>
      {controlsPosition === "footer" && controls && (
        <div className="mt-3 flex justify-end">{controls}</div>
      )}
    </div>
  );
}

export default function HorizontalScroller(props: HorizontalScrollerProps) {
  if (props.marquee) {
    return <MarqueeScroller {...props} />;
  }
  return <StandardHorizontalScroller {...props} />;
}
