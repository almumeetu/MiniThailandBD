import type { Metadata } from "next";
import "./globals.css";
import "./mega-menu.css";
import "./slider-enhancements.css";

export const metadata: Metadata = {
  title: "MiniThailandBD | Bangladesh's Premier Fashion & Lifestyle Store",
  description: "MiniThailandBD — Bangladesh's premier online store for authentic skincare, digital electronics, luxury perfumes, fashion apparel, baby products, and home lifestyle essentials.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300..700;1,300..700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-neutral-900 antialiased selection:bg-store-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}

