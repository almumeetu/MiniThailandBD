"use client";

import Image from "next/image";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

interface LookItem {
  id: string;
  title: string;
  tag: string;
  image: string;
  link: string;
}

const LOOKS: LookItem[] = [
  {
    id: "look-1",
    title: "Wedding & Festive Glamour",
    tag: "Party Edit",
    image: "/products/cords set/907179635_1119377164055012_4690738175147170981_n.jpg",
    link: "/products?category=Party%20Gowns",
  },
  {
    id: "look-2",
    title: "Dubai Modest Elegance",
    tag: "Modest Fashion",
    image: "/products/cords set/910465086_1119291994063529_6730173952863950097_n.jpg",
    link: "/products?category=Luxury%20Abayas",
  },
  {
    id: "look-3",
    title: "Bangkok Cord Sets",
    tag: "Daily Chic",
    image: "/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg",
    link: "/products?category=Cord%20Sets",
  },
  {
    id: "look-4",
    title: "Winter Velvet & Overcoats",
    tag: "Winter Warmth",
    image: "/products/cords set/916496639_2050418568951611_3231227725146044425_n.jpeg",
    link: "/products?category=Winter%20Collection",
  },
];

export default function StyleLookbook() {
  return (
    <section
      aria-label="Shop by occasion"
      className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Shop by Occasion &amp; Style
          </h2>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          <span>View all collections</span>
          <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {LOOKS.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[340px] sm:h-[380px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Background Image */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 group-hover:from-black/95 transition-colors" />

            {/* Tag Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 shadow-sm">
                {item.tag}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 text-white">
              <h3 className="text-lg sm:text-xl font-bold leading-tight group-hover:text-rose-200 transition-colors">
                {item.title}
              </h3>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 group-hover:text-white transition-colors">
                <span>Explore collection</span>
                <LuArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
