import Image from "next/image";
import { fetchShopSettings } from "@/lib/shop-api";

export default async function Bottomfooter() {
  const settings = await fetchShopSettings();

  const shopName = settings?.shopName?.trim() || "MiniThailandBD";
  const copyrightYear = settings?.copyrightYear || new Date().getFullYear();

  return (
    <section className="w-full border-t border-white/10 bg-[#120410] py-4 sm:py-5 font-sans text-zinc-400">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
          {/* Left: Copyright notice */}
          <div className="text-xs sm:text-sm text-zinc-400 text-center md:text-left select-none font-medium">
            Copyright © {copyrightYear} <span className="font-semibold text-white">{shopName}</span> · All Rights Reserved
          </div>

          {/* Right: Payment gateway banner with clean readable wrapper */}
          <div className="flex items-center justify-center md:justify-end md:pr-10 lg:pr-14">
            <div className="rounded-xl bg-white/95 px-3 py-1.5 shadow-sm">
              <Image
                src="/images/icons/payment.png"
                alt="Accepted Payment Methods: bKash, Nagad, Rocket, Visa, Mastercard, AMEX, Internet Banking - Verified by SSLCOMMERZ"
                width={500}
                height={68}
                className="h-7 sm:h-8 md:h-9 w-auto max-w-full object-contain select-none"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
