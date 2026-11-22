"use client";

import { useState, useEffect, Suspense } from "react";
import AarongHeroSlider from "@/components/aarong/aarong-hero-slider";
import AarongCategoryGrid from "@/components/aarong/aarong-category-grid";
import AarongWhatsNew from "@/components/aarong/aarong-whats-new";
import WatchAndShop, { WatchAndShopSkeleton } from "@/components/sections/watch-and-shop";
import AarongFeatureBanner from "@/components/aarong/aarong-feature-banner";
import AarongSplitBanners from "@/components/aarong/aarong-split-banners";
import ChatTestimonials from "@/components/sections/chat-testimonials";
import {
  fetchShopProducts,
  fetchShopCategories,
  type ShopProduct,
  type ShopCategory,
  DEFAULT_NOVAMART_CATEGORIES,
} from "@/lib/shop-api";

export default function Home() {
  const [categories, setCategories] = useState<ShopCategory[]>(DEFAULT_NOVAMART_CATEGORIES);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchShopCategories(),
          fetchShopProducts({ page: 1, limit: 30 }),
        ]);

        if (cats && cats.length > 0) {
          setCategories(cats);
        }
        if (prods && prods.data && prods.data.length > 0) {
          setProducts(prods.data);
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className="w-full min-h-screen bg-white font-sans text-zinc-900 pb-0">
      {/* 1. Full-Width Hero Slider */}
      <AarongHeroSlider />

      {/* 2. 8 Categories in 2x4 Grid with clean white label strips below */}
      <AarongCategoryGrid categories={categories} loading={loading} />

      {/* 3. "WHAT'S NEW" Product Slider with portrait cards, "+" quick-add & pagination */}
      <AarongWhatsNew products={products} loading={loading} />

      {/* 4. Full-Width Feature Campaign Banner ("Mini Thailand Essentials") */}
      <AarongFeatureBanner />

      {/* 5. Customer Testimonials & Reviews */}
      <ChatTestimonials />

      {/* 6. Watch & Shop - Clean Modern Reels & Stories Showcase */}
      <Suspense fallback={<WatchAndShopSkeleton />}>
        <WatchAndShop />
      </Suspense>

      {/* 7. 2-Column Split Editorial Banners ("Royal Party Gowns" & "Festive Cord Sets" - Bottom Campaign) */}
      <AarongSplitBanners />
    </main>
  );
}
