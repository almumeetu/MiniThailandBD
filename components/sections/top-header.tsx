"use client";

import Link from "next/link";
import { FaWhatsapp, FaFacebook } from "react-icons/fa6";
import { IoLocationSharp } from "react-icons/io5";
import { useNotificationSettings } from "@/lib/notification-store";

export interface TopHeaderProps {
  isScrolled?: boolean;
  isHome?: boolean;
}

export default function TopHeader({ isScrolled = false, isHome = false }: TopHeaderProps) {
  const settings = useNotificationSettings();

  if (settings && !settings.enabled) {
    return null;
  }

  const hotline = settings?.hotlinePhone || "+880 1706-126663";
  const hotlineShort = settings?.hotlineShort || "01706126663";
  const whatsapp = settings?.whatsappNumber || "8801706126663";
  const followers = settings?.followerBadge || "534K followers";
  const views = settings?.reelViewsBadge || "282M reel views";

  return (
    <section
      className={`relative z-40 w-full select-none hidden lg:block ${
        isHome && !isScrolled ? "bg-transparent" : "bg-[#090e17]"
      } text-xs text-slate-200 transition-colors duration-300`}
    >
      <div className="mx-auto grid grid-cols-[1fr_auto_1fr] h-7 sm:h-7.5 max-w-[1440px] items-center px-4 sm:px-6 md:px-8 xl:px-12 text-[11px] font-sans">
        <div className="flex items-center justify-start gap-2.5 font-medium text-slate-300 shrink-0 whitespace-nowrap min-w-0">
          <span>
            HOTLINE:{" "}
            <a
              href={`tel:${hotlineShort}`}
              className="text-white hover:text-[#ec1c67] font-semibold transition-colors"
            >
              {hotline}
            </a>
          </span>
          <span className="text-white/20">|</span>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Mini Thailand! I want to order boutique fashion.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-200 hover:text-emerald-400 transition-colors font-medium"
          >
            <FaWhatsapp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Order on WhatsApp</span>
          </a>
        </div>

        <div className="hidden lg:flex items-center justify-center px-4 overflow-hidden whitespace-nowrap text-center">
          <span className="text-slate-200 text-xs font-medium tracking-wide">
            Welcome to Mini Thailand
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 font-medium text-slate-300 shrink-0 whitespace-nowrap min-w-0">
          <a
            href="https://www.facebook.com/minithailand2022/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
            title="534K Facebook Followers & 282M Reel Views"
          >
            <FaFacebook className="h-3.5 w-3.5 text-[#1877f2]" />
            <span>{followers}</span>
            <span>•</span>
            <span>{views}</span>
          </a>
          <span className="text-white/20">|</span>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-[#ec1c67] hover:text-white transition-colors font-bold tracking-wide"
            title="Visit our 4 Dhaka outlets: Jamuna Future Park, Dhanmondi, Uttara & Adabor"
          >
            <IoLocationSharp className="w-3.5 h-3.5 text-[#ec1c67]" />
            <span>4 DHAKA OUTLETS</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
