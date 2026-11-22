'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AarongProductCard, { AarongProductCardSkeleton } from '@/components/aarong/aarong-product-card';
import HorizontalScroller from './horizontal-scroller';
import { fetchShopProducts, type ShopProduct } from '@/lib/shop-api';

interface RelatedProductsProps {
  currentCategory?: string;
  currentProductId?: string;
}

export default function RelatedCarousel({
  currentCategory,
  currentProductId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetchShopProducts({
          limit: 20,
        });
        let filtered = (res.data || []).filter((p) => p.id !== currentProductId);
        if (currentCategory) {
          const catMatches = filtered.filter(
            (p) => (p.category || '').toLowerCase() === currentCategory.toLowerCase()
          );
          if (catMatches.length >= 4) {
            filtered = catMatches;
          }
        }
        setProducts(filtered.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch related products', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [currentCategory, currentProductId]);

  if (isLoading) {
    return (
      <section className="w-full bg-store-page py-10 sm:py-14 border-t border-zinc-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-between mb-6">
            <div className="w-44 h-7 bg-zinc-200 animate-pulse rounded-lg" />
            <div className="w-20 h-5 bg-zinc-200 animate-pulse rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <AarongProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-store-page py-10 sm:py-14 border-t border-zinc-200/80 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        <HorizontalScroller
          trackId="related-products-track"
          label="Related products"
          autoplayDelay={3500}
          heading={
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-[0.16em] text-zinc-950 uppercase font-sans">
              You may also like
            </h2>
          }
          action={<Link href="/products" className="text-xs sm:text-sm font-semibold tracking-wider text-[#ec1c67] hover:underline uppercase">View all</Link>}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[175px] shrink-0 snap-start sm:w-[210px] lg:w-[235px]">
              <AarongProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                slug={product.slug}
                category={product.category}
                badge={product.badge}
                variantId={product.variantId}
              />
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}
