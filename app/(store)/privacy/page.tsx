'use client';

import React from 'react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa6';
import { FiMail } from 'react-icons/fi';
import PageBanner from '@/components/ui/page-banner';
import PolicySubNav from '@/components/sections/policy/policy-sub-nav';

const SECTIONS = [
  {
    id: 'commitment',
    title: '1. Our Privacy Commitment',
    content: [
      'We respect your privacy. Mini Thailand Bangladesh is committed to protecting your personal information, contact coordinates, delivery addresses, and purchase history.',
      'Under no circumstances do we sell, rent, monetize, or trade your personal data to unauthorized third parties, data aggregators, or external marketing brokers.',
    ],
  },
  {
    id: 'collection',
    title: '2. Information We Collect',
    content: [
      'When you place an order, create an account, or contact our WhatsApp styling team, we collect necessary transactional details such as your full name, delivery address, phone number, and email address.',
      'Session cookies and local storage tokens are used strictly to remember your cart items, saved wishlist items, and language/currency preferences.',
    ],
  },
  {
    id: 'usage',
    title: '3. How Your Information Is Used',
    content: [
      'Your information is used strictly to fulfill your orders, generate official sales invoices, send live SMS courier tracking updates, coordinate doorstep parcel delivery, and provide customer support.',
      'If you opt in to store updates, you may occasionally receive alerts about new Bangkok collections, festive discounts, or flash sale events.',
    ],
  },
  {
    id: 'security',
    title: '4. Bank-Grade 256-bit SSL Security',
    content: [
      'All data transmissions between your browser and our servers are encrypted using modern 256-bit Secure Sockets Layer (SSL) certificates.',
      'We never store, log, or have access to sensitive financial credentials such as card CVVs, debit card PINs, or bKash/Nagad secret PINs. All online payments are handled directly by certified, PCI-DSS compliant payment gateways in Bangladesh.',
    ],
  },
  {
    id: 'logistics',
    title: '5. Authorized Logistics & Courier Partners',
    content: [
      'To deliver your orders directly to your doorstep inside Dhaka or anywhere across Bangladesh, your recipient name, destination address, and phone number are securely transmitted to verified logistics courier partners (e.g. Steadfast, Pathao, Paperfly).',
      'These logistics partners are under strict legal obligations to use your information solely for successful parcel delivery.',
    ],
  },
  {
    id: 'rights',
    title: '6. Your Rights & Data Erasure',
    content: [
      'You maintain full control over your personal records. You can review or edit your stored addresses and account info anytime through your customer profile.',
      'If you wish to permanently delete your account or transaction history from our platform, simply contact our support desk via email or WhatsApp and our data team will process your request promptly.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-20">
      <PageBanner
        title="Privacy Policy"
        subtitle="Learn how Mini Thailand Bangladesh protects your personal information, secures online transactions, and respects your privacy rights."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy' },
        ]}
        showTrustChips={false}
      />
      <PolicySubNav currentKey="privacy" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14">
        <article className="max-w-4xl space-y-10 text-sm sm:text-base text-zinc-700 leading-relaxed">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="space-y-3 pt-2 first:pt-0">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                {section.title}
              </h2>
              {section.content.map((paragraph, idx) => (
                <p key={idx} className="text-zinc-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {/* Support Box */}
          <section className="pt-6 border-t border-zinc-200">
            <div className="p-5 sm:p-6 rounded-none bg-stone-50 border border-zinc-200 text-xs sm:text-sm text-zinc-700 space-y-3">
              <h3 className="font-bold text-zinc-950 text-sm sm:text-base">
                Have questions about your privacy?
              </h3>
              <p className="text-zinc-600">
                Contact our data security desk or connect with our customer care team anytime.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="mailto:support@minithailandbd.com"
                  className="inline-flex items-center gap-2 font-semibold text-zinc-950 hover:text-rose-600 transition-colors"
                >
                  <FiMail className="w-4 h-4 text-zinc-600" />
                  <span>support@minithailandbd.com</span>
                </a>
                <span className="text-zinc-300">•</span>
                <a
                  href={`https://wa.me/8801706126663?text=${encodeURIComponent(
                    'Hello Mini Thailand! I have a question regarding privacy.'
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
