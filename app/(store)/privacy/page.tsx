'use client';

import React from 'react';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default function PrivacyPage() {
  const sections = [
    {
      id: 'commitment',
      title: '1. Our Privacy Commitment',
      content:
        'We value your personal privacy. We are committed to safeguarding your contact information, delivery coordinates, and browsing history. We never sell, rent, or trade your personal data to unauthorized third parties or marketing brokers.',
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      content:
        'When you place an order or register an account, we collect necessary transactional details including your full name, recipient delivery address, active contact phone number, and email address. Session cookies are utilized to remember your shopping cart items, wishlist, and preferences.',
    },
    {
      id: 'usage',
      title: '3. How Your Information Is Used',
      content:
        'Your information is strictly used for order processing, issuing invoices, sending courier tracking notifications, arranging doorstep delivery across Bangladesh, and delivering customer support through our helpline.',
    },
    {
      id: 'security',
      title: '4. Bank-Grade 256-bit SSL Security',
      content:
        'All communications between your browser and our platform are encrypted with 256-bit Secure Socket Layer (SSL) certificates. We do not store or log your credit card numbers, debit card CVV, or mobile banking PINs. All financial transactions are processed securely through certified payment gateways.',
    },
    {
      id: 'courier',
      title: '5. Authorized Logistics Partners',
      content:
        'To fulfill physical orders, your delivery name, address, and phone number are securely transmitted to verified courier partners. These partners are legally contractually bound to utilize this data exclusively for parcel delivery.',
    },
    {
      id: 'rights',
      title: '6. Your Rights & Data Deletion',
      content:
        'You have full control over your personal data. You may update your account details at any time. If you wish to delete your account or erase past order records from our systems, simply contact our support team.',
    },
  ];

  return (
    <div className="w-full min-h-[60vh] bg-white font-sans text-zinc-800">
      {/* Title */}
      <div className="border-b border-zinc-100 py-7 sm:py-9">
        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Privacy Policy
        </h1>
      </div>

      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-8 pb-16">
        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <p>
            This Privacy Policy explains how we collect, safeguard, and process your personal information when you use our website and services.
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
