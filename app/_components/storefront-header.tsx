import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import MobileMenu from "@/components/mobile-menu";

export default function StorefrontHeader() {
  return (
    <>
      <section className="bg-[#c0185a] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        🛍️ Bangladesh&apos;s Premier Thai Fashion Store — Free delivery on orders above ৳999
      </section>

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-8">
          {/* Left: Mobile Menu + Desktop Shop Link */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <MobileMenu />
            </div>

            {/* Desktop Shop Link */}
            <div className="hidden lg:flex">
              <Link
                href="/products"
                className="text-sm font-semibold uppercase tracking-[0.08em] text-black hover:text-[#c0185a] transition-colors"
              >
                Shop
              </Link>
            </div>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="mx-auto lg:mx-0" aria-label="MiniThailandBD home">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#c0185a]">
                <Image
                  src="/products/logo.jpg"
                  alt="MiniThailandBD"
                  fill
                  priority
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="hidden text-xl font-extrabold tracking-tight sm:inline-flex">
                <span className="text-[#c0185a]">Mini</span>
                <span className="text-[#e8a020]">Thailand</span>
                <span className="text-neutral-700">BD</span>
              </span>
            </div>
          </Link>

          {/* Right: Search + User Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Desktop Only */}
            <Link
              href="/products"
              className="hidden min-w-[220px] items-center gap-2 border-b border-[#c0185a] pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] xl:flex"
            >
              <FiSearch className="text-sm" />
              <span>Search products...</span>
            </Link>

            {/* User Action Icons */}
            <div className="flex items-center gap-4 text-lg text-black sm:gap-5">
              <Link href="/profile" aria-label="Profile" className="hover:text-[#c0185a] transition-colors">
                <FiUser />
              </Link>
              <Link href="/wishlist" aria-label="Wishlist" className="hover:text-[#c0185a] transition-colors">
                <FiHeart />
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative hover:text-[#c0185a] transition-colors">
                <FiShoppingBag />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#c0185a] text-[10px] font-bold text-white">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="border-t border-neutral-100 px-4 py-2 xl:hidden">
          <Link
            href="/products"
            className="mx-auto flex max-w-[520px] items-center gap-2 border-b border-[#c0185a] pb-1 text-[11px] uppercase tracking-[0.08em] text-neutral-500"
          >
            <FiSearch className="text-sm" />
            <span>Search fashion, skincare, perfumes...</span>
          </Link>
        </div>
      </header>
    </>
  );
}
