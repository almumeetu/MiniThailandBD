'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LuPlus, LuCheck, LuHeart } from 'react-icons/lu';
import { useCart } from '@/app/_providers/cart-provider';
import { useWishlist } from '@/app/_providers/wishlist-provider';
import { toast } from 'sonner';

export interface AarongProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  slug?: string;
  category?: string;
  badge?: string;
  variantId?: string;
}

const DEFAULT_IMAGE = '/products/cords set/905937710_1118136247512437_2099551318531647321_n.jpg';

export function AarongProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white overflow-hidden animate-pulse">
      <div className="relative aspect-[3/4] w-full bg-neutral-200" />
      <div className="bg-white pt-2.5 pb-2 px-1.5 space-y-2 flex flex-col items-center">
        <div className="h-3 w-3/4 rounded bg-neutral-200" />
        <div className="h-3 w-1/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export default function AarongProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  slug,
  category,
  badge,
  variantId,
}: AarongProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(image || DEFAULT_IMAGE);

  const productUrl = `/products/${slug || id}`;
  const hasDiscount = Boolean(originalPrice && originalPrice > price);
  const inWishlist = isInWishlist(id) || (slug ? isInWishlist(slug) : false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;
    setIsAdding(true);

    try {
      await addItem({
        id,
        productId: id,
        name,
        price,
        image: imgSrc,
        color: '',
        size: '',
        slug: slug || id,
        variantId,
        quantity: 1,
      });

      setIsAdded(true);
      toast.success(`${name} added to bag!`);
      setTimeout(() => setIsAdded(false), 1800);
    } catch {
      toast.error('Could not add to bag');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      id,
      name,
      slug: slug || id,
      price,
      image: imgSrc,
      color: '',
      size: '',
      category: category || '',
      team: '',
      variantId,
    });
  };

  return (
    <article className="group relative flex flex-col bg-[#f5f5f5] overflow-hidden transition-all duration-300">
      {/* Portrait Image Container (approx 3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#e8e8e8]">
        <Link href={productUrl} aria-label={`View ${name}`} className="block h-full w-full">
          <Image
            src={imgSrc}
            alt={name}
            fill
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImgSrc(DEFAULT_IMAGE)}
          />
        </Link>

        {/* Badge (Sale or Custom Tag) */}
        {badge ? (
          <span className="absolute top-2.5 left-2.5 z-10 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider backdrop-blur-xs">
            {badge}
          </span>
        ) : hasDiscount ? (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#EC1966] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider shadow-xs">
            SALE
          </span>
        ) : null}

        {/* Wishlist Button — Visible on mobile touch & smoothly reveals on desktop card hover */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={inWishlist}
          title={inWishlist ? "Saved in wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-all duration-300 ease-out cursor-pointer shadow-md backdrop-blur-xs ${
            inWishlist
              ? "opacity-100 scale-100 bg-white text-[#ec1c67] border-rose-200 shadow-rose-500/15"
              : "opacity-90 sm:opacity-0 sm:scale-90 sm:-translate-y-1 sm:pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto bg-white/95 text-zinc-600 border-black/10 hover:text-[#ec1c67] hover:border-rose-200 hover:bg-rose-50 hover:scale-110 active:scale-95"
          }`}
        >
          <LuHeart
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-200 ${
              inWishlist ? "fill-[#ec1c67] text-[#ec1c67] scale-110" : ""
            }`}
          />
        </button>

        {/* Circular Quick Add Button (+) matching Aarong at bottom-left */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isAdding}
          aria-label={`Quick add ${name} to cart`}
          className={`absolute left-2.5 bottom-2.5 sm:left-3 sm:bottom-3 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-black/10 transition-all duration-200 cursor-pointer shadow-sm ${
            isAdded
              ? 'bg-black text-white'
              : 'bg-white/95 text-zinc-800 hover:bg-black hover:text-white'
          }`}
        >
          {isAdded ? (
            <LuCheck className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <LuPlus className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Clean minimal info strip below */}
      <div className="bg-white pt-2.5 pb-2 px-1.5 flex flex-col justify-between flex-1">
        <Link href={productUrl} className="block group-hover:text-black">
          <h3 className="text-xs sm:text-[13px] font-medium text-zinc-800 truncate" title={name}>
            {name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs sm:text-[13px] font-bold text-zinc-950">
              ৳ {price?.toLocaleString()}
            </span>
            {hasDiscount && originalPrice && (
              <span className="text-[11px] text-zinc-400 line-through">
                ৳ {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </Link>
      </div>
    </article>
  );
}
