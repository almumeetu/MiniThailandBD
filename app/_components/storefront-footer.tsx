import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";

const footerGroups = [
  {
    title: "Customer Service",
    links: [
      { label: "FAQ", href: "#" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Shipping & Delivery", href: "/delivery" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Login", href: "/login" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Who We Are",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Corporate Orders", href: "/corporate-order" },
    ],
  },
  {
    title: "More Information",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Delivery Policy", href: "/delivery" },
      { label: "Returns Policy", href: "/returns" },
      { label: "Offers & Deals", href: "/offers" },
    ],
  },
];

export default function StorefrontFooter() {
  return (
    <footer className="bg-[#180816] text-zinc-300 border-t border-rose-950/40 px-4 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        {/* Brand strip */}
        <div className="mb-10 flex flex-col items-start gap-3 border-b border-white/10 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">
              <span className="text-[#c0185a]">Mini</span>
              <span className="text-[#e8a020]">Thailand</span>
              <span className="text-white">BD</span>
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-400">
              Bangladesh&apos;s premier boutique destination for authentic Thai cord sets, luxury party gowns, Dubai-style abayas, and winter velvet collections.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://www.facebook.com/minithailand2022/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:opacity-80"
              aria-label="Facebook"
            >
              <FaFacebookF className="text-sm" />
            </Link>
            <Link
              href="https://wa.me/8801706126663"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:opacity-80"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="text-base" />
            </Link>
            <Link
              href="https://www.instagram.com/mini_thailand123"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white transition hover:opacity-80"
              aria-label="Instagram"
            >
              <FaInstagram className="text-base" />
            </Link>
            <Link
              href="https://www.youtube.com/@MiniThailand-pk5rs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white transition hover:opacity-80"
              aria-label="YouTube"
            >
              <FaYoutube className="text-base" />
            </Link>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.2fr_1fr]">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#e8a020]">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-zinc-400 transition hover:text-[#e8a020]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#e8a020]">
              Contact Us
            </h2>
            <ul className="mt-5 space-y-2 text-sm text-zinc-400">
              <li>📞 +880 1706-126663</li>
              <li>📞 01706126663</li>
              <li>
                <Link
                  href="https://www.facebook.com/minithailand2022/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-300 hover:underline"
                >
                  facebook.com/minithailand2022
                </Link>
              </li>
            </ul>

            <h2 className="mt-8 text-sm font-bold uppercase tracking-[0.08em] text-[#e8a020]">
              Payment Methods
            </h2>
            <div className="mt-4 rounded-xl bg-white/95 p-2 inline-block">
              <Image
                src="/images/payment/all-payment.jpg"
                alt="Payment methods — bKash, Nagad, Visa, Mastercard"
                width={280}
                height={40}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs font-medium text-zinc-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-bold text-[#c0185a]">MiniThailandBD</span>
          {" "}| All Rights Reserved. Bangladesh&apos;s Premier Thai Fashion &amp; Lifestyle Store.
        </div>
      </div>
    </footer>
  );
}
