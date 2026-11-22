'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LuBadgeCheck,
  LuCrown,
  LuVideo,
  LuRotateCcw,
  LuSparkles,
  LuShieldCheck,
  LuRefreshCw,
  LuEye,
  LuArrowRight,
  LuMapPin,
  LuClock,
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import PageBanner from '@/components/ui/page-banner';

export default function About() {
  const parallaxRef = useRef<HTMLElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (parallaxRef.current) {
            const rect = parallaxRef.current.getBoundingClientRect();
            const winH = window.innerHeight;
            if (rect.top <= winH && rect.bottom >= 0) {
              const progress = (winH - rect.top) / (winH + rect.height);
              setOffsetY((progress - 0.5) * 100);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const brandPillars = [
    {
      step: '01',
      title: '100% Authentic Bangkok Import',
      desc: 'We eliminate intermediaries and counterfeit copies by sourcing directly from verified boutique atelier designers in Bangkok. Every piece is genuine and original.',
      icon: LuBadgeCheck,
    },
    {
      step: '02',
      title: 'Signature Fabric & Premium Finish',
      desc: 'From royal velvet and breathable linen-cotton to chantilly lace and smooth georgette, our garments are chosen for tactile luxury and lasting drape.',
      icon: LuCrown,
    },
    {
      step: '03',
      title: 'Live WhatsApp Video Checking',
      desc: 'Unsure about color, size, or drape? Our stylists provide live video showcases and detailed measurements directly on WhatsApp before your order is dispatched.',
      icon: LuVideo,
    },
    {
      step: '04',
      title: '7-Day Easy Size Exchange',
      desc: 'Size not fitting perfectly? Swap effortlessly at any of our 4 physical Dhaka boutiques or request a doorstep courier swap anywhere in Bangladesh.',
      icon: LuRotateCcw,
    },
  ];

  const showrooms = [
    {
      name: 'Jamuna Future Park Flagship',
      mall: 'Shop 11, Zone C, Ground Floor',
      address: 'Progoti Shoroni, Kuril, Dhaka',
    },
    {
      name: 'Dhanmondi Simanto Somvar',
      mall: 'Shop 3060, Level 3',
      address: 'Road 2, Dhanmondi, Dhaka',
    },
    {
      name: 'Uttara Nigar Plaza',
      mall: 'Shop 23-24, Level 2',
      address: 'Sector 3, Rajlokkhi, Uttara, Dhaka',
    },
    {
      name: 'Adabor Shahabuddin Plaza',
      mall: 'Shop 43, Level 2',
      address: 'Ring Road, Adabor, Mohammadpur, Dhaka',
    },
  ];

  return (
    <article className="w-full text-zinc-900 bg-white font-sans pb-16">

      {/* ── 1. Hero PageBanner with Campaign Hero Image ── */}
      <PageBanner
        title="The Story of Mini Thailand"
        subtitle="Bangladesh's premier boutique destination for authentic imported Bangkok fashion, luxury coordinate sets, and festive gowns."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us' },
        ]}
        bgImage="/images/campaign/minit-2.webp"
        showTrustChips={false}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 pt-12 sm:pt-16 space-y-16 sm:space-y-24">

        {/* ── 2. Editorial Heritage Split ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Campaign Image */}
          <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-zinc-100 border border-zinc-200">
            <Image
              src="/images/campaign/minit-6.webp"
              alt="Mini Thailand Bangkok Collection Story"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Story Narrative */}
          <div className="lg:col-span-6 space-y-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-zinc-950 leading-tight">
              Curating Bangkok’s Finest Elegance for Bangladesh.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-zinc-600 leading-relaxed font-light">
              <p>
                Mini Thailand was founded to bridge the gap between runway-quality Bangkok tailoring and accessible luxury in Bangladesh. We believe that modern women deserve original, beautifully draped outfits without market duplicates or compromised fabrics.
              </p>
              <p>
                By working directly with certified design ateliers across Bangkok, we eliminate middlemen and bring handpicked collections—from structured coordinate sets to hand-embroidered velvet gowns—directly to our 4 Dhaka boutiques and online store.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-none bg-zinc-950 hover:bg-[#ec1c67] text-white text-xs font-bold uppercase tracking-[0.14em] transition-all shadow-xs"
              >
                <span>Explore Collections</span>
                <LuArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/8801706126663"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-none border border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50 text-zinc-900 text-xs font-bold uppercase tracking-[0.14em] transition-all"
              >
                <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* ── 3. Brand Pillars with Parallax Background (minit-3 (1).webp) ── */}
      <section
        ref={parallaxRef}
        className="relative w-full overflow-hidden bg-zinc-950 py-16 sm:py-24 text-white mt-16 sm:mt-24"
      >
        {/* Parallax Background Layer using minit-3 (1).webp */}
        <div
          aria-hidden="true"
          className="absolute -top-[20%] inset-x-0 h-[140%] w-full bg-cover bg-center pointer-events-none will-change-transform"
          style={{
            backgroundImage: "url('/images/campaign/minit-3 (1).webp')",
            transform: `translate3d(0, ${offsetY}px, 0) scale(1.08)`,
            transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />

        {/* Deep, clean black overlay for optimal text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/85 pointer-events-none"
        />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 space-y-10 sm:space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ec1c67] block">
              The Mini Thailand Promise
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">
              Why Choose Mini Thailand
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {brandPillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.step}
                  className="relative overflow-hidden rounded-none bg-gradient-to-b from-white via-white to-[#fff0f5] p-6 sm:p-7 space-y-4 transition-all duration-300 group hover:-translate-y-1.5 shadow-2xl shadow-black/30"
                >
                  {/* Top Accent Strip in Brand Theme Color - 1px border */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-[#ec1c67]" />

                  {/* Large Background Numbering Shape */}
                  <span
                    aria-hidden="true"
                    className="absolute top-2 right-3 sm:right-4 text-7xl sm:text-8xl font-black font-sans text-[#ec1c67]/12 group-hover:text-[#ec1c67]/22 select-none pointer-events-none transition-all duration-300 leading-none tracking-tighter group-hover:scale-105"
                  >
                    {p.step}
                  </span>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="w-11 h-11 rounded-none bg-[#ec1c67] text-white flex items-center justify-center shadow-sm group-hover:bg-[#d81358] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 group-hover:text-[#ec1c67] transition-colors leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Physical Showrooms ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 pt-16 sm:pt-24">
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                Physical Showrooms
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">
                Experience Our Boutiques in Dhaka
              </h2>
            </div>
            <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <LuClock className="w-3.5 h-3.5 text-zinc-400" />
              <span>10:00 AM – 10:00 PM Daily</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {showrooms.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-none border border-zinc-200 bg-white space-y-1.5 hover:border-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-zinc-950 text-sm">
                  <LuMapPin className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  <span className="truncate">{s.name}</span>
                </div>
                <p className="text-xs text-zinc-800 font-semibold">{s.mall}</p>
                <p className="text-xs text-zinc-500">{s.address}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

    </article>
  );
}
