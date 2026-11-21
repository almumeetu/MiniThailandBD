import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetails from "@/components/sections/product-details";
import { fetchShopProductBySlug } from "@/lib/shop-api";
import { resolveImageUrl } from "@/lib/admin-api";
import ProductPageLoading from "@/components/sections/ui/product-page-loading";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchShopProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | MiniThailandBD",
    };
  }

  const firstImg = product.media?.[0]?.media?.url
    ? resolveImageUrl(product.media[0].media.url)
    : undefined;

  return {
    title: `${product.metaTitle ?? product.name} | MiniThailandBD`,
    description:
      product.metaDescription ??
      product.shortDescription ??
      product.description ??
      `Explore ${product.name} and review available delivery details at checkout.`,
    keywords: product.metaKeywords ?? undefined,
    openGraph: {
      title: product.metaTitle ?? product.name,
      description:
        product.metaDescription ??
        product.shortDescription ??
        product.description ??
        undefined,
      images: firstImg ? [{ url: firstImg }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle ?? product.name,
      description:
        product.metaDescription ??
        product.shortDescription ??
        undefined,
      images: firstImg ? [firstImg] : undefined,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await fetchShopProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="min-w-0 flex flex-col min-h-screen bg-store-page">
      <Suspense fallback={<ProductPageLoading />}>
        <ProductDetails key={product.id} productId={product.id} initialProduct={product} />
      </Suspense>
    </div>
  );
}
