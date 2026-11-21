import Link from "next/link";
import Logo from "@/components/ui/logo";
import { HiMail, HiPhone } from "react-icons/hi";
import { IoLocationOutline } from "react-icons/io5";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import {
  fetchShopSettings,
  fetchShopCategories,
  parseContactEntries,
  type ShopCategory,
} from "@/lib/shop-api";

function normalizeExternalUrl(url?: string | null): string {
  if (!url || !url.trim() || url === "#") return "#";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default async function Mainfooter() {
  const [settings, categories] = await Promise.all([
    fetchShopSettings(),
    fetchShopCategories(),
  ]);

  const shopName = settings?.shopName?.trim() || "NovaMart";
  const rawContactEntries = parseContactEntries(settings?.contactNumber);
  const rawEmailEntries = parseContactEntries(settings?.email);

  const validContacts = rawContactEntries.filter(
    (contact) =>
      !contact.extra?.includes("NovaMart Team") &&
      !contact.title?.toLowerCase().includes("executive desk")
  );
  const displayedContacts =
    validContacts.length > 0
      ? validContacts
      : [{ title: "Hotline", value: "+880 1722-301927" }];

  const displayedEmails = rawEmailEntries.filter(
    (email) =>
      !email.value.toLowerCase().includes("support@webdevsoftware.com") &&
      !email.value.toLowerCase().includes("webdevsoftware")
  );
  const finalEmails =
    displayedEmails.length > 0
      ? displayedEmails
      : [{ title: "Email", value: "support@novamart.com.bd" }];

  const address =
    settings?.branchAddress?.trim() || "Uttara Sector-11, Dhaka, Bangladesh";

  const topCategories = (categories || []).filter(
    (category: ShopCategory) => !category.parentId
  );

  const shopByLinks =
    topCategories.length > 0
      ? topCategories.slice(0, 7).map((cat: ShopCategory) => ({
          label: cat.name,
          href: `/products?category=${encodeURIComponent(cat.slug || cat.name)}`,
        }))
      : [
          { label: "Skin Care & Beauty", href: "/products?category=skin-care" },
          { label: "Digital Electronics", href: "/products?category=digital-electronics" },
          { label: "Perfumes & Fragrances", href: "/products?category=perfume" },
          { label: "Clothing & Fashion", href: "/products?category=clothing" },
          { label: "Baby & Kids Products", href: "/products?category=baby-products" },
          { label: "Home & Living", href: "/products?category=home-living" },
          { label: "Watches & Accessories", href: "/products?category=watches-accessories" },
        ];

  const informationLinks = [
    { label: "About us", href: "/about" },
    { label: "Contact us", href: "/contact" },
    { label: "Company Information", href: "/about" },
    { label: `${shopName} Stories`, href: "/blog" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Careers", href: "/contact" },
  ];

  const supportLinks = [
    { label: "Support Center", href: "/contact" },
    { label: "How to Order", href: "/terms" },
    { label: "Order Tracking", href: "/profile?tab=track" },
    { label: "Payment Methods", href: "/terms" },
    { label: "Shipping & Delivery", href: "/delivery" },
    { label: "FAQ & Help Center", href: "/terms" },
    { label: "Feedback & Reviews", href: "/contact" },
  ];

  const consumerPolicyLinks = [
    { label: "Happy Return", href: "/returns" },
    { label: "Refund Policy", href: "/returns" },
    { label: "Exchange Policy", href: "/returns" },
    { label: "Cancellation", href: "/terms" },
    { label: "Pre-Order Policy", href: "/products" },
    { label: "Extra Discount Policy", href: "/products" },
    { label: "Security & Fraud Alert", href: "/privacy" },
  ];

  const socialLinks = [
    {
      Icon: FaFacebookF,
      label: "Facebook",
      href: settings?.socialContact?.facebook ? normalizeExternalUrl(settings.socialContact.facebook) : null,
    },
    {
      Icon: FaXTwitter,
      label: "Twitter/X",
      href: settings?.socialContact?.twitter ? normalizeExternalUrl(settings.socialContact.twitter) : null,
    },
    {
      Icon: FaInstagram,
      label: "Instagram",
      href: settings?.socialContact?.instagram ? normalizeExternalUrl(settings.socialContact.instagram) : null,
    },
    {
      Icon: FaYoutube,
      label: "YouTube",
      href: settings?.socialContact?.youtube ? normalizeExternalUrl(settings.socialContact.youtube) : null,
    },
  ].filter((item): item is { Icon: any; label: string; href: string } => Boolean(item.href));

  const primaryPhone = displayedContacts[0]?.value || "+880 1722-301927";
  const primaryEmail = finalEmails[0]?.value || "support@novamart.com.bd";

  return (
    <footer className="w-full bg-white font-sans text-zinc-700 border-t border-zinc-200">
      <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Column 1: Brand Info, Contacts, Social & Mobile App Download */}
          <div className="min-w-0 lg:col-span-4 space-y-3">
            <Logo variant="dark" size="md" />

            <p className="max-w-sm text-sm sm:text-[14.5px] leading-relaxed text-zinc-600 font-normal">
              {shopName} is an e-commerce platform dedicated to providing safe and reliable products to every home.
            </p>

            {/* Address & Primary Contact list (Clean, compact, non-duplicated) */}
            <div className="space-y-2 text-sm sm:text-[14px] text-zinc-700 font-medium">
              <div className="flex items-start gap-2.5">
                <IoLocationOutline className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
                <span className="leading-snug">{address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <HiPhone className="h-4 w-4 shrink-0 text-zinc-500" />
                <a
                  href={`tel:${primaryPhone.replace(/[^\d+]/g, "")}`}
                  className="hover:text-orange-600 transition-colors leading-snug"
                >
                  {primaryPhone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <HiMail className="h-4 w-4 shrink-0 text-zinc-500" />
                <a
                  href={`mailto:${primaryEmail}`}
                  className="hover:text-orange-600 transition-colors leading-snug"
                >
                  {primaryEmail}
                </a>
              </div>
            </div>

            {/* Social Icons (only rendered when social links are configured) */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 pt-0.5">
                {socialLinks.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200 shadow-2xs"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Information */}
          <div className="min-w-0 lg:col-span-2">
            <h3 className="text-sm sm:text-[15px] font-bold text-zinc-900 mb-3.5 tracking-tight">
              Information
            </h3>
            <ul className="space-y-3 text-sm sm:text-[14px]">
              {informationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-600 hover:text-orange-600 transition-colors block py-0.5 leading-normal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Shop By */}
          <div className="min-w-0 lg:col-span-2">
            <h3 className="text-sm sm:text-[15px] font-bold text-zinc-900 mb-3.5 tracking-tight">
              Shop By
            </h3>
            <ul className="space-y-3 text-sm sm:text-[14px]">
              {shopByLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-600 hover:text-orange-600 transition-colors block truncate py-0.5 leading-normal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="min-w-0 lg:col-span-2">
            <h3 className="text-sm sm:text-[15px] font-bold text-zinc-900 mb-3.5 tracking-tight">
              Support
            </h3>
            <ul className="space-y-3 text-sm sm:text-[14px]">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-600 hover:text-orange-600 transition-colors block py-0.5 leading-normal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Consumer Policy */}
          <div className="min-w-0 lg:col-span-2">
            <h3 className="text-sm sm:text-[15px] font-bold text-zinc-900 mb-3.5 tracking-tight">
              Consumer Policy
            </h3>
            <ul className="space-y-3 text-sm sm:text-[14px]">
              {consumerPolicyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-600 hover:text-orange-600 transition-colors block py-0.5 leading-normal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
