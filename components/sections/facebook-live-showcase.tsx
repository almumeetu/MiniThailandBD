"use client";

import Image from "next/image";
import Link from "next/link";
import { LuPlay, LuHeart, LuEye, LuArrowRight } from "react-icons/lu";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";

interface LiveItem {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  price: string;
  originalPrice?: string;
  image: string;
  views: string;
  likes: string;
  tag: string;
  whatsappMessage: string;
}

const LIVE_ITEMS: LiveItem[] = [
  {
    id: "live-1",
    title: "Thai Cord Set — Rose Pink Special",
    titleBn: "থাই কর্ড সেট — লাইভ স্পেশাল কালেকশন",
    category: "Cord Sets",
    price: "৳ 1,800",
    originalPrice: "৳ 2,200",
    image: "/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg",
    views: "18.4K",
    likes: "1.2K",
    tag: "LIVE HIT",
    whatsappMessage: "Hello Mini Thailand, I saw the Rose Pink Thai Cord Set on your Facebook Live and want to order it.",
  },
  {
    id: "live-2",
    title: "Wine Red Tiered Velvet Party Gown",
    titleBn: "ওয়াইন রেড ভেলভেট গর্জিয়াস পার্টি গাউন",
    category: "Party Gowns",
    price: "৳ 3,850",
    originalPrice: "৳ 4,500",
    image: "/products/cords set/907179635_1119377164055012_4690738175147170981_n.jpg",
    views: "24.1K",
    likes: "2.5K",
    tag: "HOT SELLER",
    whatsappMessage: "Hello Mini Thailand, I want to order the Wine Red Velvet Party Gown shown in Live.",
  },
  {
    id: "live-3",
    title: "Dubai Style Beige Shrug & Abaya Set",
    titleBn: "দুবাই স্টাইল বেইজ আবায়া ও শ্রাগ সেট",
    category: "Luxury Abayas",
    price: "৳ 3,200",
    originalPrice: "৳ 3,800",
    image: "/products/cords set/910465086_1119291994063529_6730173952863950097_n.jpg",
    views: "15.9K",
    likes: "980",
    tag: "BESTSELLER",
    whatsappMessage: "Hello Mini Thailand, I want to order the Dubai Beige Shrug Abaya set with matching hijab.",
  },
  {
    id: "live-4",
    title: "Textured Animal Print Long Overcoat",
    titleBn: "চিটা প্রিন্ট লাক্সারি লং ওভারকোট",
    category: "Winter Collection",
    price: "৳ 3,200",
    originalPrice: "৳ 3,900",
    image: "/products/cords set/916496639_2050418568951611_3231227725146044425_n.jpeg",
    views: "31.2K",
    likes: "3.1K",
    tag: "VIRAL ON FB",
    whatsappMessage: "Hello Mini Thailand, please let me know the available sizes for the Animal Print Long Overcoat.",
  },
];

export default function FacebookLiveShowcase() {
  return (
    <section
      aria-label="Facebook Live Showcase"
      className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16"
    >
      <div className="rounded-3xl bg-gradient-to-br from-[#1c0211] via-[#2d051c] to-[#12000a] p-6 text-white shadow-2xl sm:p-8 lg:p-10 border border-rose-950/40">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rose-900/40 pb-5 mb-7">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Trending Outfits from Our Page
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="https://www.facebook.com/minithailand2022/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#1567d3] transition-all shadow-md active:scale-95"
            >
              <FaFacebookF className="h-3.5 w-3.5" />
              <span>Follow Facebook Page</span>
            </Link>
          </div>
        </div>

        {/* Video / Reel Styled Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {LIVE_ITEMS.map((item) => {
            const waUrl = `https://wa.me/8801722301927?text=${encodeURIComponent(item.whatsappMessage)}`;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-950/50"
              >
                {/* Visual / Thumbnail Frame */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-md">
                      <LuPlay className="h-2.5 w-2.5 fill-current" />
                      {item.tag}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-white/90">
                      <LuEye className="h-3 w-3 text-rose-400" />
                      {item.views}
                    </span>
                  </div>

                  {/* Bottom Info on Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                      {item.category}
                    </span>
                    <h3 className="line-clamp-1 text-sm font-bold text-white mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Card Action Strip */}
                <div className="flex flex-col gap-2 p-3.5 bg-black/30">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-rose-400">
                        {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-white/50 line-through">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/60 flex items-center gap-1">
                      <LuHeart className="h-3 w-3 text-rose-400 fill-rose-400" />
                      {item.likes}
                    </span>
                  </div>

                  {/* Dual Action: Direct WhatsApp Order + Details */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors"
                      title="Direct order via WhatsApp"
                    >
                      <FaWhatsapp className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      <span>Order Now</span>
                      <LuArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
