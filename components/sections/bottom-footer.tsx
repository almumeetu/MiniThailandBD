import Image from "next/image";
import { fetchShopSettings } from "@/lib/shop-api";

export default async function Bottomfooter() {
  const settings = await fetchShopSettings();

  const shopName = settings?.shopName?.trim() || "NovaMart";
  const copyrightYear = settings?.copyrightYear || new Date().getFullYear();

  return (
    <section className="w-full border-t border-zinc-200 bg-white py-4 sm:py-5 font-sans text-zinc-600">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
          {/* Left: Copyright notice */}
          <div className="text-xs sm:text-sm text-zinc-600 text-center md:text-left select-none font-medium">
            Copyright © {copyrightYear} {shopName}
          </div>

          {/* Right: Clean, high-resolution SSLCommerz payment gateway banner (Pay With, Cards, bKash, Nagad, Rocket)
              Sized at 56-58px height to perfectly match reference layout while keeping cards crisp and readable */}
          <div className="flex items-center justify-center md:justify-end md:pr-10 lg:pr-14">
            <Image
              src="/images/icons/payment.png"
              alt="Accepted Payment Methods: bKash, Nagad, Rocket, Visa, Mastercard, AMEX, Internet Banking - Verified by SSLCOMMERZ"
              width={500}
              height={68}
              className="h-11 sm:h-12 md:h-14 lg:h-[58px] w-auto max-w-full object-contain select-none"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
