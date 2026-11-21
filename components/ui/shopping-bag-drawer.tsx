"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuShoppingBag,
} from "react-icons/lu";
import type { CartItem } from "@/lib/types";
import { getProductFallbackImage } from "@/lib/admin-api";
import { fetchShopProducts, type ShopProduct } from "@/lib/shop-api";
import { toast } from "sonner";

interface ShoppingBagDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  addedKey: string;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void | Promise<void>;
  onAddItem?: (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
    options?: { silent?: boolean }
  ) => void | Promise<void>;
}

function DrawerItemCard({
  item,
  onRemove,
  onQuantityChange,
  onClose,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void | Promise<void>;
  onClose: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const pending = useRef(false);

  const itemId = item.id || item.variantId || item.slug;
  const productUrl = item.slug
    ? `/products/${item.slug.split("-variant-")[0]}`
    : item.productId
    ? `/products/${item.productId}`
    : "/products";

  const image =
    imageFailed || !item.image
      ? getProductFallbackImage(item.name, "")
      : item.image;

  const handleQty = async (newQty: number) => {
    if (pending.current) return;
    if (newQty <= 0) {
      onRemove(itemId);
      return;
    }
    pending.current = true;
    setUpdating(true);
    try {
      await onQuantityChange(itemId, newQty);
    } finally {
      pending.current = false;
      setUpdating(false);
    }
  };

  const itemTotal = item.price * item.quantity;
  const isFreeGift = item.price === 0;

  return (
    <div data-product-card="product" className="bg-white rounded-[3px] border border-zinc-200/80 p-3 sm:p-3.5 mb-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 transition-shadow hover:shadow-xs">
      {/* Thumbnail */}
      <Link
        href={productUrl}
        onClick={onClose}
        className="relative row-span-1 sm:row-span-2 w-16 h-16 sm:w-18 sm:h-18 rounded-[2px] border border-zinc-200/70 p-1 shrink-0 bg-white flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity"
      >
        <Image
          src={image}
          alt={item.name}
          fill
          sizes="72px"
          className="object-contain p-1"
          unoptimized={image.includes("unsplash.com")}
          onError={() => setImageFailed(true)}
        />
      </Link>

      {/* Product title and badge */}
      <div className="col-start-2 row-start-1 min-w-0 pr-1">
        <Link
          href={productUrl}
          onClick={onClose}
          className="block text-xs sm:text-[13.5px] font-semibold text-zinc-900 truncate hover:text-[#F26522] transition-colors leading-tight"
          title={item.name}
        >
          {item.name}
        </Link>

        {isFreeGift && (
          <span className="inline-block bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
            Gift
          </span>
        )}
      </div>

      {/* Stepper + Formula: [- 1 +] × ৳1,300.00 = ৳1,300.00 */}
      <div className="col-start-1 col-span-3 row-start-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-nowrap sm:col-start-2 sm:col-span-1">
        {/* Stepper Box */}
        <div className="inline-flex items-center border border-zinc-200 rounded-[2px] bg-white">
          <button
            type="button"
            disabled={updating}
            onClick={() => handleQty(item.quantity - 1)}
            className="w-5.5 h-5.5 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 text-xs transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-6 text-center text-xs font-semibold text-zinc-800 select-none">
            {item.quantity}
          </span>
          <button
            type="button"
            disabled={updating}
            onClick={() => handleQty(item.quantity + 1)}
            className="w-5.5 h-5.5 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 text-xs transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <span className="text-xs text-zinc-400 font-normal select-none">×</span>

        <span className="text-xs sm:text-[13px] text-zinc-700 font-medium">
          ৳{item.price.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>

        <span className="text-xs text-zinc-400 font-normal select-none">=</span>

        <span className="text-xs sm:text-[13px] text-zinc-900 font-bold">
          ৳{itemTotal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Right: Close / Remove button */}
      <button
        type="button"
        disabled={updating}
        onClick={() => onRemove(itemId)}
        className="col-start-3 row-start-1 p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors shrink-0 cursor-pointer disabled:opacity-40"
        title="Remove item"
        aria-label={`Remove ${item.name}`}
      >
        <LuX className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ShoppingBagDrawer({
  open,
  onClose,
  items,
  addedKey: _addedKey,
  onRemove,
  onQuantityChange,
  onAddItem,
}: ShoppingBagDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Recommendations for "You May Also Like"
  const [upsells, setUpsells] = useState<ShopProduct[]>([]);
  const [upsellIndex, setUpsellIndex] = useState(0);

  useEffect(() => {
    fetchShopProducts({ limit: 8 })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setUpsells(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter out items already in cart
  const cartIds = new Set(items.map((i) => i.id || i.productId || i.slug));
  const availableUpsells = upsells.filter(
    (p) => !cartIds.has(p.id) && !cartIds.has(p.slug)
  );

  const activeUpsell =
    availableUpsells.length > 0
      ? availableUpsells[upsellIndex % availableUpsells.length]
      : null;

  const handlePrevUpsell = () => {
    if (availableUpsells.length === 0) return;
    setUpsellIndex((prev) =>
      prev > 0 ? prev - 1 : availableUpsells.length - 1
    );
  };

  const handleNextUpsell = () => {
    if (availableUpsells.length === 0) return;
    setUpsellIndex((prev) =>
      prev < availableUpsells.length - 1 ? prev + 1 : 0
    );
  };

  const handleAddUpsell = async (prod: ShopProduct) => {
    if (onAddItem) {
      await onAddItem(
        {
          id: prod.id,
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          image: prod.image,
          quantity: 1,
          slug: prod.slug,
        },
        { silent: true }
      );
      toast.success(`${prod.name} added to cart`);
    }
  };

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className={`fixed inset-0 z-50 overflow-hidden font-sans transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-full justify-end sm:max-w-md md:max-w-[30rem] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-full h-full max-w-full bg-[#F8F9FA] shadow-2xl flex flex-col border-l border-zinc-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-200/90 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-sm sm:text-[15px] font-bold text-zinc-900 uppercase tracking-wide">
              SHOPPING CART
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
              aria-label="Close cart drawer"
            >
              <span>Close</span>
              <LuArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          {items.length > 0 ? (
            <>
              {/* Scrollable Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin">
                {items.map((item) => (
                  <DrawerItemCard
                    key={item.id || item.variantId || item.slug}
                    item={item}
                    onRemove={onRemove}
                    onQuantityChange={onQuantityChange}
                    onClose={onClose}
                  />
                ))}
              </div>

              {/* "You May Also Like" Upsell Section (Matching Reference Image) */}
              {activeUpsell && (
                <div className="border-t border-zinc-200/80 bg-zinc-50/80 px-4 sm:px-5 py-3.5 shrink-0">
                  {/* Section Title with Orange underline + Orange Next/Prev buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                      <h3 className="text-sm sm:text-[14.5px] font-bold text-zinc-900 tracking-tight">
                        You May Also Like
                      </h3>
                      <div className="w-12 h-0.5 bg-[#F26522] mt-1 rounded-full" />
                    </div>

                    {availableUpsells.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevUpsell}
                          className="w-7 h-7 rounded-full bg-[#F26522] hover:bg-[#d95316] text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          aria-label="Previous recommendation"
                        >
                          <LuChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextUpsell}
                          className="w-7 h-7 rounded-full bg-[#F26522] hover:bg-[#d95316] text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          aria-label="Next recommendation"
                        >
                          <LuChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upsell Card */}
                  <div data-product-card="product" className="bg-white rounded-[3px] border border-zinc-200/90 p-3 flex items-center gap-3 shadow-2xs">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[2px] bg-zinc-50 border border-zinc-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={activeUpsell.image || getProductFallbackImage(activeUpsell.name, "")}
                        alt={activeUpsell.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        unoptimized={(activeUpsell.image || "").includes("unsplash.com")}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold text-zinc-900 truncate"
                        title={activeUpsell.name}
                      >
                        {activeUpsell.name}
                      </p>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        ৳{activeUpsell.price.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddUpsell(activeUpsell)}
                        className="mt-1.5 inline-flex items-center gap-1 bg-[#F26522] hover:bg-[#d95316] text-white text-xs font-bold px-3 py-1 rounded-full transition-colors shadow-2xs cursor-pointer select-none"
                      >
                        <span>+ Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Drawer Footer (Total + Solid Orange CHECKOUT Button) */}
              <div className="border-t border-zinc-200 bg-white px-5 py-4 shrink-0 space-y-3.5">
                {/* Total Row */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm sm:text-base font-semibold text-zinc-800">
                    Total:
                  </span>
                  <span className="text-base sm:text-lg font-bold text-zinc-900 font-tabular">
                    ৳{subtotal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Big Solid Orange Full-Width CHECKOUT Button */}
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#F26522] hover:bg-[#d95316] text-white font-bold text-sm tracking-wide uppercase rounded-[3px] text-center block transition-all shadow-md active:scale-[0.99] select-none"
                >
                  CHECKOUT
                </Link>
              </div>
            </>
          ) : (
            /* Empty Cart State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522] mb-4 shadow-2xs">
                <LuShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                Your Shopping Cart is Empty
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
                Add products from our catalog or offer zone to begin your shopping.
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-[3px] bg-[#F26522] hover:bg-[#d95316] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Start Shopping</span>
                <LuArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
