'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  LuChevronLeft,
  LuChevronRight,
  LuPause,
  LuPlay,
  LuX,
  LuSparkles,
  LuArrowRight,
  LuMaximize2,
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';

export interface ClientCard {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
  quote?: string;
}

const CLIENT_LOOKS: ClientCard[] = [
  {
    id: 1,
    image: '/images/client-dairy/clients-dairy1.jpeg',
    title: 'Grace in Royal Bangkok Silk',
    subtitle: 'Signature Co-ord Set',
    tag: 'Client Spotlight',
    quote: 'The fabric drape and fit were beyond perfection for my family dinner.',
  },
  {
    id: 2,
    image: '/images/client-dairy/clients-dairy2.jpeg',
    title: 'Celebration Velvet Elegance',
    subtitle: 'Bespoke Festive Gown',
    tag: 'Festive Edit',
    quote: 'Received countless compliments at the wedding. 100% authentic feel!',
  },
  {
    id: 3,
    image: '/images/client-dairy/clients-dairy3.jpeg',
    title: 'Modern Minimalist Silhouette',
    subtitle: 'Tailored 2-Piece Edit',
    tag: 'Daily Glamour',
    quote: 'Effortless all-day comfort with high-fashion aesthetics.',
  },
  {
    id: 4,
    image: '/images/client-dairy/clients-dairy4.jpeg',
    title: 'Chantilly Lace Sophistication',
    subtitle: 'Luxury Boutique Ensemble',
    tag: 'Boutique Exclusive',
    quote: 'Mini Thailand is now my go-to for original Bangkok couture in Dhaka.',
  },
  {
    id: 5,
    image: '/images/client-dairy/clients-dairy5.jpg',
    title: 'Contemporary Dhaka Chic',
    subtitle: 'Structured Blazer Set',
    tag: 'Client Spotlight',
    quote: 'The cut and shoulder structure are immaculate. Super stylish!',
  },
  {
    id: 6,
    image: '/images/client-dairy/clients-dairy6.jpg',
    title: 'Runway Drape & Fluidity',
    subtitle: 'Evening Glamour Gown',
    tag: 'Runway Edit',
    quote: 'Felt like walking a red carpet. The premium georgette drapes like a dream.',
  },
  {
    id: 7,
    image: '/images/client-dairy/clients-dairy7.jpg',
    title: 'Timeless Festive Glam',
    subtitle: 'Hand-Embroidered Velvet',
    tag: 'Festive Edit',
    quote: 'Authentic imported collection with uncompromised stitching quality.',
  },
  {
    id: 8,
    image: '/images/client-dairy/clients-dairy8.jpg',
    title: 'Artisan Embroidered Ensemble',
    subtitle: 'Exclusive Bangkok Collection',
    tag: 'Boutique Exclusive',
    quote: 'Live video checking on WhatsApp gave me total confidence before delivery.',
  },
  {
    id: 9,
    image: '/images/client-dairy/clients-dairy9.jpg',
    title: 'Cherished Family Moments',
    subtitle: 'Signature Party Edit',
    tag: 'Client Spotlight',
    quote: 'Mini Thailand made our celebration even more memorable.',
  },
  {
    id: 10,
    image: '/images/client-dairy/clients-dairy10.jpg',
    title: 'Effortless Co-ord Charm',
    subtitle: 'Modern Bangkok Coordinate',
    tag: 'Daily Glamour',
    quote: 'Crisp finish, zero shrink, and premium touch. Loved the styling.',
  },
  {
    id: 11,
    image: '/images/client-dairy/clients-dairy11.jpg',
    title: 'Jewel-Toned Velvet Splendor',
    subtitle: 'Winter Couture Collection',
    tag: 'Runway Edit',
    quote: 'Stunning royal hue with flawless silhouette. Highly recommended!',
  },
];

// Double list for infinite wrap-around marquee loop
const DISPLAY_ITEMS: ClientCard[] = [...CLIENT_LOOKS, ...CLIENT_LOOKS];

export default function ClientsDiarySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [stageWidth, setStageWidth] = useState(1200);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLightbox, setActiveLightbox] = useState<ClientCard | null>(null);

  // Marquee physics and animation tracking
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isPlayingRef = useRef(true);
  isPlayingRef.current = isPlaying;

  const dragStartRef = useRef({ x: 0, time: 0 });
  const lastPointerRef = useRef({ x: 0, time: 0 });
  const dragDistanceRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Responsive metrics calculation
  const isMobile = stageWidth < 640;
  const isTablet = stageWidth >= 640 && stageWidth < 1024;

  const cardWidth = isMobile ? 180 : isTablet ? 210 : 250;
  const cardHeight = isMobile ? 260 : isTablet ? 300 : 355;
  const step = isMobile ? 200 : isTablet ? 235 : 275;
  const totalLength = DISPLAY_ITEMS.length * step;
  const halfWidth = stageWidth / 2;

  // Track container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) {
        setStageWidth(entry.contentRect.width);
      }
    });

    ro.observe(el);
    setStageWidth(el.clientWidth || window.innerWidth || 1200);

    return () => ro.disconnect();
  }, []);

  // Update card styles directly for 60/120fps hardware acceleration
  const updateTransforms = useCallback(() => {
    const total = DISPLAY_ITEMS.length;
    const L = total * step;
    const halfW = stageWidth / 2;
    const offset = offsetRef.current;

    for (let i = 0; i < total; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let pos = (i * step - offset) % L;
      if (pos < -L / 2) pos += L;
      if (pos > L / 2) pos -= L;

      // Cull completely off-screen items to save GPU resources
      if (Math.abs(pos) > halfW + cardWidth * 1.5) {
        el.style.visibility = 'hidden';
        continue;
      }

      el.style.visibility = 'visible';

      const u = pos / halfW;
      const clampedU = Math.max(-1.3, Math.min(1.3, u));
      const absU = Math.abs(clampedU);

      // Inward rotation Y (matches reference image cylinder curve)
      // Left cards turn right towards center; Right cards turn left towards center
      const rotY = -clampedU * 28;

      // Scale: concave depth (center is smaller ~0.74, sides grow up to ~1.12)
      const scale = 0.74 + 0.36 * Math.pow(Math.min(1.2, absU), 1.35);

      // Y Arc: parabolic smile dip (center dips down ~32px, sides rise to 0)
      const y = 32 * (1 - Math.pow(Math.min(1, absU), 2));

      // Z-Index: outer cards in front of receding center cards
      const z = Math.round(10 + absU * 40);

      el.style.transform = `translate3d(calc(-50% + ${pos}px), calc(-50% + ${y}px), 0) rotateY(${rotY}deg) scale(${scale})`;
      el.style.zIndex = `${z}`;
    }
  }, [DISPLAY_ITEMS.length, step, stageWidth, cardWidth]);

  // Main animation ticker loop
  useEffect(() => {
    const tick = (now: number) => {
      if (!lastTickRef.current) lastTickRef.current = now;
      const dt = Math.min(32, now - lastTickRef.current);
      lastTickRef.current = now;

      if (!isDraggingRef.current) {
        // Friction decay on momentum velocity
        if (Math.abs(velocityRef.current) > 0.04) {
          offsetRef.current += velocityRef.current * (dt / 16);
          velocityRef.current *= 0.94; // friction
        } else {
          velocityRef.current = 0;
          // Smooth continuous marquee autoplay
          if (isPlayingRef.current && !isHoveredRef.current) {
            // Speed in pixels per frame (~0.85px per 16ms = ~53px/s)
            const speed = 0.85;
            offsetRef.current += speed * (dt / 16);
          }
        }
      }

      // Keep offset in positive range to prevent numerical overflow
      if (offsetRef.current > totalLength * 100) {
        offsetRef.current %= totalLength;
      } else if (offsetRef.current < -totalLength * 100) {
        offsetRef.current = (offsetRef.current % totalLength) + totalLength;
      }

      updateTransforms();
      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [totalLength, updateTransforms]);

  // Pointer drag interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    velocityRef.current = 0;

    const now = performance.now();
    dragStartRef.current = { x: e.clientX, time: now };
    lastPointerRef.current = { x: e.clientX, time: now };

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture fails
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dx = e.clientX - lastPointerRef.current.x;
    const dt = Math.max(1, now - lastPointerRef.current.time);

    dragDistanceRef.current += Math.abs(dx);

    // Negative dx means dragged to the left, so offset increases (content moves left)
    offsetRef.current += -dx * 1.15;

    // Calculate instantaneous velocity (pixels per frame normalized)
    velocityRef.current = (-dx / dt) * 16;

    lastPointerRef.current = { x: e.clientX, time: now };
    updateTransforms();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Clamp flick velocity to smooth glide
    const maxVelocity = 18;
    velocityRef.current = Math.max(
      -maxVelocity,
      Math.min(maxVelocity, velocityRef.current),
    );

    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  // Keyboard accessibility for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLightbox) {
        setActiveLightbox(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightbox]);

  // Manual step navigation
  const handleStep = (direction: 'prev' | 'next') => {
    velocityRef.current = direction === 'next' ? 12 : -12;
  };

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white via-zinc-50/70 to-white overflow-hidden select-none">
      
      {/* ── Center Aligned Section Header (Identical to reference structure) ── */}
      <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
        
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ec1c67]/10 text-[#ec1c67] border border-[#ec1c67]/20 text-[11px] font-bold uppercase tracking-[0.2em]">
          <LuSparkles className="w-3.5 h-3.5" />
          <span>Real Moments • Real Style</span>
        </div>

        {/* Prominent Header */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-zinc-950 tracking-tight leading-tight">
          Clients Diary
        </h2>

        {/* Curated Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-600 max-w-xl mx-auto font-light leading-relaxed">
          Loved by thousands of women across Bangladesh. Explore authentic styling
          moments, celebratory drapes, and cherished memories shared by our community.
        </p>

        {/* Action Button Pill */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <a
            href="https://wa.me/8801706126663"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-[#ec1c67] text-white text-xs font-semibold tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <span>Share Your Look</span>
            <LuArrowRight className="w-3.5 h-3.5" />
          </a>

          {/* Autoplay Pause/Resume Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? 'Pause Auto Scroll' : 'Play Auto Scroll'}
            className="w-9 h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition-all shadow-xs active:scale-95"
          >
            {isPlaying ? (
              <LuPause className="w-3.5 h-3.5" />
            ) : (
              <LuPlay className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Full Width 3D Cylinder Marquee Slider ── */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
        className="relative w-full mt-10 sm:mt-14 overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        style={{
          perspective: isMobile ? '800px' : '1200px',
          perspectiveOrigin: '50% 50%',
          height: isMobile ? '360px' : isTablet ? '420px' : '480px',
        }}
      >
        {/* Soft edge fade masks for premium cinematic blending */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 md:w-24 bg-gradient-to-r from-white via-white/70 to-transparent z-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 md:w-24 bg-gradient-to-l from-white via-white/70 to-transparent z-40" />

        {/* 3D Curved Cards Array */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {DISPLAY_ITEMS.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
              }}
              className="absolute left-1/2 top-1/2 rounded-[22px] sm:rounded-[26px] overflow-hidden bg-white shadow-[0_20px_45px_-10px_rgba(0,0,0,0.18)] border border-black/5 pointer-events-auto transition-shadow duration-300 group will-change-transform"
              onClick={() => {
                // If user was dragging, do not open lightbox
                if (dragDistanceRef.current > 6) return;
                setActiveLightbox(item);
              }}
            >
              {/* Image Container with Full Fill */}
              <div className="relative w-full h-full overflow-hidden bg-zinc-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 1024px) 210px, 250px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out select-none pointer-events-none"
                  draggable={false}
                  priority={index < 8}
                />

                {/* Subtle vignette gradient for readable tag */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Floating Tag Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white border border-white/10 shadow-sm">
                  {item.tag}
                </div>

                {/* Zoom Icon on Hover */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm">
                  <LuMaximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Bottom Caption Pill */}
                <div className="absolute bottom-3 inset-x-3 text-white space-y-0.5">
                  <p className="text-xs sm:text-sm font-semibold truncate text-white drop-shadow-sm">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-zinc-300 font-light truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Manual Slide Controls */}
        <div className="hidden sm:flex absolute bottom-4 inset-x-0 justify-center items-center gap-3 z-50 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStep('prev');
            }}
            title="Previous Look"
            className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-900 border border-zinc-200/80 shadow-md backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 hover:shadow-lg"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono tracking-widest text-zinc-500 bg-white/80 px-3 py-1 rounded-full border border-zinc-200 backdrop-blur-xs">
            SWIPE TO EXPLORE
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStep('next');
            }}
            title="Next Look"
            className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-900 border border-zinc-200/80 shadow-md backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 hover:shadow-lg"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── High-Resolution Photo Lightbox Preview Modal ── */}
      {activeLightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ec1c67] bg-[#fff0f5] px-2.5 py-0.5 rounded-full">
                  {activeLightbox.tag}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Look #{activeLightbox.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
                title="Close"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden">
              <Image
                src={activeLightbox.image}
                alt={activeLightbox.title}
                fill
                sizes="(max-width: 640px) 100vw, 500px"
                className="object-contain"
                priority
              />
            </div>

            {/* Modal Footer & Information */}
            <div className="p-5 space-y-3 bg-white">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 font-serif">
                  {activeLightbox.title}
                </h3>
                <p className="text-xs text-zinc-500">{activeLightbox.subtitle}</p>
              </div>

              {activeLightbox.quote && (
                <p className="text-xs italic text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100 leading-relaxed">
                  “{activeLightbox.quote}”
                </p>
              )}

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={`https://wa.me/8801706126663?text=${encodeURIComponent(
                    `Hello Mini Thailand, I loved the client look "${activeLightbox.title}" from your About Us Clients Diary! Could you tell me more about this outfit?`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>Inquire This Outfit on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveLightbox(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
