import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchPublicVideos, FALLBACK_VIDEOS } from "@/lib/video-api";
import VideosClientPage from "./videos-client";

export const metadata: Metadata = {
  title: "Watch & Shop Reels & Videos | MiniThailandBD",
  description:
    "Explore our trending Facebook reels, live streams, and fashion videos. Watch real outfit showcases and order directly on WhatsApp or online.",
  openGraph: {
    title: "Watch & Shop Reels & Videos | MiniThailandBD",
    description:
      "Explore our trending Facebook reels, live streams, and fashion videos. Watch real outfit showcases and order directly on WhatsApp or online.",
    url: "https://minithailandbd.com/videos",
    siteName: "MiniThailandBD",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "MiniThailandBD Reels & Videos Showcase",
      },
    ],
  },
};

export default async function VideosPage() {
  let initialVideos = FALLBACK_VIDEOS;
  try {
    const res = await fetchPublicVideos({ page: 1, limit: 24, sort: "featured" });
    if (res && res.data && res.data.length > 0) {
      initialVideos = res.data;
    }
  } catch {
    // fallback
  }

  // Generate VideoObject JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: initialVideos.map((video, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "VideoObject",
        name: video.title,
        description: video.caption || video.title,
        thumbnailUrl: [video.thumbnailUrl],
        uploadDate: video.createdAt,
        duration: `PT${video.durationSec || 45}S`,
        contentUrl: video.videoUrl || video.facebookUrl,
        embedUrl: video.facebookUrl
          ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.facebookUrl)}`
          : undefined,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-store-page animate-pulse" />}>
        <VideosClientPage initialVideos={initialVideos} />
      </Suspense>
    </>
  );
}
