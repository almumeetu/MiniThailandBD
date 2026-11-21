"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LuCheck, LuX } from "react-icons/lu";

function BkashResultContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-store-page px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-store-border bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${success ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
          {success ? <LuCheck className="h-7 w-7" /> : <LuX className="h-7 w-7" />}
        </div>
        <h1 className="text-xl font-semibold text-store-ink">
          {success ? "Payment successful" : "Payment was not completed"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {success
            ? "Your bKash payment has been verified. Thank you for shopping with NovaMart."
            : "No payment was captured. You can try again from checkout or continue shopping."}
        </p>
        <Link href={success ? "/confirmation" : "/checkout"} className="mt-6 inline-flex rounded-lg bg-store-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-store-hover">
          {success ? "View order" : "Return to checkout"}
        </Link>
      </div>
    </main>
  );
}

export default function BkashResultPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[60vh] items-center justify-center bg-store-page px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-store-border bg-white p-8 text-center shadow-sm">
          <div className="animate-pulse">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gray-200"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-40 mx-auto"></div>
          </div>
        </div>
      </main>
    }>
      <BkashResultContent />
    </Suspense>
  );
}
