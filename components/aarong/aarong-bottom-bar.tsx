"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: "https://www.facebook.com/minithailand2022/", label: "Facebook" },
  { icon: FaInstagram, href: "https://www.instagram.com/mini_thailand123", label: "Instagram" },
  { icon: FaYoutube, href: "https://www.youtube.com/@MiniThailand-pk5rs", label: "YouTube" },
  { icon: FaWhatsapp, href: "https://wa.me/8801706126663", label: "WhatsApp" },
];

export default function AarongBottomBar() {
  const currentYear = new Date().getFullYear();

  return (
    <footer aria-label="Footer Bottom" className="w-full bg-black text-zinc-400 py-6 sm:py-7 border-t border-white/10 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
          {/* Left: Brand Logo & Copyright notice */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 order-2 lg:order-1 text-center sm:text-left">
            <Logo variant="light" size="md" />
            <span className="hidden sm:inline-block h-4 w-px bg-white/20" />
            <span className="text-[11px] sm:text-xs text-zinc-400 tracking-wide">
              Copyright © {currentYear} Mini Thailand. All rights reserved.
            </span>
          </div>

          {/* Right: App store download badges & Social icons below them */}
          <div className="flex flex-col items-center gap-3 sm:gap-3.5 order-1 lg:order-2">
            {/* App store download badges */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
                className="inline-block transition-opacity hover:opacity-85"
              >
                <Image
                  src="/images/footer/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={125}
                  height={38}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </Link>

              <Link
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download on the App Store"
                className="inline-block transition-opacity hover:opacity-85"
              >
                <Image
                  src="/images/footer/app-store-badge.png"
                  alt="Download on the App Store"
                  width={125}
                  height={38}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Social icons placed directly underneath the store badges */}
            <div className="flex items-center gap-4 sm:gap-5">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="text-zinc-400 hover:text-[#ec1c67] transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Center: Policy Menu with theme color & smaller size */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-[11px] sm:text-[11.5px] font-medium text-[#ec1c67]">
          <Link href="/delivery" className="hover:text-white transition-colors duration-200">
            Shipping &amp; Delivery
          </Link>
          <span className="text-[#ec1c67]/40 select-none">•</span>
          <Link href="/returns" className="hover:text-white transition-colors duration-200">
            Return &amp; Refund Policy
          </Link>
          <span className="text-[#ec1c67]/40 select-none">•</span>
          <Link href="/terms" className="hover:text-white transition-colors duration-200">
            Terms &amp; Conditions
          </Link>
          <span className="text-[#ec1c67]/40 select-none">•</span>
          <Link href="/privacy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
