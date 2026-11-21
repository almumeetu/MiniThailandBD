"use client";

import TopSlider from "./ui/topslider";
import Link from "next/link";
import { FaWhatsapp, FaFacebook } from "react-icons/fa6";
import { useNotificationSettings } from "@/lib/notification-store";

export default function TopHeader() {
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
    <section className="relative z-40 w-full select-none border-b border-white/10 bg-[#14293a] text-xs text-store-light">
      <div className="mx-auto flex min-h-8 max-w-[1440px] items-center justify-between px-4 sm:px-6 md:min-h-9 md:px-10 lg:px-16">
        {/* Left: Quick support hotline & WhatsApp */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-medium text-slate-300">
          <span>
            HOTLINE:{" "}
            <a
              href={`tel:${hotlineShort}`}
              className="text-white hover:text-amber-300 font-semibold transition-colors"
            >
              {hotline}
            </a>
          </span>
          <span className="text-slate-600">|</span>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Mini Thailand! I want to order boutique fashion.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <FaWhatsapp className="h-3 w-3 text-emerald-400" />
            <span>Order on WhatsApp</span>
          </a>
        </div>

        {/* Center: Rotating announcement messages */}
        <div className="w-full max-w-xl overflow-hidden py-1">
          <TopSlider />
        </div>

        {/* Right: Social reach & Dhaka outlets quick link */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-medium text-slate-300">
          <a
            href="https://www.facebook.com/minithailand2022/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-rose-300 hover:text-white transition-colors"
            title="534K Facebook Followers & 282M Reel Views"
          >
            <FaFacebook className="h-3 w-3 text-[#1877f2]" />
            <span>{followers}</span>
            <span>•</span>
            <span>{views}</span>
          </a>
          <span className="text-slate-600">|</span>
          <Link
            href="/contact"
            className="text-amber-200 hover:text-white transition-colors"
            title="Visit our 4 Dhaka outlets: Jamuna Future Park, Dhanmondi, Uttara & Adabor"
          >
            4 DHAKA OUTLETS
          </Link>
        </div>
      </div>
    </section>
  );
}
