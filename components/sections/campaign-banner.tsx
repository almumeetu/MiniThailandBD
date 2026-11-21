import Image from "next/image";
import Link from "next/link";

export default function CampaignBanner() {
  return (
    <section
      aria-label="Campaign banner"
      className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16"
    >
      <Link
        href="/products"
        className="group block relative h-[clamp(140px,24vw,300px)] overflow-hidden rounded-2xl bg-store-surface shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <Image
          src="/images/campaign/nova-campaign-banner.png"
          alt="Curated food, skincare, fragrance, audio, and home products arranged as a retail campaign display"
          fill
          sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) calc(100vw - 3rem), (max-width: 1024px) calc(100vw - 5rem), 1312px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
    </section>
  );
}
