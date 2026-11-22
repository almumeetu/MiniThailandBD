import About from '@/components/sections/about-us/about';

export const metadata = {
  title: "The Story of Mini Thailand | Authentic Bangkok Boutique Fashion",
  description: "Discover Mini Thailand: Bangladesh's premier boutique destination for authentic imported Bangkok cord sets, royal velvet party gowns, and modern luxury festive wear.",
};

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen bg-white text-zinc-900 font-sans">
      <About />
    </main>
  );
}
