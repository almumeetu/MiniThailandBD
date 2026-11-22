"use client";

import Image from "next/image";
import Link from "next/link";

interface FooterCard {
  title: string;
  image: string;
  href: string;
}

const FOOTER_CARDS: FooterCard[] = [
  {
    title: "WHO WE ARE",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=90",
    href: "/about",
  },
  {
    title: "CATEGORIES",
    image: "/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg",
    href: "/products",
  },
  {
    title: "CUSTOMER SERVICE",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&auto=format&fit=crop&q=90",
    href: "/contact",
  },
  {
    title: "MORE",
    image: "/products/cords set/913180013_1120115427314519_7306115019982798276_n.jpg",
    href: "/delivery",
  },
];

export default function AarongFooterGrid() {
  return (
    <section aria-label="Explore Mini Thailand" className="w-full bg-black select-none">
      {/* 4 Equal-width Photo Cards matching the clean pre-footer layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
        {FOOTER_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative aspect-[16/9] w-full overflow-hidden bg-zinc-950 block"
          >
            {/* Background Image */}
            <Image
              src={card.image}
              alt={card.title}
              fill
              quality={90}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Dark Vignette Overlay + Crisp Centered Title */}
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center p-2 text-center">
              <span className="text-white text-xs sm:text-sm md:text-base font-bold tracking-[0.22em] uppercase drop-shadow-md">
                {card.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
