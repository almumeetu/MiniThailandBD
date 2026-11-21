import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import MobileMenu from "@/components/mobile-menu";

const NAV_LINKS = [
  { label: "Shop All", href: "/products" },
  { label: "Cord Sets", href: "/products?category=Cord%20Sets" },
  { label: "Party Gowns", href: "/products?category=Party%20Gowns" },
  { label: "Luxury Abayas", href: "/products?category=Luxury%20Abayas" },
  { label: "Velvet Edit", href: "/products?category=Velvet%20Collection" },
  { label: "Winter Wear", href: "/products?category=Winter%20Collection" },
  { label: "Offers", href: "/offers", badge: "Sale" },
];

export default function StorefrontHeader() {
  return (
    <>
      {/* Top Announcement Bar */}
      <section className="bg-[#c0185a] px-4 py-2 text-center text-[10.5px] font-semibold tracking-wide text-white">
        <span className="hidden sm:inline">✨ </span>
        <span>Mini Thailand — Premier Bangkok Fashion, Velvet Gowns &amp; Luxury Abayas</span>
        <span className="mx-2 hidden sm:inline">•</span>
        <span className="hidden sm:inline">Cash on Delivery Nationwide</span>
        <span className="mx-2 hidden sm:inline">•</span>
        <span className="font-bold underline decoration-rose-300">Hotline: 01722-301927</span>
      </section>

      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10 lg:px-16">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <MobileMenu />
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5" aria-label="Mini Thailand home">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-full border-2 border-[#c0185a] shadow-xs shrink-0">
                <Image
                  src="/products/logo.jpg"
                  alt="Mini Thailand"
                  fill
                  priority
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                  <span className="text-[#c0185a]">Mini</span>
                  <span className="text-[#e8a020]">Thailand</span>
                </span>
                <span className="text-[9.5px] font-bold tracking-widest uppercase text-neutral-400">
                  Boutique Fashion
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-xs xl:text-[13px] font-bold uppercase tracking-[0.06em] text-neutral-800 hover:text-[#c0185a] transition-colors py-1 flex items-center gap-1.5"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-rose-100 text-[#c0185a] px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-normal">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Search + WhatsApp Quick Order + User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* WhatsApp Quick Order Button (Desktop) */}
            <a
              href="https://wa.me/8801722301927?text=Hello%20Mini%20Thailand,%20I%20want%20to%20order..."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Chat with boutique stylist"
            >
              <FaWhatsapp className="h-3.5 w-3.5 text-emerald-600" />
              <span>01722-301927</span>
            </a>

            {/* Desktop Search Link */}
            <Link
              href="/products"
              className="hidden min-w-[180px] xl:min-w-[210px] items-center gap-2 border-b border-[#c0185a] pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 hover:text-[#c0185a] transition-colors md:flex"
            >
              <FiSearch className="text-sm text-[#c0185a]" />
              <span className="truncate">Search fashion...</span>
            </Link>

            {/* User Action Icons */}
            <div className="flex items-center gap-3.5 sm:gap-4 text-lg text-neutral-800">
              <Link
                href="/products"
                aria-label="Search"
                className="md:hidden hover:text-[#c0185a] transition-colors"
              >
                <FiSearch />
              </Link>
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
        <div className="border-t border-neutral-100 px-4 py-2 md:hidden bg-neutral-50/60">
          <Link
            href="/products"
            className="mx-auto flex max-w-[520px] items-center gap-2 rounded-lg bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 shadow-2xs"
          >
            <FiSearch className="text-sm text-[#c0185a]" />
            <span>Search cord sets, gowns, abayas, velvet...</span>
          </Link>
        </div>
      </header>
    </>
  );
}
