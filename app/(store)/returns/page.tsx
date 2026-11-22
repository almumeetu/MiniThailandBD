'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa6';
import { FiPhone, FiCheck, FiArrowRight } from 'react-icons/fi';
import { fetchShopSettings, parseContactEntries, type ShopSettings } from '@/lib/shop-api';
import PageBanner from '@/components/ui/page-banner';
import PolicySubNav from '@/components/sections/policy/policy-sub-nav';

export default function ReturnsPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetchShopSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const shopName = settings?.shopName?.trim() || 'Mini Thailand';
  const contactEntries = parseContactEntries(settings?.contactNumber);
  const primaryPhone = contactEntries[0]?.value || '+880 1706-126663';
  const cleanPhone = primaryPhone.replace(/[^\d+]/g, '') || '01706126663';

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-20">
      <PageBanner
        title="Return & Refund Policy"
        subtitle="We want you to love your boutique outfit. Enjoy our 7-day hassle-free size replacement and return guarantee."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Return & Refund Policy' },
        ]}
        showTrustChips={false}
      />
      <PolicySubNav currentKey="returns" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14">
        <article className="max-w-4xl space-y-10 text-sm sm:text-base text-zinc-700 leading-relaxed">
          
          {/* Section 1: 7-Day Exchange Window */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              1. 7-Day Hassle-Free Exchange Window
            </h2>
            <p>
              If your garment does not fit as expected or you wish to swap for another size or style, you may request an exchange within <strong>7 calendar days</strong> from the day you received the parcel.
            </p>
          </section>

          {/* Section 2: Eligibility Conditions */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              2. Eligibility Criteria for Returns &amp; Exchanges
            </h2>
            <p>
              To ensure safety, hygiene, and authenticity, items returned must meet the following criteria:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 pl-4 list-disc">
              <li><strong>Condition:</strong> The item must be completely unworn, unwashed, unaltered, and free from makeup, stains, or perfume scents.</li>
              <li><strong>Tags &amp; Packaging:</strong> All original brand tags, labels, and protective polybags must remain attached and intact.</li>
              <li><strong>Proof of Purchase:</strong> Please retain your original digital Order ID or printed physical invoice.</li>
            </ul>
          </section>

          {/* Section 3: Non-Returnable Items */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              3. Items Not Eligible for Return
            </h2>
            <p>
              Due to hygiene standards and legal clearance regulations, the following items are final sale:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 pl-4 list-disc">
              <li>Customized or tailored garments altered at the client’s special request.</li>
              <li>Intimate innerwear, shapewear, and personal hygiene products.</li>
              <li>Clearance sale items marked with a discount of 50% or higher.</li>
            </ul>
          </section>

          {/* Section 4: Return Methods */}
          <section className="space-y-4 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              4. How to Return or Exchange Your Outfit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              
              {/* Method A: Showroom Exchange */}
              <div className="p-4 rounded-xl bg-stone-50 border border-zinc-200/80 space-y-2">
                <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Option A: Instant In-Store Exchange</span>
                </span>
                <p className="text-xs sm:text-sm text-zinc-600 leading-normal">
                  Walk into any of our 4 Dhaka boutiques (Jamuna Future Park, Dhanmondi, Uttara, or Adabor) with your invoice. Try on alternate sizes directly and complete your swap instantly.
                </p>
              </div>

              {/* Method B: Doorstep Courier Swap */}
              <div className="p-4 rounded-xl bg-stone-50 border border-zinc-200/80 space-y-2">
                <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Option B: Doorstep Courier Swap</span>
                </span>
                <p className="text-xs sm:text-sm text-zinc-600 leading-normal">
                  Living outside Dhaka? Message our WhatsApp desk. We will dispatch the replacement size and the courier rider will hand over the new parcel while taking back the exchange item.
                </p>
              </div>

            </div>
          </section>

          {/* Section 5: Defective Items Guarantee */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              5. Defective or Damaged Parcels
            </h2>
            <p>
              Every garment undergoes a 3-point inspection before packing. In the unlikely event that you receive a defective item or transit-damaged parcel:
            </p>
            <p className="text-zinc-600">
              Please photograph the defect and notify our WhatsApp support desk within 24 hours of receiving the parcel. {shopName} will bear 100% of the reverse and forward courier costs to replace the item or refund your full payment.
            </p>
          </section>

          {/* Section 6: Refund Processing */}
          <section className="space-y-3 pt-2 border-t border-zinc-100">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
              6. Refund Timeline &amp; Payment Methods
            </h2>
            <p>
              Once your returned item is received at our central hub and passes quality inspection:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 pl-4 list-disc">
              <li><strong>bKash / Nagad / Upay:</strong> Refunds are disbursed within 24 to 48 hours.</li>
              <li><strong>Credit / Debit Cards:</strong> Processed within 3 to 7 business days, depending on your issuing bank.</li>
              <li><strong>Store Credit Voucher:</strong> Issued immediately with lifetime validity for seamless shopping.</li>
            </ul>
          </section>

          {/* Section 7: Support Box */}
          <section className="pt-4 border-t border-zinc-200">
            <div className="p-5 sm:p-6 rounded-none bg-stone-50 border border-zinc-200 text-xs sm:text-sm text-zinc-700 space-y-3">
              <h3 className="font-bold text-zinc-950 text-sm sm:text-base">
                Need to initiate a return or size exchange?
              </h3>
              <p className="text-zinc-600">
                Connect with our dedicated stylist desk. Please keep your Order ID and photos of the item handy.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-2 font-semibold text-zinc-950 hover:text-rose-600 transition-colors"
                >
                  <FiPhone className="w-4 h-4 text-zinc-600" />
                  <span>{primaryPhone}</span>
                </a>
                <span className="text-zinc-300">•</span>
                <a
                  href={`https://wa.me/8801706126663?text=${encodeURIComponent(
                    'Hello Mini Thailand! I would like to request an exchange/return for my order.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Exchange Desk</span>
                </a>
              </div>
            </div>
          </section>

        </article>
      </div>
    </main>
  );
}
