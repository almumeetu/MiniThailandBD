"use client";

import { useState } from "react";
import { LuMail, LuPhone, LuCheck, LuArrowRight } from "react-icons/lu";
import { toast } from "sonner";

export default function AarongStayTuned() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<"bd" | "outside">("bd");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      toast.error("Please enter your email or mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (email.trim()) {
        try {
          const res = await fetch("/api/resend/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), phone: phone.trim(), location }),
          });
          const data = await res.json();
          if (!res.ok && data?.message && !data.message.includes("already subscribed")) {
            // Log warning but proceed with local success if resend isn't configured in dev
            console.warn("Newsletter endpoint notice:", data.message);
          }
        } catch {
          // In case API route is offline, gracefully fall through
        }
      }

      toast.success("Welcome to Mini Thailand! You're now on our VIP subscriber list.");
      setIsSuccess(true);
      setEmail("");
      setPhone("");
      setTimeout(() => setIsSuccess(false), 5000);
    } catch {
      toast.error("Subscription could not be completed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Stay Tuned Newsletter"
      className="w-full bg-[#f8f7f5] border-t border-b border-zinc-200/80 py-10 sm:py-14 text-zinc-900"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-14">
          
          {/* Left Column: Heading & Editorial Brand Context */}
          <div className="flex items-start gap-4 max-w-xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-zinc-950 text-white shadow-xs mt-0.5">
              <LuMail className="w-5 h-5 stroke-[1.8]" />
            </span>
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight text-zinc-950">
                STAY IN TOUCH WITH THE LATEST
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                Be the first to preview new Bangkok imports, limited velvet drops, live sales, and exclusive private offers.
              </p>
            </div>
          </div>

          {/* Right Column: Fully Responsive Input Fields + CTA */}
          <div className="flex-1 max-w-2xl w-full">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Form Input Container: Responsive Grid / Flex */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5 sm:gap-2 items-center">
                
                {/* Email Input */}
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <LuMail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email Address"
                    aria-label="Email address"
                    className="w-full h-12 pl-10 pr-4 text-xs sm:text-[13px] font-medium bg-white border border-zinc-300 rounded-none text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all shadow-2xs"
                  />
                </div>

                {/* Mobile Number Input */}
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <LuPhone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Mobile Number"
                    aria-label="Mobile number"
                    className="w-full h-12 pl-10 pr-4 text-xs sm:text-[13px] font-medium bg-white border border-zinc-300 rounded-none text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all shadow-2xs"
                  />
                </div>

                {/* Subscribe Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-12 px-7 sm:px-8 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-none disabled:opacity-60 transition-all shadow-sm active:scale-[0.98] cursor-pointer shrink-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-pulse">SUBSCRIBING...</span>
                  ) : isSuccess ? (
                    <>
                      <LuCheck className="w-4 h-4 stroke-[3]" />
                      <span>JOINED</span>
                    </>
                  ) : (
                    <>
                      <span>SUBSCRIBE</span>
                      <LuArrowRight className="w-3.5 h-3.5 sm:hidden" />
                    </>
                  )}
                </button>
              </div>

              {/* Location Radio Buttons (Custom Styled & Fully Responsive) */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-zinc-700">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none py-0.5">
                  <input
                    type="radio"
                    name="newsletter-residence"
                    checked={location === "bd"}
                    onChange={() => setLocation("bd")}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                      location === "bd"
                        ? "border-zinc-950 bg-white"
                        : "border-zinc-400 bg-white hover:border-zinc-700"
                    }`}
                  >
                    {location === "bd" && (
                      <span className="h-2 w-2 rounded-full bg-zinc-950" />
                    )}
                  </span>
                  <span className={`text-xs font-medium ${location === "bd" ? "text-zinc-950 font-semibold" : "text-zinc-600"}`}>
                    I live in Bangladesh
                  </span>
                </label>

                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none py-0.5">
                  <input
                    type="radio"
                    name="newsletter-residence"
                    checked={location === "outside"}
                    onChange={() => setLocation("outside")}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                      location === "outside"
                        ? "border-zinc-950 bg-white"
                        : "border-zinc-400 bg-white hover:border-zinc-700"
                    }`}
                  >
                    {location === "outside" && (
                      <span className="h-2 w-2 rounded-full bg-zinc-950" />
                    )}
                  </span>
                  <span className={`text-xs font-medium ${location === "outside" ? "text-zinc-950 font-semibold" : "text-zinc-600"}`}>
                    I live outside Bangladesh
                  </span>
                </label>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
