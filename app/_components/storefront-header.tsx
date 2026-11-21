import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import humanaLogo from "../../references/logo.png";
import MobileMenu from "@/components/mobile-menu";

export default function StorefrontHeader() {
  return (
    <>
      <section className="bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        Join our community and get 10% off every piece
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
                className="text-sm font-semibold uppercase tracking-[0.08em] text-black hover:text-neutral-600 transition-colors"
              >
                Shop
              </Link>
            </div>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="mx-auto lg:mx-0" aria-label="NovaMart home">
            <Image
              src={humanaLogo}
              alt="NovaMart"
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          {/* Right: Search + User Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Desktop Only */}
            <Link
              href="/products"
              className="hidden min-w-[220px] items-center gap-2 border-b border-black pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] xl:flex"
            >
              <FiSearch className="text-sm" />
              <span>Football jerseys</span>
            </Link>

            {/* User Action Icons - Always Visible on Right */}
            <div className="flex items-center gap-4 text-lg text-black sm:gap-5">
              <Link href="/profile" aria-label="Profile" className="hover:text-neutral-600 transition-colors">
                <FiUser />
              </Link>
              <Link href="/wishlist" aria-label="Wishlist" className="hover:text-neutral-600 transition-colors">
                <FiHeart />
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative hover:text-neutral-600 transition-colors">
                <FiShoppingBag />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="border-t border-neutral-200 px-4 py-2 xl:hidden">
          <Link
            href="/products"
            className="mx-auto flex max-w-[520px] items-center gap-2 border-b border-black pb-1 text-[11px] uppercase tracking-[0.08em]"
          >
            <FiSearch className="text-sm" />
            <span>Football jerseys</span>
          </Link>
        </div>
      </header>
    </>
  );
}
