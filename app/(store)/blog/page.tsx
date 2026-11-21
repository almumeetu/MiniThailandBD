import type { Metadata } from "next";
import BlogArticles from "@/components/sections/blog-articles";
import { fetchShopNews } from "@/lib/shop-api";

export const metadata: Metadata = {
  title: "Blog and Buying Guides | NovaMart",
  description: "Practical advice on shopping, choosing products and everyday living from NovaMart.",
};

export default async function BlogPage() {
  const articles = await fetchShopNews();
  return (
    <main className="min-h-[60vh] bg-store-page py-8 sm:py-12 lg:py-16">
      <BlogArticles variant="page" initialArticles={articles} />
    </main>
  );
}
