"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import { useCurrency } from "@/lib/currency-context";
import { getProductFallbackImage } from "@/lib/admin-api";
import type { ShopProduct } from "@/lib/shop-api";
import styles from "./storefront-style-rail.module.css";
import StyleRail3D from "./style-rail-3d";
import { useCarouselAutoplay } from "@/app/_hooks/use-carousel-autoplay";
import CarouselPlayback from "@/components/ui/carousel-playback";

interface StorefrontStyleRailProps {
  products: ShopProduct[];
}

function circularOffset(index: number, selected: number, count: number) {
  const distance = (index - selected + count) % count;
  return distance > count / 2 ? distance - count : distance;
}

export default function StorefrontStyleRail({ products }: StorefrontStyleRailProps) {
  const [selection, setSelection] = useState({ index: 0, previous: 0 });
  const touchStartX = useRef<number | null>(null);
  const suppressTouchClick = useRef(false);
  const selectedIndex = products.length ? selection.index % products.length : 0;
  const [detailProduct, setDetailProduct] = useState<ShopProduct | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const { formatCurrency } = useCurrency();
  const selectedProduct = products[selectedIndex];
  const showroomRef = useRef<HTMLDivElement>(null);
  const playback = useCarouselAutoplay(showroomRef, () => {
    setSelection(current => ({ previous: current.index % products.length, index: (current.index + 1) % products.length }));
  }, { enabled: products.length > 1 && !detailProduct });


  useEffect(() => {
    if (!detailProduct) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailProduct(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [detailProduct]);

  if (!selectedProduct || products.length === 0) return null;

  const moveSelection = (direction: -1 | 1) => {
    setSelection((current) => ({
      previous: current.index % products.length,
      index: (current.index + direction + products.length) % products.length,
    }));
  };

  const getProductImage = (product: ShopProduct) => {
    if (failedImages.has(product.id) || !product.image) {
      return getProductFallbackImage(product.name, product.category);
    }
    return product.image;
  };

  const markImageAsFailed = (productId: string) => {
    setFailedImages((current) => {
      if (current.has(productId)) return current;
      const next = new Set(current);
      next.add(productId);
      return next;
    });
  };

  const visibleItems = products.map((product, index) => {
    const offset = circularOffset(index, selectedIndex, products.length);
    const previousOffset = circularOffset(index, selection.previous % products.length, products.length);
    const distance = Math.abs(offset);
    const outside = distance > 3;
    return {
      product,
      index,
      offset,
      outside,
      wrapped: Math.abs(offset - previousOffset) > products.length / 2,
      style: {
        "--offset": offset,
        "--depth": `${90 - distance * 100}px`,
        "--yaw": `${offset === 0 ? 0 : -Math.sign(offset) * (48 + distance * 5)}deg`,
        opacity: outside ? 0 : distance === 0 ? 1 : 0.96 - distance * 0.1,
        zIndex: 10 - distance,
      } as CSSProperties,
    };
  });
  const detailImage = detailProduct ? getProductImage(detailProduct) : "";

  return (
    <>
      <section
        aria-labelledby="storefront-style-rail-title"
        aria-roledescription="carousel"
        className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            moveSelection(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
          suppressTouchClick.current = false;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const distance = event.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(distance) > 45) {
            suppressTouchClick.current = true;
            moveSelection(distance < 0 ? 1 : -1);
          }
        }}
        onTouchCancel={() => { touchStartX.current = null; }}
      >
        <header className={styles.editorialHeader}>
          <h2 id="storefront-style-rail-title" className="store-section-title">The Style Edit</h2>
          <Link href="/products?category=Clothing%20%26%20Fashion" className="text-sm font-medium text-store-primary hover:underline">View all</Link>
        </header>
        <div ref={showroomRef} className={`${styles.showroom} ${sceneReady ? styles.rendered : ""}`}>
          <StyleRail3D
            products={products}
            selectedIndex={selectedIndex}
            onReady={setSceneReady}
            onPick={(index) => {
              if (index === selectedIndex) setDetailProduct(products[index]);
              else setSelection({ previous: selectedIndex, index });
            }}
          />
          <div className={styles.rail} aria-hidden="true" />

          <div className={styles.scene}>
            {visibleItems.map(({ product, index, offset, outside, wrapped, style }) => (
              <button
                key={product.id}
                type="button"
                aria-label={offset === 0 ? `View ${product.name}` : `Show ${product.name}`}
                aria-pressed={offset === 0}
                aria-hidden={outside || undefined}
                tabIndex={outside ? -1 : 0}
                className={`${styles.railItem} ${outside ? styles.outside : ""} ${wrapped ? styles.teleport : ""}`}
                style={style}
                onClick={() => {
                  if (suppressTouchClick.current) {
                    suppressTouchClick.current = false;
                    return;
                  }
                  if (offset === 0) setDetailProduct(product);
                  else setSelection({ previous: selectedIndex, index });
                }}
              >
                <svg className={styles.hanger} viewBox="0 0 260 80" fill="none" aria-hidden="true">
                  <path d="M130 32V19C130 15 138 15 138 9C138 -1 124 -2 124 8" stroke="#8a8983" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M130 32L31 68Q27 72 35 73H225Q233 72 229 68L130 32Z M130 39L216 68H44L130 39Z" fill="var(--color-store-primary, #174a76)" fillRule="evenodd" stroke="var(--color-store-deep, #142638)" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M38 68L130 36L222 68" stroke="#7fa8c8" strokeWidth=".8" strokeOpacity=".5" />
                </svg>
                <span className={styles.garment} style={{ animationDelay: `${index * -0.53}s` }}>
                  <Image
                    src={getProductImage(product)}
                    alt=""
                    fill
                    sizes="(max-width: 639px) 185px, (max-width: 1023px) 230px, 280px"
                    unoptimized={getProductImage(product).includes("unsplash.com")}
                    onError={() => markImageAsFailed(product.id)}
                    className={styles.productImage}
                  />
                </span>
              </button>
            ))}
          </div>

          <div className={styles.productControls}>
            <div key={selectedProduct.id} className={styles.caption} aria-live={playback.isPlaying ? "off" : "polite"} aria-atomic="true">
              <p className={styles.productName}>{selectedProduct.name}</p>
              <p className={styles.productPrice}>{formatCurrency(selectedProduct.price)}</p>
            </div>
            <div className={styles.actions}>
              {products.length > 1 && <CarouselPlayback playback={playback} label="Style Edit" />}
              <button type="button" onClick={() => moveSelection(-1)} aria-label="Previous style" className={styles.arrow} disabled={products.length < 2}>
                <LuChevronLeft aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setDetailProduct(selectedProduct)} className={styles.viewButton}>View piece</button>
              <button type="button" onClick={() => moveSelection(1)} aria-label="Next style" className={styles.arrow} disabled={products.length < 2}>
                <LuChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {detailProduct && (
        <div
          className={`${styles.modalBackdrop} fixed inset-0 z-[80] grid place-items-center bg-[#15130f]/55 px-4 py-6 backdrop-blur-[2px]`}
          onClick={() => setDetailProduct(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="style-detail-title"
            className={`${styles.modalPanel} relative grid max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[3px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:grid-cols-2`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative min-h-[260px] overflow-hidden bg-[#f2efea] sm:min-h-[470px]">
              <Image
                src={detailImage}
                alt={detailProduct.name}
                fill
                sizes="(max-width: 639px) 100vw, 50vw"
                unoptimized={detailImage.includes("unsplash.com")}
                onError={() => markImageAsFailed(detailProduct.id)}
                className="object-contain p-8 mix-blend-multiply sm:p-12"
              />
            </div>
            <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                aria-label="Close product details"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[#6d675f] transition-colors hover:bg-[#f3f1ed] hover:text-[#25221e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary"
              >
                <LuX className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#897f72]">
                {detailProduct.category || "The Style Edit"}
              </p>
              <h3 id="style-detail-title" className="mt-3 max-w-sm font-serif text-2xl leading-tight text-[#24211d] sm:text-3xl">
                {detailProduct.name}
              </h3>
              {detailProduct.team && <p className="mt-3 text-sm text-[#766e64]">{detailProduct.team}</p>}
              <p className="mt-5 text-lg font-medium text-[#24211d]">{formatCurrency(detailProduct.price)}</p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#766e64]">
                Explore this piece and see its full product details and available options.
              </p>
              <Link
                href={`/products/${detailProduct.slug || detailProduct.id}`}
                onClick={() => setDetailProduct(null)}
                className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#171512] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#3b352e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary sm:w-fit sm:min-w-[190px]"
              >
                Shop this piece
                <LuChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
