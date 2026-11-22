"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchCampaignForSlot, CAMPAIGNS_UPDATED_EVENT } from "@/lib/campaign-store";
import { resolveImageUrl, type Campaign } from "@/lib/admin-api";

const DEFAULT_BANNER = {
  title: "MINI THAILAND ESSENTIALS",
  subtitle: "Handpicked Bangkok coordinates, velvet party edits & timeless silhouettes",
  image: "/hero/fashion/slide-velvet-couture.jpg",
  ctaText: "EXPLORE COLLECTION",
  ctaLink: "/products?category=Winter%20Collection",
  badge: "Featured Collection",
};

export default function AarongFeatureBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  const syncCampaign = useCallback(async () => {
    try {
      const active = await fetchCampaignForSlot("sec-feature-banner");
      if (active) {
        setCampaign(active);
        return;
      }
    } catch (err) {
      console.warn("Failed to sync feature banner campaign:", err);
    }
    setCampaign(null);
  }, []);

  useEffect(() => {
    syncCampaign();

    const handleUpdate = () => syncCampaign();
    window.addEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    };
  }, [syncCampaign]);

  // Extract campaign image if available
  const rawImage = campaign?.images?.[0]?.images?.[0];
  const campaignImageUrl = rawImage ? resolveImageUrl(rawImage) : null;

  const displayImage = campaignImageUrl || DEFAULT_BANNER.image;
  const displayTitle = campaign?.title || DEFAULT_BANNER.title;
  const displaySubtitle = campaign?.description || DEFAULT_BANNER.subtitle;
  const displayCtaText = campaign?.ctaText || DEFAULT_BANNER.ctaText;
  const displayCtaLink = campaign?.linkUrl || DEFAULT_BANNER.ctaLink;
  const displayBadge = campaign?.badge || null;

  return (
    <section aria-label="Featured Collection" className="w-full relative my-6 sm:my-10 overflow-hidden bg-zinc-900 select-none">
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[580px] lg:h-[640px]">
        {/* Banner image matching Aarong earth essentials style */}
        <Image
          src={displayImage}
          alt={displayTitle}
          fill
          quality={95}
          sizes="100vw"
          className="object-cover object-center transition-transform duration-1000 ease-out hover:scale-[1.01]"
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/50" />

        {/* Centered Content Block */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-[0.12em] uppercase drop-shadow-md">
              {displayTitle}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/95 font-medium tracking-wide drop-shadow line-clamp-2 max-w-xl mx-auto">
              {displaySubtitle}
            </p>

            <div className="pt-2 sm:pt-4">
              <Link
                href={displayCtaLink}
                className="inline-block bg-black text-white px-8 py-3 sm:px-10 sm:py-3.5 text-xs sm:text-[13px] font-bold tracking-[0.2em] uppercase hover:bg-zinc-800 active:scale-95 transition-all duration-200 shadow-xl border border-white/10"
              >
                {displayCtaText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
