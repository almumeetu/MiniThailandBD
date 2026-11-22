"use client";

import { useEffect, useRef, useState } from "react";
import AarongFooterGrid from "@/components/aarong/aarong-footer-grid";
import AarongBottomBar from "@/components/aarong/aarong-bottom-bar";

export default function Bottomfooter() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <>
      {/* 
        Spacer:
        Sits in normal document flow with exact height of the fixed footer.
        Allows page scrolling to smoothly reveal the fixed footer behind it.
      */}
      <div
        style={{ height: footerHeight > 0 ? `${footerHeight}px` : undefined }}
        className="w-full pointer-events-none min-h-[460px] lg:min-h-[360px]"
        aria-hidden="true"
      />

      {/* 
        Fixed Footer:
        - Fixed at bottom: 0, left: 0, right: 0
        - Lower z-index (z-0) while the upper layer has z-10 so the subscribe section and upper page scroll over it smoothly
        - Pure black background (bg-black)
        - pointer-events-auto so all cards, buttons, and links remain fully interactive
      */}
      <div
        ref={footerRef}
        className="fixed bottom-0 left-0 right-0 w-full z-0 bg-black text-zinc-400 select-none pointer-events-auto"
      >
        <AarongFooterGrid />
        <AarongBottomBar />
      </div>
    </>
  );
}
