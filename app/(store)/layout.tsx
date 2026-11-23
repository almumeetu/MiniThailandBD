import { Suspense } from 'react';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import Bottomfooter from '@/components/sections/bottom-footer';
import { AuthProvider } from "@/app/_providers/auth-provider";
import { CartProvider } from "@/app/_providers/cart-provider";
import { WishlistProvider } from "@/app/_providers/wishlist-provider";
import AuthModal from "@/components/auth-modal";
import BackToTop from "@/components/ui/back-to-top";
import FloatingSideCart from "@/components/ui/floating-side-cart";
import MobileBottomNav from "@/components/ui/mobile-bottom-nav";
import FloatingWhatsApp from "@/components/ui/floating-whatsapp";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <div className="storefront min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 relative isolate bg-transparent overflow-x-clip">
            {/* Upper Scrollable Layer: Header, Page Content & Subscribe Section */}
            <div className="relative z-10 bg-[#faf9f5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
              <Suspense fallback={<div className="h-16 lg:h-[134px] bg-[#121214] w-full" />}>
                <Header />
              </Suspense>
              {children}
              <Mainfooter />
            </div>

            {/* Fixed Curtain-Reveal Footer (4 Photo Cards + Bottom Bar) */}
            <Bottomfooter />

            <AuthModal />
            <FloatingWhatsApp />
            <FloatingSideCart />
            <BackToTop />
            <MobileBottomNav />
            <Toaster richColors closeButton position="bottom-right" />
          </div>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
