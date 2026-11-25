"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Check if already shown in this tab session
    const hasShown = typeof window !== "undefined" && sessionStorage.getItem("mt_preloader_seen");
    const minDisplayTime = hasShown ? 300 : 750;

    // Simulate smooth progress
    const p1 = setTimeout(() => setProgress(50), 120);
    const p2 = setTimeout(() => setProgress(85), 350);
    const p3 = setTimeout(() => setProgress(100), 600);

    const timer = setTimeout(() => {
      setFading(true);
      try {
        sessionStorage.setItem("mt_preloader_seen", "1");
      } catch {}
      const cleanup = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(cleanup);
    }, minDisplayTime);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Mini Thailand Loading"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0d0c11] text-white transition-opacity duration-500 ease-out select-none ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* 1. Round Glowing Logo */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#ec1c67] via-amber-400/40 to-[#ec1c67] opacity-60 blur-md animate-pulse" />
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-b from-zinc-900 to-black border border-white/15 p-3 flex items-center justify-center shadow-2xl">
            <Image
              src="/images/mini-thailand-white-logo.png"
              alt="Mini Thailand"
              width={96}
              height={54}
              priority
              className="h-auto w-14 sm:w-16 object-contain drop-shadow"
            />
          </div>
        </div>

        {/* 2. Name */}
        <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-[0.25em] text-white uppercase drop-shadow-sm">
          Mini Thailand
        </h2>

        {/* 3. Bar */}
        <div className="mt-6 w-48 sm:w-56 h-[3px] bg-white/10 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#ec1c67] via-amber-300 to-[#ec1c67] rounded-full transition-all duration-400 ease-out shadow-[0_0_12px_rgba(236,28,103,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
