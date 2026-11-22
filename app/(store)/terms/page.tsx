'use client';

import React from 'react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa6';
import { FiPhone, FiArrowRight } from 'react-icons/fi';
import PageBanner from '@/components/ui/page-banner';
import PolicySubNav from '@/components/sections/policy/policy-sub-nav';

const SECTIONS = [
  {
    id: 'agreement',
    title: '1. Agreement & Acceptance of Terms',
    content: [
      'By accessing, browsing, or placing an order on our online platform (minithailandbd.com) or at any of our physical boutiques, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms & Conditions.',
      'These conditions govern all transactions, reservations, vouchers, and customer interactions across Mini Thailand Bangladesh.',
    ],
  },
  {
    id: 'authenticity',
    title: '2. 100% Authentic Product Guarantee',
    content: [
      'Mini Thailand operates under a strict authenticity protocol. All products featured across our collections are 100% genuine, directly imported and curated from certified Bangkok design studios and verified international suppliers.',
      'Every single outfit undergoes rigorous quality checks for fabric composition, stitching integrity, and sizing accuracy before dispatch.',
    ],
  },
  {
    id: 'pricing',
    title: '3. Pricing & Payment Methods',
    content: [
      'All product prices displayed on the store are denominated in Bangladeshi Taka (BDT) and are inclusive of standard applicable taxes. Promotional discounts or coupon codes are applied at checkout prior to final payment.',
      'We accept nationwide Cash on Delivery (COD), along with secure digital payments via bKash, Nagad, Visa, Mastercard, and direct bank transfers.',
    ],
  },
  {
    id: 'orders',
    title: '4. Order Placement & Cancellation',
    content: [
      'Upon placing an order, you will receive an automated confirmation SMS/email with your unique Order ID. For first-time Cash on Delivery customers or festive season rush orders, our customer verification team may contact you to confirm sizing details.',
      'You may modify or cancel your order free of charge anytime prior to courier dispatch by contacting our customer care hotline or WhatsApp stylist desk.',
    ],
  },
  {
    id: 'shipping',
    title: '5. Doorstep Delivery & Risk of Loss',
    content: [
      'Deliveries inside Dhaka city are normally completed within 24 to 48 hours. Deliveries outside Dhaka across all 64 districts are fulfilled within 48 to 72 hours via verified logistics courier partners.',
      'Risk of loss and title for items pass to you upon handover by the courier delivery agent. You are entitled to inspect the parcel seal and outer condition prior to completing payment.',
    ],
  },
  {
    id: 'returns',
    title: '6. 7-Day Return & Replacement Guarantee',
    content: [
      'You are entitled to request a size replacement or return within 7 calendar days of delivery if an item arrives defective, damaged, or incorrectly sized.',
      'Mini Thailand covers 100% of reverse courier shipping for verified defects or transit damage. Approved refunds are issued within 24–48 hours via mobile wallets or 3–7 business days via banks.',
    ],
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property & Brand Assets',
    content: [
      'All content published on this website—including photography, styling imagery, logos, brand marks, and product descriptions—is the property of Mini Thailand and is protected by copyright and intellectual property laws of Bangladesh.',
      'Any unauthorized reproduction, modification, or commercial exploitation of brand materials without prior written authorization is strictly prohibited.',
    ],
  },
  {
    id: 'law',
    title: '8. Governing Law & Dispute Resolution',
    content: [
      'These Terms & Conditions are governed by and construed in accordance with the laws of the People’s Republic of Bangladesh, including the Consumers’ Right Protection Act, 2009 and the Digital Commerce Operation Guidelines, 2021.',
      'Any disputes arising in connection with our services will be settled amicably through customer mediation and the competent jurisdiction of Dhaka, Bangladesh.',
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-20">
      <PageBanner
        title="Terms & Conditions"
        subtitle="Please review our store policies, authentic product warranty, order guidelines, and customer rights."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Terms & Conditions' },
        ]}
        showTrustChips={false}
      />
      <PolicySubNav currentKey="terms" />

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
                Have questions regarding our terms?
              </h3>
              <p className="text-zinc-600">
                Our support desk is available daily from 10:00 AM to 10:00 PM to assist you.
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
                    'Hello Mini Thailand! I have a question regarding terms.'
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
