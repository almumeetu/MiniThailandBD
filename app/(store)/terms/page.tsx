'use client';

import React from 'react';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default function TermsPage() {
  const sections = [
    {
      id: 'agreement',
      title: '1. Agreement & Acceptance of Terms',
      content:
        'By browsing, accessing, or placing an order on our platform, you agree to be bound by these Terms & Conditions. These terms govern all purchases made across our store including all departments and product categories.',
    },
    {
      id: 'authenticity',
      title: '2. 100% Authentic Product Guarantee',
      content:
        'We operate under a zero-tolerance policy against counterfeit merchandise. All products listed on our platform are guaranteed 100% genuine, directly sourced from authorized brand distributors, verified global importers, and official manufacturers. Every item is verified for batch codes, expiry dates, and manufacturer seals before courier packaging.',
    },
    {
      id: 'pricing',
      title: '3. Pricing, Discounts & Payment Methods',
      content:
        'All prices listed are in Bangladeshi Taka (BDT) inclusive of applicable taxes. We reserve the right to correct any typographical or technological pricing errors prior to shipment. Available payment methods are shown during checkout.',
    },
    {
      id: 'orders',
      title: '4. Order Placement, Verification & Cancellation',
      content:
        'Upon submitting an order, you will receive an automated confirmation. For high-value items or special orders, our verification team may contact you to re-confirm address details prior to dispatch. Customers may cancel an order free of charge before the parcel is handed over to our courier partner by contacting our support desk.',
    },
    {
      id: 'shipping',
      title: '5. Doorstep Delivery & Risk of Loss',
      content:
        'Available delivery options, applicable charges, and estimated delivery times depend on the delivery address and are shown during checkout. Please review these details before placing an order.',
    },
    {
      id: 'returns',
      title: '6. 7-Day Return & Replacement Guarantee',
      content:
        'Customers are entitled to request a return or replacement within 7 calendar days of receipt if an item arrives damaged, defective, expired, or incorrect. We cover 100% of reverse courier shipping costs for verified defective items. Refunds are issued via bKash/Nagad or bank within 24–48 hours of verification.',
    },
    {
      id: 'law',
      title: '7. Governing Law & Dispute Resolution',
      content:
        'These Terms & Conditions are governed by and construed in accordance with the laws of the People’s Republic of Bangladesh, including the Consumers’ Right Protection Act, 2009 and the Digital Commerce Operation Guidelines.',
    },
  ];

  return (
    <div className="w-full min-h-[60vh] bg-white font-sans text-zinc-800">
      {/* Title */}
      <div className="border-b border-zinc-100 py-7 sm:py-9">
        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Terms &amp; Conditions
        </h1>
      </div>

      <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 pb-16">
        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <p>
            Please review these terms carefully before placing an order. These provisions define your legal rights, warranties, and obligations.
          </p>

          {sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-1">
                {section.title}:
              </h2>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
