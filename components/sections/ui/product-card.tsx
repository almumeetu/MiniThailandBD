"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductCardProps } from "@/data/types";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import type { WishlistProduct } from "@/lib/types";
import { getProductFallbackImage } from "@/lib/admin-api";
import { toast } from "sonner";
import { LuShoppingBag, LuCheck, LuHeart, LuLoaderCircle } from "react-icons/lu";
import styles from "./product-experience.module.css";

const IMAGE_FRAME_CLASS = "aspect-square";

export function ProductCardSkeleton() {
  return (
    <div
      data-product-card="skeleton"
      aria-hidden="true"
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white animate-pulse"
    >
      <div className={`${IMAGE_FRAME_CLASS} shrink-0 bg-zinc-100`} />
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="space-y-2">
          <div className="h-2.5 w-1/3 rounded-full bg-zinc-100" />
          <div className="h-3.5 w-full rounded-full bg-zinc-100" />
          <div className="h-3.5 w-2/3 rounded-full bg-zinc-100" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 pt-1">
          <div className="h-4 w-16 rounded-full bg-zinc-100" />
          <div className="h-8 w-12 rounded-lg bg-zinc-100 sm:w-16" />
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  slug,
  category,
  brand,
  vendor,
  badge,
  variantId,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { isAuthenticated, setShowAuthModal } = useAuth();

  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addingRef = useRef(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);
  const [imageError, setImageError] = useState(false);
  const displayBadge = badge?.trim();
  const isDiscountBadge = displayBadge
    ? /^(?:save\s*)?-?\d+(?:\.\d+)?\s*%(?:\s*(?:off|discount))?$/i.test(displayBadge)
    : false;

  const inWishlist = !!id && isInWishlist(id);
  const priceNum = useMemo(() => parseFloat(price.replace(/[^0-9.-]/g, "")) || 0, [price]);
  const originalPriceNum = useMemo(
    () => (originalPrice ? parseFloat(originalPrice.replace(/[^0-9.-]/g, "")) || 0 : 0),
    [originalPrice]
  );
  const hasDiscount = originalPriceNum > priceNum && priceNum > 0;
  const discountPercent = useMemo(() => {
    if (hasDiscount) {
      return Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
    }
    return 0;
  }, [hasDiscount, originalPriceNum, priceNum]);

  const resolvedImage = useMemo(() => {
    if (imageError || !image) {
      return getProductFallbackImage(name, category);
    }
    return image;
  }, [image, imageError, name, category]);

  const wishlistProduct: WishlistProduct = {
    id: id ?? "",
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    price: priceNum,
    image: resolvedImage,
    color: "",
    size: "",
    category: category || "",
    team: brand || vendor || "",
    variantId,
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingRef.current) return;
    addingRef.current = true;
    setIsAdding(true);

    try {
      await addItem(
        {
          id: id || slug || name,
          productId: id,
          slug: slug || id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name,
          price: priceNum,
          image: resolvedImage,
          color: "",
          size: "",
          variantId,
          quantity: 1,
        },
        { silent: true }
      );

      setIsAdded(true);
      if (addedTimer.current) clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setIsAdded(false), 1600);
    } catch {
      // Cart provider handles errors
    } finally {
      addingRef.current = false;
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    toggleWishlist(wishlistProduct);
    if (!inWishlist) {
      toast.success(`Saved to wishlist!`);
    } else {
      toast.info(`Removed from wishlist`);
    }
  };

  const isVariantProduct = useMemo(() => {
    const cat = (category || "").toLowerCase();
    const n = name.toLowerCase();
    return (
      cat.includes("cloth") ||
      cat.includes("fashion") ||
      cat.includes("perfume") ||
      n.includes("dates") ||
      n.includes("soap") ||
      n.includes("tang") ||
      n.includes("shampoo") ||
      n.includes("pack") ||
      n.includes("combo")
    );
  }, [category, name]);

  const productUrl = `/products/${slug || id || ""}`;

  return (
    <article
      data-product-card="product"
      className={`${styles.card} group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white transition-all duration-300 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Product Image Frame */}
      <div className={`${IMAGE_FRAME_CLASS} relative w-full shrink-0 overflow-hidden bg-gradient-to-b from-zinc-50/70 to-zinc-100/30`}>
        <Link href={productUrl} aria-label={`View ${name}`} className="relative block h-full w-full">
          <Image
            src={resolvedImage}
            alt={name}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 20vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized={resolvedImage.includes("unsplash.com")}
          />
        </Link>

        {/* Discount & Highlight Badges */}
        {hasDiscount || isDiscountBadge ? (
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
            <span className="inline-flex items-center rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold tracking-tight text-white shadow-xs sm:text-[11px]">
              {isDiscountBadge ? displayBadge : `-${discountPercent}%`}
            </span>
            {displayBadge && !isDiscountBadge && (
              <span className="max-w-[120px] truncate rounded-full bg-white/95 text-zinc-700 border border-zinc-200/80 px-2 py-0.5 text-[9.5px] font-medium shadow-2xs backdrop-blur-xs">
                {displayBadge}
              </span>
            )}
          </div>
        ) : displayBadge ? (
          <span className="absolute left-2.5 top-2.5 z-10 max-w-[calc(100%-3.75rem)] truncate rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs sm:text-[11px]">
            {displayBadge}
          </span>
        ) : null}

        {/* Floating Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={inWishlist}
          className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border border-zinc-200/80 bg-white/90 backdrop-blur-xs shadow-2xs transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 cursor-pointer"
        >
          <LuHeart
            className={`h-4 w-4 transition-colors ${
              inWishlist ? "fill-rose-500 text-rose-500" : "text-zinc-400"
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Product Content Body */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-3.5">
        <div>
          {category && (
            <span className="mb-1 block truncate text-[10.5px] font-medium uppercase tracking-wider text-zinc-400 sm:text-[11px]">
              {category}
            </span>
          )}

          <Link
            href={productUrl}
            title={name}
            className={`${styles.cardLink} block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500`}
          >
            <h3 className="line-clamp-2 text-[13px] font-medium leading-[1.35] text-zinc-800 transition-colors duration-200 group-hover:text-rose-600 sm:text-[14px]">
              {name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-100 pt-2.5">
          <div className="min-w-0 tabular-nums">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="text-sm font-bold text-rose-600 sm:text-[16px] [overflow-wrap:anywhere]">
                {price}
              </span>
              {originalPrice && (hasDiscount || originalPrice !== price) && (
                <span className="text-[11px] font-normal text-zinc-400 line-through sm:text-xs">
                  {originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action CTA Button */}
          {isVariantProduct ? (
            <Link
              href={productUrl}
              aria-label={`Choose options for ${name}`}
              title="Choose options"
              className="relative z-10 shrink-0 inline-flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <LuShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline text-[11px]">Options</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-busy={isAdding}
              aria-label={isAdded ? `${name} added to bag` : `Add ${name} to bag`}
              title={isAdded ? "Added to bag" : "Add to bag"}
              className={`relative z-10 shrink-0 inline-flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-2xs ${
                isAdded
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600"
              }`}
            >
              {isAdding ? (
                <LuLoaderCircle className={`${styles.spinner} h-3.5 w-3.5`} aria-hidden="true" />
              ) : isAdded ? (
                <>
                  <LuCheck className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  <span className="hidden sm:inline text-[11px] text-white">Added</span>
                </>
              ) : (
                <>
                  <LuShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline text-[11px]">Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
