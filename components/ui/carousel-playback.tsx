"use client";

import { LuPause, LuPlay } from "react-icons/lu";
import type { useCarouselAutoplay } from "@/app/_hooks/use-carousel-autoplay";

export default function CarouselPlayback({ playback, label, className = "" }: {
  playback: ReturnType<typeof useCarouselAutoplay>;
  label: string;
  className?: string;
}) {
  if (playback.reducedMotion) return null;
  return (
    <button type="button" onClick={playback.toggle} aria-pressed={playback.paused}
      aria-label={`${playback.paused ? "Play" : "Pause"} ${label} slideshow`}
      title={`${playback.paused ? "Play" : "Pause"} slideshow`}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-current transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}>
      {playback.paused ? <LuPlay className="h-3.5 w-3.5" aria-hidden="true" /> : <LuPause className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}
