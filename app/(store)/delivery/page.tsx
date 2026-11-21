'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import {
  fetchShopSettings,
  type ShopSettings,
} from '@/lib/shop-api';

export default function DeliveryPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetchShopSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const shopName = settings?.shopName?.trim() || 'MiniThailandBD';
  const deliveryInside =
    settings?.deliveryChargeInside !== undefined && settings?.deliveryChargeInside !== null
      ? Number(settings.deliveryChargeInside) === 0
        ? 'FREE'
        : `${settings.deliveryChargeInside} TK`
      : '70 TK';
  const deliveryOutside =
    settings?.deliveryChargeOutside !== undefined && settings?.deliveryChargeOutside !== null
      ? Number(settings.deliveryChargeOutside) === 0
        ? 'FREE'
        : `${settings.deliveryChargeOutside} TK`
      : '130 TK';
  const deliveryNearCity =
    settings?.deliveryChargeNearCity !== undefined && settings?.deliveryChargeNearCity !== null
      ? Number(settings.deliveryChargeNearCity) === 0
        ? 'FREE'
        : `${settings.deliveryChargeNearCity} TK`
      : '100 TK';

  return (
    <div className="w-full min-h-[60vh] bg-white font-sans text-zinc-800">
      {/* Title */}
      <div className="border-b border-zinc-100 py-7 sm:py-9">
        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Shipping Policy
        </h1>
      </div>

      <Breadcrumbs items={[{ label: 'Shipping Policy' }]} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 pb-16">
        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <p>
            At {shopName}, we ensure safe and timely delivery to customers across Bangladesh. Below is our delivery process and shipping charges:
          </p>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Regular Delivery:
            </h2>
            <p>
              Available inside Dhaka, Chittagong, and outside Dhaka.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Inside Dhaka &amp; Chittagong City:
            </h2>
            <p>Delivery Duration: 48 to 72 Hours</p>
            <p>Delivery Charge: {deliveryInside} (For any amount of products)</p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Outside Dhaka:
            </h2>
            <p>Delivery Duration: 3 to 5 working days</p>
            <p>Delivery Charge: {deliveryOutside} (For any amount of products)</p>
            <p className="text-zinc-500 mt-1">Delivery timelines may vary based on location and product type.</p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Express Delivery (Dhaka City Only):
            </h2>
            <p>Need your order faster? Choose express delivery within Dhaka city.</p>
            <p>Express Delivery Charge: {deliveryNearCity}</p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              How You Receive Your Order:
            </h2>
            <p>
              Your order will be delivered directly to your home or office address provided during checkout. Our delivery partners will contact you if needed during delivery.
            </p>
            <p className="mt-1">
              We aim to provide a smooth and reliable delivery experience for every customer.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
              Cash on Delivery:
            </h2>
            <p>
              Cash on Delivery (COD) is available across all 64 districts in Bangladesh. You can inspect the package upon arrival and pay the delivery agent in cash or available digital payment methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
