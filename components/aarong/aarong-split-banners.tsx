"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchCampaignForSlot, CAMPAIGNS_UPDATED_EVENT } from "@/lib/campaign-store";
import { resolveImageUrl, type Campaign } from "@/lib/admin-api";

const DEFAULT_SPLIT_1 = {
  title: "Royal Party Gowns",
  subtitle: "Hand-beaded lace & opulent velvet for regal celebrations",
  image: "/images/campaign/bottom-campain-1.webp",
  ctaText: "EXPLORE GOWNS",
  ctaLink: "/products?category=Party%20Gowns",
};

const DEFAULT_SPLIT_2 = {
  title: "Festive Cord Sets",
  subtitle: "Imported 2-piece coordinates & premium Bangkok fashion",
  image: "/images/campaign/bottom-campain-2.webp",
  ctaText: "SHOP CORD SETS",
  ctaLink: "/products?category=Cord%20Sets",
};

export default function AarongSplitBanners() {
  const [split1Campaign, setSplit1Campaign] = useState<Campaign | null>(null);
  const [split2Campaign, setSplit2Campaign] = useState<Campaign | null>(null);

  const syncSplitCampaigns = useCallback(async () => {
    try {
      const [camp1, camp2] = await Promise.all([
        fetchCampaignForSlot("sec-split-1"),
        fetchCampaignForSlot("sec-split-2"),
      ]);
      setSplit1Campaign(camp1);
      setSplit2Campaign(camp2);
    } catch (err) {
      console.warn("Failed to sync split banner campaigns:", err);
      setSplit1Campaign(null);
      setSplit2Campaign(null);
    }
  }, []);

  useEffect(() => {
    syncSplitCampaigns();

    const handleUpdate = () => syncSplitCampaigns();
    window.addEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CAMPAIGNS_UPDATED_EVENT, handleUpdate);
    };
  }, [syncSplitCampaigns]);

  // Card 1 values
  const rawImg1 = split1Campaign?.images?.[0]?.images?.[0];
  const img1 = rawImg1 ? resolveImageUrl(rawImg1) : DEFAULT_SPLIT_1.image;
  const title1 = split1Campaign?.title || DEFAULT_SPLIT_1.title;
  const subtitle1 = split1Campaign?.description || DEFAULT_SPLIT_1.subtitle;
  const ctaText1 = split1Campaign?.ctaText || DEFAULT_SPLIT_1.ctaText;
  const ctaLink1 = split1Campaign?.linkUrl || DEFAULT_SPLIT_1.ctaLink;

  // Card 2 values
  const rawImg2 = split2Campaign?.images?.[0]?.images?.[0];
  const img2 = rawImg2 ? resolveImageUrl(rawImg2) : DEFAULT_SPLIT_2.image;
  const title2 = split2Campaign?.title || DEFAULT_SPLIT_2.title;
  const subtitle2 = split2Campaign?.description || DEFAULT_SPLIT_2.subtitle;
  const ctaText2 = split2Campaign?.ctaText || DEFAULT_SPLIT_2.ctaText;
  const ctaLink2 = split2Campaign?.linkUrl || DEFAULT_SPLIT_2.ctaLink;

  return (
    <section aria-label="Campaign Highlights" className="w-full bg-white py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Editorial Card matching Aarong's Silver Statement */}
          <div className="group relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden bg-zinc-900">
            <Image
              src={img1}
              alt={title1}
              fill
              quality={95}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

            {/* Centered Typography & Button */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 sm:pb-16 px-4 text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-md">
                {title1}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-white/90 drop-shadow line-clamp-2 max-w-sm">
                {subtitle1}
              </p>
              <div className="mt-5">
                <Link
                  href={ctaLink1}
                  className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-[#c5a880] hover:text-white px-8 py-3 sm:px-10 sm:py-3.5 text-xs sm:text-[13px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_30px_rgba(197,168,128,0.4)] border border-white/90 hover:scale-[1.03] active:scale-95 group/btn cursor-pointer"
                >
                  <span>{ctaText1}</span>
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Editorial Card matching Aarong's Festive Edit */}
          <div className="group relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden bg-zinc-900">
            <Image
              src={img2}
              alt={title2}
              fill
              quality={95}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

            {/* Centered Typography & Button */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 sm:pb-16 px-4 text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-md">
                {title2}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-white/90 drop-shadow line-clamp-2 max-w-sm">
                {subtitle2}
              </p>
              <div className="mt-5">
                <Link
                  href={ctaLink2}
                  className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-[#c5a880] hover:text-white px-8 py-3 sm:px-10 sm:py-3.5 text-xs sm:text-[13px] font-extrabold tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_30px_rgba(197,168,128,0.4)] border border-white/90 hover:scale-[1.03] active:scale-95 group/btn cursor-pointer"
                >
                  <span>{ctaText2}</span>
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
