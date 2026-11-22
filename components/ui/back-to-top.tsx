"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FiArrowUp } from "react-icons/fi";

export default function BackToTop() {
  const pathname = usePathname();
  const isPurchasePage = ["/cart", "/checkout", "/confirmation"].includes(pathname) || pathname.startsWith("/products/");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-20 right-5 z-40 sm:bottom-24 sm:right-7 ${isPurchasePage ? "hidden lg:flex" : "hidden md:flex"} h-10 w-10 items-center justify-center rounded-full bg-[#ec1c67] text-white shadow-lg shadow-pink-950/25 transition-all duration-300 hover:bg-[#d81358] hover:scale-105 active:scale-95 focus:outline-none cursor-pointer sm:h-11 sm:w-11 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
      aria-label="Back to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <FiArrowUp className="h-5 w-5 stroke-[2]" />
    </button>
  );
}
