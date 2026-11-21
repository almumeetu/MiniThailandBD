import About from '@/components/sections/about-us/about';
import PageBanner from '@/components/ui/page-banner';

export const metadata = {
  title: "About Us | MiniThailandBD — Bangladesh's Premier Fashion Online Store",
  description: "Discover MiniThailandBD, Bangladesh's premier fashion online store for skincare, digital electronics, perfumes, fashion, baby products and home essentials.",
};

export default function AboutPage() {
  return (
    <div className="w-full">
      <PageBanner
        title="About MiniThailandBD"
        subtitle="Explore products across skin care, electronics, fashion, baby care, and home essentials. Delivery options and charges are shown at checkout."
        breadcrumbs={[
          { label: "About Us" },
        ]}
      />
      <About />
    </div>
  );
}
