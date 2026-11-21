"use client";

import { useState } from "react";
import { toast } from "sonner";
import { newsletterEmailValidation } from "@/utils/validation";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = newsletterEmailValidation(email, true);
    if (!validation.isValid) {
      const errorMsg = validation.errors.email || "Invalid input";
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/resend/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Thanks for subscribing!");
        setEmail("");
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full min-w-0 items-center gap-1 rounded-xl border border-white/20 bg-white/[0.04] p-1 transition  md:max-w-md" noValidate>
      <label className="sr-only" htmlFor="footer-newsletter-email">Email address</label>
      <input
        id="footer-newsletter-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/50 outline-none"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 shrink-0 rounded-lg bg-white px-4 text-sm font-semibold text-store-deep transition hover:bg-store-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-65"
      >
        {isSubmitting ? "Joining…" : "Subscribe"}
      </button>
    </form>
  );
}
