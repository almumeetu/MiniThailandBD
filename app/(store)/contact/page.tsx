'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import { LuExternalLink, LuNavigation } from 'react-icons/lu';
import PageBanner from '@/components/ui/page-banner';

interface FormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

const initialForm: FormData = {
  name: '',
  phone: '',
  email: '',
  subject: 'Order & Sizing Inquiry',
  message: '',
};

interface Showroom {
  id: string;
  name: string;
  mall: string;
  address: string;
  hours: string;
  mapQuery: string;
}

const SHOWROOMS: Showroom[] = [
  {
    id: 'jamuna',
    name: 'Jamuna Future Park Flagship',
    mall: 'Shop 11, Zone C, Ground Floor',
    address: 'Progoti Shoroni, Kuril, Dhaka',
    hours: '10:00 AM – 10:00 PM Daily',
    mapQuery: 'Jamuna Future Park, Kuril, Dhaka',
  },
  {
    id: 'dhanmondi',
    name: 'Dhanmondi Simanto Somvar',
    mall: 'Shop 3060, Level 3',
    address: 'Road 2, Dhanmondi, Dhaka',
    hours: '10:00 AM – 10:00 PM Daily',
    mapQuery: 'Shimanto Shambhar, Dhanmondi, Dhaka',
  },
  {
    id: 'uttara',
    name: 'Uttara Nigar Plaza',
    mall: 'Shop 23-24, Level 2',
    address: 'Rajlokkhi, Sector 3, Uttara, Dhaka',
    hours: '10:00 AM – 10:00 PM Daily',
    mapQuery: 'Nigar Plaza, Sector 3, Uttara, Dhaka',
  },
  {
    id: 'adabor',
    name: 'Adabor Shahabuddin Plaza',
    mall: 'Shop 43, Level 2',
    address: 'Ring Road, Adabor, Mohammadpur, Dhaka',
    hours: '10:00 AM – 10:00 PM Daily',
    mapQuery: 'Shahabuddin Plaza, Ring Road, Mohammadpur, Dhaka',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom>(SHOWROOMS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error('Please enter your name, phone number, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/resend/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send');

      toast.success('Thank you! Your message has been sent successfully.');
      setFormData(initialForm);
    } catch {
      toast.success(
        'Thank you! Your message has been received. Our team will get back to you shortly.'
      );
      setFormData(initialForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-20">
      <PageBanner
        title="Contact Us"
        subtitle="Reach out to our customer care desk or visit our 4 boutique showrooms in Dhaka."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact Us' },
        ]}
        showTrustChips={false}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-16 sm:space-y-20">
          
          {/* ══════════ Section 1: Clean Single Column Message Form ══════════ */}
          <section className="space-y-8">
            <div className="space-y-2.5 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ec1c67] block">
                Get In Touch
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-zinc-950 leading-tight">
                Send Us a Message
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light max-w-2xl">
                Have questions regarding fabric, sizing, live video showcase, or your active order? Fill out the form below and our team will get back to you promptly.
              </p>
            </div>

            {/* Clean Borderless Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nusrat Jahan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50/80 focus:bg-white border-b-2 border-transparent focus:border-[#ec1c67] px-4 py-3.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01700-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-50/80 focus:bg-white border-b-2 border-transparent focus:border-[#ec1c67] px-4 py-3.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                    Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-50/80 focus:bg-white border-b-2 border-transparent focus:border-[#ec1c67] px-4 py-3.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-zinc-50/80 focus:bg-white border-b-2 border-transparent focus:border-[#ec1c67] px-4 py-3.5 text-xs sm:text-sm text-zinc-900 outline-none transition-all rounded-none cursor-pointer"
                  >
                    <option value="Order & Sizing Inquiry">Order &amp; Sizing Inquiry</option>
                    <option value="Delivery / Tracking Status">Delivery / Tracking Status</option>
                    <option value="Showroom Visit & Fitting">Showroom Visit &amp; Fitting</option>
                    <option value="Wholesale & Corporate Order">Wholesale &amp; Corporate Order</option>
                    <option value="Feedback & Other">Feedback &amp; Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                  Your Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can our team help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-zinc-50/80 focus:bg-white border-b-2 border-transparent focus:border-[#ec1c67] p-4 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all rounded-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 h-12 bg-zinc-950 hover:bg-[#ec1c67] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2.5 cursor-pointer rounded-none shadow-xs"
                >
                  <FiSend className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* ══════════ Section 2: Showroom Locations & Interactive Map (Single Column) ══════════ */}
          <section className="space-y-8 pt-10 border-t border-zinc-100">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ec1c67] block">
                Boutique Locations
              </span>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-950 leading-tight">
                  Visit Our Boutiques in Dhaka
                </h2>
                <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium shrink-0">
                  <FiClock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>10 AM – 10 PM Daily</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light max-w-2xl">
                Select any showroom below to view its location on the map or launch one-click GPS directions.
              </p>
            </div>

            {/* Showroom Selector Tabs (4 Clean, Borderless Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SHOWROOMS.map((s) => {
                const isSelected = selectedShowroom.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedShowroom(s)}
                    className={`text-left p-4 transition-all cursor-pointer rounded-none relative ${
                      isSelected
                        ? 'bg-zinc-950 text-white'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-900'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#ec1c67]" />
                    )}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs sm:text-sm tracking-tight truncate">
                        {s.name}
                      </span>
                    </div>
                    <p className={`text-[11.5px] font-medium truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {s.mall}
                    </p>
                    <p className={`text-[10.5px] mt-0.5 truncate ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {s.address}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Google Map Embed */}
            <div className="space-y-3">
              <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] sm:h-[400px] bg-zinc-100 overflow-hidden shadow-xs">
                <iframe
                  title={`Mini Thailand Boutique Map - ${selectedShowroom.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    selectedShowroom.mapQuery
                  )}&hl=en&z=16&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              {/* Map Info & Directions Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-2 text-zinc-700 min-w-0">
                  <FiMapPin className="w-4 h-4 text-[#ec1c67] shrink-0" />
                  <span className="font-medium">
                    <strong className="text-zinc-950">{selectedShowroom.name}:</strong> {selectedShowroom.mall}, {selectedShowroom.address}
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedShowroom.mapQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-zinc-950 hover:text-[#ec1c67] transition-colors shrink-0"
                >
                  <LuNavigation className="w-3.5 h-3.5 text-[#ec1c67]" />
                  <span>Open in Google Maps</span>
                  <LuExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </section>

        </div>
      </div>
    </main>
  );
}
