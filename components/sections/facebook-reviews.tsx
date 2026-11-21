"use client";

import Link from "next/link";
import { LuStar, LuBadgeCheck, LuQuote } from "react-icons/lu";
import { FaFacebookF } from "react-icons/fa";

interface ReviewItem {
  id: string;
  name: string;
  location: string;
  product: string;
  date: string;
  rating: number;
  comment: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Tanjina Akter",
    location: "Dhanmondi, Dhaka",
    product: "Thai Cord Set — Rose Pink",
    date: "November 2026",
    rating: 5,
    comment:
      "ফেসবুক লাইভে দেখে অর্ডার করেছিলাম। কাপড়টা অবিশ্বাস্য রকম সফট আর আরামদায়ক! ছবির চেয়ে বাস্তবে আরও গর্জিয়াস লাগে। সাইজ একদম পারফেক্ট হয়েছে।",
  },
  {
    id: "rev-2",
    name: "Sadia Islam Mim",
    location: "Nasirabad, Chattogram",
    product: "Wine Red Tiered Velvet Party Gown",
    date: "November 2026",
    rating: 5,
    comment:
      "আমার বোনের বিয়ের জন্য এই ভেলভেট গাউনটা নিয়েছিলাম। সবাই প্রশংসা করেছে! ভেলভেটের শাইন আর স্টিচিং ফিনিশিং সত্যি অসাধারণ। ২ দিনের মধ্যে চট্টগ্রামে পেয়েছি।",
  },
  {
    id: "rev-3",
    name: "Nusrat Jahan Chowdhury",
    location: "Upashahar, Sylhet",
    product: "Dubai Style Beige Shrug & Abaya Set",
    date: "October 2026",
    rating: 5,
    comment:
      "অনলাইনে কাপড় কিনতে ভয় পেতাম, কিন্তু মিনি থাইল্যান্ড ভিডিও কলে ড্রেস দেখিয়ে পাঠিয়েছে। প্যাকেজিং ও আবায়ার কোয়ালিটি ১০০ তে ১০০। থ্যাংক ইউ!",
  },
  {
    id: "rev-4",
    name: "Mehnaz Rahman",
    location: "Uttara, Dhaka",
    product: "Textured Animal Print Long Overcoat",
    date: "November 2026",
    rating: 5,
    comment:
      "শীতের জন্য এই ওভারকোটটা নিয়েছি। দেখতে দারুণ এলিগেন্ট এবং বেশ উষ্ণ। ফেসবুক পেজের মেসেজে সাইজের ব্যাপারে দারুণ হেল্প করেছে。",
  },
];

export default function FacebookReviews() {
  return (
    <section
      aria-label="Customer reviews"
      className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Real Words from Real Customers
          </h2>
        </div>

        <Link
          href="https://www.facebook.com/minithailand2022/reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors shadow-xs"
        >
          <FaFacebookF className="text-[#1877F2]" />
          <span>See all reviews on Facebook (4.9 ★)</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {REVIEWS.map((review) => (
          <div
            key={review.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div>
              {/* Header: Stars + Quote Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <LuStar key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <LuQuote className="h-5 w-5 text-rose-200" />
              </div>

              {/* Comment */}
              <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-700 font-bengali tracking-normal not-italic">
                &ldquo;{review.comment}&rdquo;
              </p>
            </div>

            <div className="mt-5 border-t border-zinc-100 pt-3">
              <span className="text-[11px] font-semibold text-rose-600 block truncate">
                {review.product}
              </span>
              <div className="mt-1.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">
                    {review.name}
                  </h4>
                  <span className="text-[10px] text-zinc-400">
                    {review.location}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <LuBadgeCheck className="h-3 w-3" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
