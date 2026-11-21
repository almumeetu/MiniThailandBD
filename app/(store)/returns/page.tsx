'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import {
  fetchShopSettings,
  parseContactEntries,
  type ShopSettings,
} from '@/lib/shop-api';

export default function ReturnsPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetchShopSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const shopName = settings?.shopName?.trim() || 'MiniThailandBD';
  const contactEntries = parseContactEntries(settings?.contactNumber);
  const primaryPhone = contactEntries[0]?.value || '+880 1722-301927';

  return (
    <div className="w-full min-h-[60vh] bg-white font-sans text-zinc-800">
      {/* Title */}
      <div className="border-b border-zinc-100 py-7 sm:py-9">
        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Return &amp; Refund Policy
        </h1>
      </div>

      <Breadcrumbs items={[{ label: 'Return & Refund Policy' }]} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 pb-16">
        {/* Content Body */}
        <div className="space-y-5 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <p>
            At {shopName}, your satisfaction and peace of mind come first. If any product arrives damaged in transit, with an expired batch code, or fails to meet your ordered specifications, we will replace it immediately or issue a full refund with zero reverse shipping fees.
          </p>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Return &amp; Replacement Policy:
            </h2>
            <p>
              We offer a 7-day hassle-free return and replacement policy from the date of delivery. If you receive a damaged, defective, or incorrect item, notify our customer support team within 7 days.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Conditions for Return:
            </h2>
            <p className="mb-1.5">To be eligible for a return or exchange, the item must meet the following criteria:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              <li>The item must be in its original packaging with tags and seals intact.</li>
              <li>Defective or damaged items must be reported with photographic or video proof within 7 days of delivery.</li>
              <li>Clothing, shoes, and wearable items must be unworn, unwashed, and in re-sellable condition.</li>
              <li>Perishable foods, grocery, and opened personal hygiene items (cosmetics, skincare, perfumes) cannot be returned once opened, unless received damaged or spoiled during transit.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Return Process:
            </h2>
            <p className="mb-1.5">Returning an item is simple and straightforward:</p>
            <ol className="list-decimal pl-5 space-y-1 text-zinc-600">
              <li>Contact our support team at <strong className="text-zinc-900">{primaryPhone}</strong> with your Order ID and photo/video proof of the issue.</li>
              <li>Our team will arrange a doorstep courier pickup for your package.</li>
              <li>Once the returned package reaches our hub and passes verification, your replacement or refund is initiated.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Refund Timeline:
            </h2>
            <p>
              For Mobile Financial Services (bKash, Nagad, Rocket), refunds are processed within 24 to 48 hours of inspection. For debit/credit card and bank payments, refunds are credited within 3 to 7 working days depending on the issuing bank.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Return Shipping Charges:
            </h2>
            <p>
              If the return is due to our error, transit damage, or manufacturer defect, {shopName} covers 100% of the reverse shipping charges. For voluntary returns or exchanges due to customer preference, standard courier delivery charges may apply.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              How You Receive Your Order &amp; Inspection:
            </h2>
            <p>
              Your order will be delivered directly to your home or office address provided during checkout. You may check the parcel condition before receiving it from the delivery agent.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Customer Support:
            </h2>
            <p>
              If you have any questions regarding returns, exchanges, or refunds, please reach out to our dedicated support helpline at <strong className="text-zinc-900">{primaryPhone}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
