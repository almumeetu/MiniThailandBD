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
          <div className="storefront min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <Suspense fallback={<div className="h-16 lg:h-[134px] bg-[#121214] w-full" />}>
            <Header />
          </Suspense>
          {children}
          <Mainfooter />
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
