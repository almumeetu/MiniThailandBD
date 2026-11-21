"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useCarouselAutoplay(
  containerRef: RefObject<HTMLElement | null>,
  advance: () => void,
  {
    enabled = true,
    delay = 3500,
    ignoreReducedMotion = true,
  }: { enabled?: boolean; delay?: number; ignoreReducedMotion?: boolean } = {},
) {
  const advanceRef = useRef(advance);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !enabled) return;

    let hovered = false;
    let pressed = false;

    const syncInteraction = () => setInteracting(hovered || pressed);

    // Pause only when mouse cursor hovers over (desktop), not on touch
    const enter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hovered = true;
      syncInteraction();
    };
    const leave = () => {
      hovered = false;
      pressed = false;
      syncInteraction();
    };
    const down = () => {
      pressed = true;
      syncInteraction();
    };
    const up = () => {
      pressed = false;
      syncInteraction();
    };

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(ignoreReducedMotion ? false : motion.matches);
    const syncPage = () => setPageVisible(document.visibilityState === "visible");

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(entry.isIntersecting);
        },
        { threshold: 0.05 }
      );
      observer.observe(element);
    }

    syncInteraction();
    syncMotion();
    syncPage();

    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    motion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncPage);

    return () => {
      if (observer) observer.disconnect();
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      motion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncPage);
    };
  }, [containerRef, enabled, ignoreReducedMotion]);

  const isPlaying = enabled && !paused && !interacting && visible && pageVisible && !reducedMotion;

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      // Don't auto-advance if a modal or dialog is open
      if (!document.querySelector('dialog[open], [aria-modal="true"]')) {
        advanceRef.current();
      }
    }, delay);

    return () => window.clearInterval(timer);
  }, [isPlaying, delay]);

  return { paused, isPlaying, reducedMotion, toggle: () => setPaused((value) => !value) };
}
