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
    <div data-product-card="skeleton" aria-hidden="true" className="flex h-full w-full flex-col overflow-hidden rounded-[3px] border border-zinc-200 bg-white animate-pulse">
      <div className={`${IMAGE_FRAME_CLASS} shrink-0 border-b border-store-surface bg-zinc-100`} />
      <div className="p-2.5 sm:p-3.5">
        <div className="flex h-10 flex-col gap-2">
          <div className="h-3 w-full rounded bg-zinc-100" />
          <div className="h-3 w-3/4 rounded bg-zinc-100" />
        </div>
        <div className="mt-3 flex min-h-8 items-center justify-between gap-2">
          <div className="h-4 w-16 rounded bg-zinc-100" />
          <div className="h-7 w-7 rounded-[3px] bg-zinc-100 sm:h-8 sm:w-8" />
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
    // Products with options open their details before adding to the bag.
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
      className={`${styles.card} group relative flex h-full w-full flex-col overflow-hidden rounded-[3px] border border-zinc-200 bg-white transition-colors duration-200 hover:border-zinc-300`}
    >
      <div className={`${IMAGE_FRAME_CLASS} relative w-full shrink-0 overflow-hidden border-b border-store-surface bg-store-page`}>
        <Link href={productUrl} aria-label={`View ${name}`} className="relative block h-full w-full">
          <Image
            src={resolvedImage}
            alt={name}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 25vw, 20vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized={resolvedImage.includes("unsplash.com")}
          />
        </Link>
        {/* Badges: Discount & Other highlights */}
        {(hasDiscount || isDiscountBadge) ? (
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1">
            <span className="inline-flex items-center rounded-[3px] bg-store-primary px-2 py-0.5 text-[10px] font-semibold tracking-tight text-white shadow-2xs sm:text-[10.5px]">
              {isDiscountBadge ? displayBadge : `-${discountPercent}%`}
            </span>
            {displayBadge && !isDiscountBadge && (
              <span className="max-w-[120px] truncate rounded-[3px] bg-white/95 text-store-ink border border-zinc-200 px-2 py-0.5 text-[9.5px] font-medium shadow-2xs">
                {displayBadge}
              </span>
            )}
          </div>
        ) : displayBadge ? (
          <span className="absolute left-2.5 top-2.5 z-10 max-w-[calc(100%-3.75rem)] truncate rounded-[3px] bg-store-primary px-2 py-0.5 text-[10px] font-semibold text-white shadow-2xs sm:text-[10.5px]">
            {displayBadge}
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={inWishlist}
          className="absolute right-1.5 top-1.5 z-10 grid h-10 w-10 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-accent"
        >
          <span className={`grid h-8 w-8 place-items-center rounded-full border transition-colors sm:h-9 sm:w-9 ${
            inWishlist
              ? "border-rose-100 bg-rose-50 text-rose-500"
              : "border-zinc-200/80 bg-white/95 text-zinc-400 hover:border-rose-100 hover:text-rose-500"
          }`}>
            <LuHeart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-3.5">
        <Link href={productUrl} title={name} className={`${styles.cardLink} block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-accent`}>
          <h3 className="h-10 line-clamp-2 break-words text-[13px] font-medium leading-5 text-zinc-800 transition-colors hover:text-store-accent sm:text-sm">
            {name}
          </h3>
        </Link>

        <div className="mt-auto flex min-h-8 items-center justify-between gap-1 pt-2 sm:gap-1.5 sm:pt-2.5">
          <div className="min-w-0 tabular-nums">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="text-sm font-semibold leading-5 text-store-price sm:text-base [overflow-wrap:anywhere]">
                {price}
              </span>
              {originalPrice && (hasDiscount || originalPrice !== price) && (
                <span className="text-[11px] font-normal text-zinc-400 line-through sm:text-xs">
                  {originalPrice}
                </span>
              )}
            </div>
          </div>
          {isVariantProduct ? (
            <Link
              href={productUrl}
              aria-label={`Choose options for ${name}`}
              title="Choose options"
              className="relative z-10 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-accent"
            >
              <span className="grid h-7 w-7 place-items-center rounded-[3px] border border-store-primary bg-white text-store-primary transition-colors hover:bg-store-primary hover:text-white sm:h-8 sm:w-8">
                <LuShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-busy={isAdding}
              aria-label={isAdded ? `${name} added to bag` : `Add ${name} to bag`}
              title={isAdded ? "Added to bag" : "Add to bag"}
              className="relative z-10 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-accent disabled:opacity-60 cursor-pointer"
            >
              <span className={`grid h-7 w-7 place-items-center rounded-[3px] border transition-colors sm:h-8 sm:w-8 ${
                isAdded
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-store-primary bg-store-primary text-white hover:border-store-hover hover:bg-store-hover"
              }`}>
                {isAdding ? <LuLoaderCircle className={`${styles.spinner} h-3.5 w-3.5 sm:h-4 sm:w-4`} aria-hidden="true" /> : isAdded ? <LuCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" /> : <LuShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
