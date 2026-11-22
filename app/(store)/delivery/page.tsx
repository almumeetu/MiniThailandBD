'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa6';
import { FiPhone, FiArrowRight } from 'react-icons/fi';
import { fetchShopSettings, type ShopSettings } from '@/lib/shop-api';
import PageBanner from '@/components/ui/page-banner';
import PolicySubNav from '@/components/sections/policy/policy-sub-nav';

export default function DeliveryPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetchShopSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const shopName = settings?.shopName?.trim() || 'Mini Thailand';

  const deliveryInside =
    settings?.deliveryChargeInside !== undefined && settings?.deliveryChargeInside !== null
      ? Number(settings.deliveryChargeInside) === 0
        ? 'FREE'
        : `৳${settings.deliveryChargeInside}`
      : '৳70';

  const deliveryOutside =
    settings?.deliveryChargeOutside !== undefined && settings?.deliveryChargeOutside !== null
      ? Number(settings.deliveryChargeOutside) === 0
        ? 'FREE'
        : `৳${settings.deliveryChargeOutside}`
      : '৳130';

  const deliveryNearCity =
    settings?.deliveryChargeNearCity !== undefined && settings?.deliveryChargeNearCity !== null
      ? Number(settings.deliveryChargeNearCity) === 0
        ? 'FREE'
        : `৳${settings.deliveryChargeNearCity}`
      : '৳100';

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-20">
      <PageBanner
        title="Shipping & Delivery"
        subtitle="Prompt, secure doorstep delivery across all 64 districts in Bangladesh with Cash on Delivery and inspection options."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Shipping & Delivery' },
        ]}
        showTrustChips={false}
      />
      <PolicySubNav currentKey="delivery" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14">
        <article className="max-w-4xl space-y-10 text-sm sm:text-base text-zinc-700 leading-relaxed">
          
          {/* Section 1: Delivery Coverage & Rates */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              1. Delivery Zones &amp; Shipping Charges
            </h2>
            <p>
              We deliver to every corner of Bangladesh through reliable logistics courier partners. Shipping rates and typical delivery durations are as follows:
            </p>

            <div className="overflow-hidden rounded-none border border-zinc-200 bg-stone-50/50 mt-3">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-100/80 text-zinc-900 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Delivery Zone</th>
                    <th className="py-3 px-4">Charge</th>
                    <th className="py-3 px-4">Estimated Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 text-zinc-700">
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-zinc-900">Inside Dhaka City</td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900">{deliveryInside}</td>
                    <td className="py-3.5 px-4">24 – 48 Hours</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-zinc-900">Dhaka Suburbs (Savar, Gazipur, Narayanganj)</td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900">{deliveryNearCity}</td>
                    <td className="py-3.5 px-4">24 – 48 Hours</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-zinc-900">Outside Dhaka (All 64 Districts)</td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900">{deliveryOutside}</td>
                    <td className="py-3.5 px-4">48 – 72 Hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-zinc-500 pt-1">
              * Delivery timelines may slightly vary during major national festival holidays or severe weather conditions.
            </p>
          </section>

          {/* Section 2: Cash on Delivery */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              2. Cash on Delivery (COD) Assurance
            </h2>
            <p>
              To ensure 100% peace of mind, {shopName} offers full Cash on Delivery (COD) across all 64 districts in Bangladesh. No advance payment is mandatory for regular ready-to-wear orders. You only pay when your parcel is physically handed over at your doorstep.
            </p>
          </section>

          {/* Section 3: Inspection Before Acceptance */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              3. Parcel Inspection Before Acceptance
            </h2>
            <p>
              We firmly believe in buyer confidence. When the courier delivery rider arrives, you are entitled to inspect the outer parcel and verify your items in the presence of the delivery person prior to completing the cash payment.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 pl-4 list-disc">
              <li>Check that the package seal is intact.</li>
              <li>Verify the ordered style and quantity match your invoice.</li>
              <li>In the rare event of transit damage or wrong size, you may immediately decline the parcel with the rider or contact our support team.</li>
            </ul>
          </section>

          {/* Section 4: Free Showroom Click & Collect */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              4. Free In-Store Pickup (Click &amp; Collect)
            </h2>
            <p>
              Prefer to try on your garments in person? You can pick up your order free of shipping charge from any of our 4 physical Dhaka boutiques:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-700 pt-1">
              <div className="p-3.5 rounded-lg bg-stone-50 border border-zinc-200/80">
                <span className="font-bold text-zinc-900 block">Jamuna Future Park</span>
                <span className="text-zinc-500 text-xs">Shop 11, Ground Floor, Dhaka</span>
              </div>
              <div className="p-3.5 rounded-lg bg-stone-50 border border-zinc-200/80">
                <span className="font-bold text-zinc-900 block">Dhanmondi Branch</span>
                <span className="text-zinc-500 text-xs">Shop 3060, Level 3, Shimanto Shambhar</span>
              </div>
              <div className="p-3.5 rounded-lg bg-stone-50 border border-zinc-200/80">
                <span className="font-bold text-zinc-900 block">Uttara Flagship</span>
                <span className="text-zinc-500 text-xs">Shop 23-24, Level 2, Sector 3, Uttara</span>
              </div>
              <div className="p-3.5 rounded-lg bg-stone-50 border border-zinc-200/80">
                <span className="font-bold text-zinc-900 block">Adabor Showroom</span>
                <span className="text-zinc-500 text-xs">Shop 43, Level 2, Adabor, Mohammadpur</span>
              </div>
            </div>
            <div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                <span>View showroom contact &amp; map directions</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* Section 5: Urgent / Same-Day Delivery */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              5. Urgent &amp; Same-Day Delivery
            </h2>
            <p>
              Have an upcoming flight, wedding, or sudden event? We provide same-day urgent express dispatch inside Dhaka for orders confirmed before 1:00 PM. Please connect directly with our WhatsApp stylist desk to request priority courier dispatch.
            </p>
          </section>

          {/* Section 6: Order Tracking */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              6. Order Tracking &amp; Notifications
            </h2>
            <p>
              Once your parcel is dispatched from our central hub, you will receive an automated SMS with your consignment tracking number. You can also view live delivery progress anytime by logging into your account or visiting our tracking portal.
            </p>
            <div>
              <Link
                href="/profile?tab=track"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 underline hover:text-rose-600 transition-colors"
              >
                <span>Track your active parcel now</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* Section 7: Support Box */}
          <section className="pt-4 border-t border-zinc-200">
            <div className="p-5 sm:p-6 rounded-none bg-stone-50 border border-zinc-200 text-xs sm:text-sm text-zinc-700 space-y-3">
              <h3 className="font-bold text-zinc-950 text-sm sm:text-base">
                Have questions about your delivery?
              </h3>
              <p className="text-zinc-600">
                Our support stylists are available 7 days a week from 10:00 AM to 10:00 PM to assist you with order updates, address modifications, or courier coordination.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="tel:+8801706126663"
                  className="inline-flex items-center gap-2 font-semibold text-zinc-950 hover:text-rose-600 transition-colors"
                >
                  <FiPhone className="w-4 h-4 text-zinc-600" />
                  <span>+880 1706-126663</span>
                </a>
                <span className="text-zinc-300">•</span>
                <a
                  href={`https://wa.me/8801706126663?text=${encodeURIComponent(
                    'Hello Mini Thailand! I have a question regarding delivery.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>
          </section>

        </article>
      </div>
    </main>
  );
}
