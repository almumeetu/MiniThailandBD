import type { Metadata } from "next";
import BlogArticles from "@/components/sections/blog-articles";
import PageBanner from "@/components/ui/page-banner";
import { fetchShopNews } from "@/lib/shop-api";

export const metadata: Metadata = {
  title: "Blog and Buying Guides | MiniThailandBD",
  description: "Practical advice on shopping, choosing products and everyday living from MiniThailandBD.",
};

export default async function BlogPage() {
  const articles = await fetchShopNews();
  return (
    <main className="min-h-[60vh] bg-store-page pb-12 sm:pb-16">
      <PageBanner
        title="Journal & Stories"
        subtitle="Practical advice on shopping, choosing products and everyday living from MiniThailandBD."
        breadcrumbs={[{ label: "Blog" }]}
      />
      <div className="py-6 sm:py-10">
        <BlogArticles variant="page" initialArticles={articles} />
      </div>
    </main>
  );
}
