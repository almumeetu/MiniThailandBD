"use client";

import { useState } from "react";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { LuX, LuMessageCircle } from "react-icons/lu";

export default function FloatingSocialWidget() {
  const [expanded, setExpanded] = useState(false);

  const whatsappUrl =
    "https://wa.me/8801706126663?text=" +
    encodeURIComponent(
      "Hello Mini Thailand! I am visiting your website and would like to ask about product availability and ordering."
    );

  const messengerUrl = "https://m.me/minithailand2022";

  return (
    <aside
      aria-label="Quick contact"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5"
    >
      {/* Expanded Quick Options */}
      {expanded && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3.5 shadow-2xl border border-rose-100 animate-in fade-in slide-in-from-bottom-3 duration-200 w-64">
          <div className="flex items-center justify-between border-b border-rose-50 pb-2">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Need help ordering?</span>
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="rounded-full p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
              aria-label="Close contact widget"
            >
              <LuX className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 leading-snug">
            সাইজ, কালার বা সরাসরি অর্ডারের জন্য আমাদের সাথে এখনই চ্যাট করুন:
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] px-3 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <FaWhatsapp className="h-4 w-4" />
            <span>Chat on WhatsApp (01706-126663)</span>
          </a>

          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl bg-[#0084FF] hover:bg-[#0073e6] px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <FaFacebookMessenger className="h-4 w-4" />
            <span>Facebook Messenger</span>
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {!expanded && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-lg border border-rose-100 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Order on WhatsApp</span>
          </span>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white shadow-xl hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-200"
          aria-label="Open WhatsApp and Messenger contact menu"
        >
          {expanded ? (
            <LuX className="h-6 w-6" />
          ) : (
            <FaWhatsapp className="h-7 w-7" />
          )}
        </button>
      </div>
    </aside>
  );
}
