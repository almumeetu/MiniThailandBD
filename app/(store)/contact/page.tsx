'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiChevronDown, FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'sonner';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { fetchShopSettings, parseContactEntries, type ShopSettings } from '@/lib/shop-api';

const initialForm = { firstName: '', lastName: '', email: '', phoneNumber: '', inquiryType: 'order', message: '' };
const fieldClass = 'mt-1 w-full min-h-11 rounded-[3px] border border-stone-200 bg-stone-50/60 px-3 py-2 text-sm text-store-ink placeholder:text-stone-400 transition-colors';
const labelClass = 'block text-sm font-medium text-store-ink';

export default function ContactPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShopSettings().then((value) => { if (value) setSettings(value); });
  }, []);

  const shopName = settings?.shopName?.trim() || 'MiniThailandBD';
  const primaryPhone = parseContactEntries(settings?.contactNumber)[0]?.value || '+880 1706-126663';
  const cleanPhone = primaryPhone.replace(/[^\d+]/g, '') || '01706126663';
  const whatsappNumber = (settings?.socialContact?.whatsapp || primaryPhone).replace(/[^\d]/g, '') || '8801706126663';
  const fullWhatsapp = whatsappNumber.startsWith('88') ? whatsappNumber : `88${whatsappNumber.replace(/^0+/, '')}`;
  const primaryEmail = parseContactEntries(settings?.email)[0]?.value || 'support@minithailandbd.com';
  const branchAddress = settings?.branchAddress?.trim() || 'Jamuna Future Park (Shop 11, Ground Fl), Dhanmondi (Shop 3060, L3), Uttara (Shop 23-24, L2) & Adabor (Shop 43, L2), Dhaka';

  const contactMethods = [
    {
      title: 'Call us',
      detail: primaryPhone,
      href: `tel:${cleanPhone}`,
      icon: FiPhone,
      external: false,
    },
    {
      title: 'WhatsApp',
      detail: 'Chat with our team',
      href: `https://wa.me/${fullWhatsapp}?text=${encodeURIComponent(`Hello ${shopName}, I need help with an order.`)}`,
      icon: FaWhatsapp,
      external: true,
    },
    {
      title: 'Email us',
      detail: primaryEmail,
      href: `mailto:${primaryEmail}`,
      icon: FiMail,
      external: false,
    },
    {
      title: 'Address',
      detail: branchAddress,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchAddress)}`,
      icon: FiMapPin,
      external: true,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((previous) => ({ ...previous, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/resend/contact-us', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Unable to send message');
      toast.success('Your message has been sent. Our team will be in touch.');
      setFormData(initialForm);
    } catch {
      toast.error(`We could not send your message. Please call us at ${primaryPhone} or try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    { question: 'How can I track my order?', answer: 'Visit the Track Order page to check your order status, or contact us with your order details.' },
    { question: 'Where can I see delivery options and charges?', answer: 'Delivery options and charges are shown at checkout based on your address.' },
    { question: 'Which payment methods can I use?', answer: 'Available payment methods are shown at checkout.' },
    { question: 'How do I request a return or replacement?', answer: 'Please contact our support team with your order details. You can also review our return policy for more information.' },
  ];

  return (
    <main className="min-h-screen bg-store-page text-store-ink">
      <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 sm:pt-14 md:px-10 lg:px-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">Contact us</h1>
          <p className="mt-3 text-sm leading-7 text-store-accent sm:text-base">Have a question about an order or product? We’re here to help.</p>
        </div>
      </div>

      <Breadcrumbs items={[{ label: 'Contact us' }]} />

      <div className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 sm:pb-20 md:px-10 lg:px-16">
        <section aria-label="Ways to contact us" className="mt-8 grid gap-x-8 gap-y-6 py-2 sm:grid-cols-2 xl:grid-cols-4">
          {contactMethods.map(({ title, detail, href, icon: Icon, external }) => (
            <a
              key={title}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="group flex min-w-0 items-start gap-3 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-primary"
            >
              <Icon size={19} className="mt-0.5 shrink-0 text-store-primary" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-store-ink">{title}</span>
                <span className="mt-1 block text-sm leading-6 text-store-accent group-hover:underline [overflow-wrap:anywhere]">{detail}</span>
              </span>
            </a>
          ))}
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-8">
          <section className="bg-white p-4 sm:p-5">
            <h2 className="text-lg font-semibold tracking-tight">Send us a message</h2>
            <p className="mt-1 text-sm leading-5 text-store-accent">Tell us how we can help. Include your order details if you have them.</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>First name <span className="text-store-primary">*</span><input className={fieldClass} name="firstName" autoComplete="given-name" value={formData.firstName} onChange={handleInputChange} required /></label>
                <label className={labelClass}>Last name <span className="text-store-primary">*</span><input className={fieldClass} name="lastName" autoComplete="family-name" value={formData.lastName} onChange={handleInputChange} required /></label>
                <label className={labelClass}>Phone number <span className="text-store-primary">*</span><input className={fieldClass} type="tel" name="phoneNumber" autoComplete="tel-national" placeholder="01XXXXXXXXX" value={formData.phoneNumber} onChange={handleInputChange} required /></label>
                <label className={labelClass}>Email <span className="font-normal text-store-accent">(optional)</span><input className={fieldClass} type="email" name="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} /></label>
              </div>
              <label className={labelClass}>Topic<select className={fieldClass} name="inquiryType" value={formData.inquiryType} onChange={handleInputChange}><option value="order">Order and delivery</option><option value="return">Return or replacement</option><option value="product">Product inquiry</option><option value="corporate">Bulk order</option><option value="other">Other</option></select></label>
              <label className={labelClass}>Message <span className="text-store-primary">*</span><textarea className={`${fieldClass} min-h-24 resize-y`} name="message" rows={3} placeholder="How can we help?" value={formData.message} onChange={handleInputChange} required /></label>
              <button type="submit" disabled={submitting} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[3px] bg-store-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-store-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><FiSend size={16} />{submitting ? 'Sending...' : 'Send message'}</button>
            </form>
          </section>
          <section className="bg-white p-5 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Frequently asked questions</h2>
            <div className="mt-4">
              {faqs.map((faq, index) => (
                <div key={faq.question}>
                  <button type="button" aria-expanded={openFaq === index} aria-controls={`contact-faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium leading-6 hover:text-store-primary"><span>{faq.question}</span><FiChevronDown className={`shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} /></button>
                  {openFaq === index && <p id={`contact-faq-${index}`} className="pb-4 text-sm leading-6 text-store-accent">{faq.answer}</p>}
                </div>
              ))}
            </div>
            <Link href="/profile?tab=track" className="mt-4 inline-flex text-sm font-semibold text-store-primary hover:underline">Track your order <span aria-hidden="true" className="ml-2">→</span></Link>
          </section>
        </div>
      </div>
    </main>
  );
}
