"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/_providers/cart-provider";
import { LuShoppingBag } from "react-icons/lu";

export default function FloatingSideCart() {
  const pathname = usePathname();
  const { items, itemCount, openBag } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on checkout/cart/order pages to avoid obstructing checkout flows
  const isCheckoutFlow = ["/cart", "/checkout", "/confirmation"].includes(pathname);
  if (!mounted || isCheckoutFlow) return null;

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <button
      type="button"
      onClick={openBag}
      aria-label={`Open shopping cart (${itemCount} items)`}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center justify-center bg-[#ec1c67] hover:bg-[#d81358] text-white px-2.5 py-3 rounded-l-[3px] shadow-lg shadow-pink-950/20 transition-all duration-200 group cursor-pointer border-y border-l border-pink-700/40 select-none"
    >
      <LuShoppingBag className="w-5 h-5 text-white mb-1 group-hover:scale-110 transition-transform" />
      <span className="text-[11px] font-bold leading-tight tracking-tight text-white">
        {itemCount} {itemCount === 1 ? "Item" : "Items"}
      </span>
      <span className="mt-1 text-[11px] font-extrabold bg-white/20 px-1.5 py-0.5 rounded-[2px] text-white tracking-tight">
        ৳{totalPrice.toLocaleString("en-BD")}
      </span>
    </button>
  );
}

