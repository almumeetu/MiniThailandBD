"use client";

import {
  LuBadgeCheck,
  LuVideo,
  LuTruck,
  LuRotateCcw,
  LuHeadphones,
} from "react-icons/lu";

const TRUST_POINTS = [
  {
    icon: LuBadgeCheck,
    title: "100% Thai Import Guarantee",
    titleBn: "১০০% অরিজিনাল থাই ফেব্রিক",
    description: "ব্যাংককের টপ বুটিক থেকে সরাসরি আমদানিকৃত সফট, নন-ফেডিং ও দীর্ঘস্থায়ী প্রিমিয়াম কোয়ালিটি।",
  },
  {
    icon: LuVideo,
    title: "Live Video Checking",
    titleBn: "ভিডিও কলে ড্রেস দেখার সুবিধা",
    description: "পার্সেল ডিসপ্যাচের আগে হোয়াটসঅ্যাপে সরাসরি ভিডিও কলে কালার ও ফিনিশিং চেক করতে পারবেন।",
  },
  {
    icon: LuTruck,
    title: "Cash on Delivery Nationwide",
    titleBn: "সারা দেশে ক্যাশ অন ডেলিভারি",
    description: "পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা। ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, সারা দেশে ৪৮-৭২ ঘণ্টা।",
  },
  {
    icon: LuRotateCcw,
    title: "7 Days Easy Size Exchange",
    titleBn: "সহজ সাইজ এক্সচেঞ্জ গ্যারান্টি",
    description: "সাইজ বা ফিটিংয়ে সমস্যা হলে ৭ দিনের মধ্যে যেকোনো সাইজ সহজে পরিবর্তনের সুযোগ।",
  },
  {
    icon: LuHeadphones,
    title: "WhatsApp Personal Stylist",
    titleBn: "২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট",
    description: "০১৭২২-৩০১৯২৭ নম্বরে সরাসরি বুটিক এক্সপার্টের সাথে কথা বলে সঠিক সাইজ ও ডিজাইন সিলেক্ট করুন।",
  },
];

export default function BoutiqueTrust() {
  return (
    <section
      aria-label="Why shop from Mini Thailand"
      className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16 my-8 sm:my-12"
    >
      <div className="rounded-2xl bg-gradient-to-r from-rose-50/70 via-white to-[#c5a880]/10 border border-[#9e1049]/15 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9e1049] mb-1.5 block">
            Customer Guarantee &amp; Peace of Mind
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Why 50,000+ Women Trust Mini Thailand
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-rose-100/70 shadow-xs hover:border-[#c5a880] hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9e1049]/10 text-[#9e1049] border border-[#c5a880]/30 mb-3 shadow-xs">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                {title}
              </h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-zinc-500 font-bengali tracking-normal">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
