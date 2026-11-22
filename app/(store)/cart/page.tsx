"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import {
  LuMinus,
  LuPlus,
  LuArrowLeft,
  LuChevronUp,
  LuTrash2,
  LuLoader,
  LuTag,
  LuTruck,
  LuCheck,
  LuMapPin,
} from "react-icons/lu";
import {
  IoHeartOutline,
  IoHeart,
  IoChevronDownOutline,
  IoAlertCircleOutline,
  IoCallOutline,
} from "react-icons/io5";
import { toast } from "sonner";
import type { WishlistProduct, CartItem } from "@/lib/types";
import { clearBuyNowItem } from "@/lib/buy-now";
import {
  fetchShopProductById,
  fetchShopSettings,
  fetchShopCategories,
  parseContactEntries,
  DEFAULT_NOVAMART_CATEGORIES,
  applyCouponApi,
  type ShopSettings,
  type ShopCategory,
} from "@/lib/shop-api";
import { resolveImageUrl } from "@/lib/admin-api";
import type { Product as AdminProduct } from "@/lib/admin-api";
import PageBanner from "@/components/ui/page-banner";

interface AppliedCouponState {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discount: number;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, updateCartItem, initialised } = useCart();
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const { formatCurrency } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<"dhaka" | "outside">("dhaka");
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [categories, setCategories] = useState<ShopCategory[]>(DEFAULT_NOVAMART_CATEGORIES);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [cartProducts, setCartProducts] = useState<Record<string, AdminProduct>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleDropdownToggle = useCallback(
    async (itemId: string, productId: string, currentItem: CartItem) => {
      if (openDropdownId === itemId) {
        setOpenDropdownId(null);
        return;
      }
      setOpenDropdownId(itemId);

      const initialOptions: Record<string, string> = {};
      if (currentItem.color) initialOptions["Color"] = currentItem.color;
      if (currentItem.size) initialOptions["Size"] = currentItem.size;
      if (currentItem.attributes) {
        Object.assign(initialOptions, currentItem.attributes);
      }
      setSelectedOptions(initialOptions);

      if (productId && !cartProducts[productId] && !loadingProducts[productId]) {
        setLoadingProducts((prev) => ({ ...prev, [productId]: true }));
        try {
          const prod = await fetchShopProductById(productId);
          if (prod) {
            setCartProducts((prev) => ({ ...prev, [productId]: prod }));
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingProducts((prev) => ({ ...prev, [productId]: false }));
        }
      }
    },
    [openDropdownId, cartProducts, loadingProducts]
  );

  const getProductVariants = useCallback(
    (productId: string) => {
      const prod = cartProducts[productId];
      if (!prod) return [];
      return (prod.variants ?? []).map((v) => {
        const priceNum = Number(v.price ?? 0);
        const discountNum = prod.discountPrice ? Number(prod.discountPrice) : 0;
        const showOriginal = discountNum > 0 && discountNum < priceNum;
        const activePrice = showOriginal ? discountNum : priceNum;

        const attributesMap: Record<string, string> = {};
        (v as any).attributes?.forEach((attr: any) => {
          const attrName = attr.attributeValue?.attribute?.name;
          const attrVal = attr.attributeValue?.value;
          if (attrName && attrVal) {
            attributesMap[attrName] = attrVal;
          }
        });
        const optionNames = Object.values(attributesMap).filter(Boolean).join(" / ");

        const variantImages = (v as any).media
          ? ((v as any).media as any[])
              .slice()
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((m) => resolveImageUrl(m.media?.url))
              .filter(Boolean) as string[]
          : [];
        const variantImage = variantImages[0] ?? undefined;

        return {
          id: v.id,
          name: optionNames || "Default",
          price: activePrice,
          image: variantImage,
          attributes: attributesMap,
          stockQuantity: v.stockQuantity,
        };
      });
    },
    [cartProducts]
  );

  const getMatchedVariant = useCallback(
    (productId: string) => {
      const variantsList = getProductVariants(productId);
      if (variantsList.length === 0) return null;
      return (
        variantsList.find((v) => {
          return Object.entries(selectedOptions).every(
            ([k, selectVal]) => v.attributes[k] === selectVal
          );
        }) ?? null
      );
    },
    [getProductVariants, selectedOptions]
  );

  const getUniqueAttributes = useCallback(
    (productId: string) => {
      const variantsList = getProductVariants(productId);
      const attrs: Record<string, Set<string>> = {};
      variantsList.forEach((v) => {
        Object.entries(v.attributes).forEach(([key, val]) => {
          if (!attrs[key]) {
            attrs[key] = new Set<string>();
          }
          attrs[key].add(val);
        });
      });
      return Object.entries(attrs).reduce((acc, [key, set]) => {
        acc[key] = Array.from(set);
        return acc;
      }, {} as Record<string, string[]>);
    },
    [getProductVariants]
  );

  const getMatchedVariantImage = useCallback(
    (item: CartItem) => {
      const matched = getMatchedVariant(item.productId || "");
      return matched?.image || item.image;
    },
    [getMatchedVariant]
  );

  const getMatchedVariantPrice = useCallback(
    (item: CartItem) => {
      const matched = getMatchedVariant(item.productId || "");
      return matched ? formatCurrency(matched.price) : formatCurrency(item.price);
    },
    [getMatchedVariant, formatCurrency]
  );

  const isMatchedVariantOutOfStock = useCallback(
    (item: CartItem) => {
      const matched = getMatchedVariant(item.productId || "");
      return matched ? matched.stockQuantity <= 0 : false;
    },
    [getMatchedVariant]
  );

  const isApplyDisabled = useCallback(
    (item: CartItem) => {
      const matched = getMatchedVariant(item.productId || "");
      if (!matched) return true;
      if (matched.stockQuantity <= 0) return true;
      return matched.id === item.variantId;
    },
    [getMatchedVariant]
  );

  const handleUpdateVariant = useCallback(
    async (
      oldItem: CartItem,
      newVariantId: string,
      newPrice: number,
      newImage: string,
      newAttributes: Record<string, string>
    ) => {
      const nameWithoutOptions = oldItem.name.replace(/\s*\([^)]+\)$/, "");
      const optionNames = Object.values(newAttributes).filter(Boolean).join(", ");
      const newDisplayName = optionNames ? `${nameWithoutOptions} (${optionNames})` : nameWithoutOptions;

      const newColor = newAttributes.Color || newAttributes.Colour || newAttributes.color || "";
      const newSize = newAttributes.Size || newAttributes.size || "";

      await updateCartItem(oldItem.id ?? oldItem.variantId ?? oldItem.slug, {
        variantId: newVariantId,
        name: newDisplayName,
        price: newPrice,
        image: newImage,
        color: newColor,
        size: newSize,
        attributes: newAttributes,
      });
      setOpenDropdownId(null);
      toast.success("Item options updated!");
    },
    [updateCartItem]
  );

  const handleApplyChange = useCallback(
    async (item: CartItem) => {
      const matched = getMatchedVariant(item.productId || "");
      if (!matched) return;
      try {
        await handleUpdateVariant(
          item,
          matched.id,
          matched.price,
          matched.image || item.image,
          matched.attributes
        );
      } catch (err) {
        console.error(err);
      }
    },
    [getMatchedVariant, handleUpdateVariant]
  );

  const handleDecrement = useCallback(
    (itemId: string, currentQty: number) => {
      if (currentQty <= 1) {
        removeItem(itemId);
        toast.info("Item removed from cart");
      } else {
        updateQuantity(itemId, currentQty - 1);
      }
    },
    [removeItem, updateQuantity]
  );

  const handleToggleWishlist = useCallback(
    (item: CartItem) => {
      const productId = item.productId || item.id || item.slug;
      const wishlistItem: WishlistProduct = {
        id: productId,
        name: item.name,
        slug: item.slug,
        price: item.price,
        image: item.image,
        color: item.color || "",
        size: item.size || "",
        category: (item as any).category || "",
        team: "",
        variantId: item.variantId,
      };
      toggleWishlist(wishlistItem);
    },
    [toggleWishlist]
  );

  // Load real settings, categories and active coupons
  useEffect(() => {
    Promise.all([
      fetchShopSettings(),
      fetchShopCategories(),
    ]).then(([s, cats]) => {
      if (s) setSettings(s);
      if (cats && cats.length > 0) {
        const mainCats = cats.filter((c) => !c.parentId);
        if (mainCats.length > 0) setCategories(mainCats);
      }
    }).catch(console.error);

    if (typeof window !== "undefined") {
      try {
        const zone = sessionStorage.getItem("cart_delivery_zone");
        if (zone === "dhaka" || zone === "outside") setDeliveryZone(zone);
        const stored = sessionStorage.getItem("applied_coupon");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAppliedCoupon(parsed);
        }
      } catch {}
    }
  }, []);

  const hotlinePhone = useMemo(() => {
    const contacts = parseContactEntries(settings?.contactNumber);
    return contacts[0]?.value || "+880 1706-126663";
  }, [settings]);
  const cleanHotlinePhone = useMemo(() => hotlinePhone.replace(/[^0-9+]/g, ""), [hotlinePhone]);

  // Price & Dynamic Delivery Calculations
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const insideRate = Number(settings?.deliveryChargeInside ?? 60);
  const outsideRate = Number(settings?.deliveryChargeOutside ?? 120);

  const baseShipping = deliveryZone === "dhaka" ? insideRate : outsideRate;

  const selectDeliveryZone = (zone: "dhaka" | "outside") => {
    setDeliveryZone(zone);
    try { sessionStorage.setItem("cart_delivery_zone", zone); } catch {}
  };

  // Active Promo Code calculation
  const promoDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return Math.min(subtotal * (Number(appliedCoupon.value) / 100), subtotal);
    }
    return Math.min(Number(appliedCoupon.value), subtotal);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(0, subtotal + baseShipping - promoDiscount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    setIsApplyingPromo(true);
    try {
      const res = await applyCouponApi(clean, subtotal);
      if (res.success && res.data) {
        const couponData: AppliedCouponState = {
          code: res.data.coupon.code,
          type: res.data.coupon.type,
          value: Number(res.data.coupon.value),
          discount: res.data.discount,
        };
        setAppliedCoupon(couponData);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("applied_coupon", JSON.stringify(couponData));
        }
        toast.success(`Coupon "${clean}" applied successfully!`);
        setPromoInput("");
      } else {
        toast.error(res.message || "Invalid coupon code. Please try again.");
      }
    } catch {
      toast.error("Failed to validate coupon code.");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("applied_coupon");
    }
    toast.info("Coupon removed.");
  };

  return (
    <main className="flex-grow bg-store-page min-w-0 w-full min-h-screen font-sans pb-6">
      <PageBanner
        title="Shopping Cart"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "Shopping Cart" },
        ]}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12">
        {!initialised ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 sm:gap-8 lg:gap-10 animate-pulse">
            <div className="space-y-4">
              <div className="h-8 bg-zinc-200 rounded-none w-1/4" />
              <div className="h-32 bg-white rounded-none border border-zinc-200" />
              <div className="h-32 bg-white rounded-none border border-zinc-200" />
            </div>
            <div className="h-96 bg-white rounded-none border border-zinc-200" />
          </div>
        ) : items.length === 0 ? (
          /* ── Modern Empty Cart State ── */
          <div className="max-w-2xl mx-auto text-center py-16 px-4">
            <div className="w-24 h-24 rounded-none bg-store-surface text-store-primary flex items-center justify-center mx-auto mb-6 shadow-sm border border-store-border">
              <LuTruck className="w-12 h-12" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
              Your Shopping Cart is Empty
            </h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto leading-relaxed">
              Add products to your cart to start shopping.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-none shadow-sm transition-all cursor-pointer"
              >
                Browse Marketplace
              </Link>
              {categories.slice(0, 2).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
                  className="bg-white hover:bg-zinc-100 text-zinc-800 font-semibold text-sm px-6 py-3.5 rounded-none border border-zinc-200 transition-all"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Helpline Callout */}
            <div className="mt-12 p-4 rounded-none bg-white border border-zinc-200/80 inline-flex min-w-0 items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-none bg-store-surface text-store-primary flex items-center justify-center shrink-0">
                <IoCallOutline className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Need Help Finding Something?
                </p>
                <a
                  href={`tel:${cleanHotlinePhone}`}
                  className="text-sm font-semibold text-zinc-900 hover:text-store-primary transition-colors"
                >
                  Call {hotlinePhone}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 sm:gap-8 lg:gap-10 items-start">
            
            {/* ── Left Column: Cart Items List ── */}
            <div className="min-w-0 space-y-6">
              {/* Back to Shop & Total Count */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <Link
                    href="/products"
                    className="p-2 rounded-none hover:bg-zinc-100 text-zinc-600 transition-colors"
                    aria-label="Back to products"
                  >
                    <LuArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h2 className="text-lg sm:text-xl font-medium text-zinc-950 tracking-tight">
                      Items ({items.reduce((count, item) => count + item.quantity, 0)})
                    </h2>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-store-accent hover:underline"
                >
                  Add items
                </Link>
              </div>

              {/* Items Card List */}
              <div className="space-y-4">
                {items.map((item) => {
                  const itemId = item.id ?? item.variantId ?? item.slug;
                  const inWishlist =
                    isInWishlist(item.productId || "") ||
                    isInWishlist(item.id || "") ||
                    isInWishlist(item.slug || "");
                  const productUrl = item.slug ? `/products/${item.slug}` : `/products`;

                  const match = item.name.match(/^(.*?)\s*\(([^)]+)\)$/);
                  const displayName = match ? match[1] : item.name;
                  const optionSummary = match ? match[2] : (item.color || item.size || "");

                  return (
                    <article data-product-card="product" key={itemId} className="min-w-0 rounded-none border border-[#DED7CC] bg-white p-4 sm:p-5">
                      <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-5">
                        <Link href={productUrl} className="relative aspect-square w-full rounded-none overflow-hidden bg-zinc-50 border border-zinc-100">
                          <Image
                            src={item.image || "/images/no-image-icon-6.png"}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 72px, 104px"
                            className="object-contain p-2 sm:p-3"
                          />
                        </Link>
                        <div className="min-w-0 space-y-2">
                          <Link href={productUrl} className="block text-sm sm:text-base font-medium leading-6 text-zinc-900 hover:text-store-accent break-words">
                            {displayName}
                          </Link>
                          {optionSummary && (
                            <button
                              type="button"
                              onClick={() => handleDropdownToggle(itemId, item.productId || "", item)}
                              aria-expanded={openDropdownId === itemId}
                              aria-controls={`cart-options-${itemId}`}
                              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-none border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-50"
                            >
                              <span className="min-w-0 break-words">{optionSummary}</span>
                              <IoChevronDownOutline className="h-4 w-4 shrink-0" />
                            </button>
                          )}
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <p className="text-base font-semibold text-store-price break-words">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <span className="text-xs text-zinc-500">{formatCurrency(item.price)} each</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                        <div className="flex items-center rounded-none border border-zinc-200 bg-white">
                          <button type="button" onClick={() => handleDecrement(itemId, item.quantity)} className="flex h-11 w-11 items-center justify-center rounded-none text-zinc-600 hover:bg-zinc-50" aria-label={`Decrease quantity of ${displayName}`}>
                            <LuMinus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-zinc-900">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(itemId, item.quantity + 1)} className="flex h-11 w-11 items-center justify-center rounded-none text-zinc-600 hover:bg-zinc-50" aria-label={`Increase quantity of ${displayName}`}>
                            <LuPlus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(item)}
                            aria-label={`Save ${displayName} to wishlist`}
                            aria-pressed={inWishlist}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-none px-3 text-sm transition-colors ${inWishlist ? "bg-rose-50 text-rose-600" : "text-zinc-500 hover:bg-zinc-50"}`}
                          >
                            {inWishlist ? <IoHeart className="h-4 w-4" /> : <IoHeartOutline className="h-4 w-4" />}
                            <span>{inWishlist ? "Saved" : "Save"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removeItem(itemId);
                              toast.info("Item removed from cart");
                            }}
                            aria-label={`Remove ${displayName} from cart`}
                            className="flex h-11 w-11 items-center justify-center rounded-none text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <LuTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {openDropdownId === itemId && (
                        <div id={`cart-options-${itemId}`} className="mt-4 min-w-0 rounded-none border border-zinc-200 bg-zinc-50/50 p-4">
                          {loadingProducts[item.productId || ""] ? (
                            <div className="p-4 text-xs text-zinc-500 flex items-center gap-2 justify-center">
                              <LuLoader className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Loading available variants...</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex min-w-0 gap-3 items-center border-b border-zinc-100 pb-3">
                                <div className="w-12 h-12 relative bg-zinc-50 rounded-none overflow-hidden shrink-0 border border-zinc-200">
                                  <Image
                                    src={getMatchedVariantImage(item) || item.image}
                                    alt={item.name}
                                    fill
                                    sizes="48px"
                                    className="object-contain p-1"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-medium text-zinc-800 break-words">
                                    {displayName}
                                  </h4>
                                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                    {getMatchedVariantPrice(item)}
                                  </p>
                                </div>
                              </div>

                              {/* Attribute Groups */}
                              <div className="space-y-3">
                                {Object.entries(getUniqueAttributes(item.productId || "")).map(([attrName, values]) => (
                                  <div key={attrName} className="space-y-1">
                                    <p className="text-[10px] uppercase font-medium text-zinc-400">
                                      {attrName}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {values.map((val) => {
                                        const isSelected = selectedOptions[attrName] === val;
                                        return (
                                          <button
                                            key={val}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() => setSelectedOptions((prev) => ({ ...prev, [attrName]: val }))}
                                            className={`max-w-full break-words min-h-11 px-3 py-2 text-sm rounded-none border transition-all cursor-pointer ${
                                              isSelected
                                                ? "border-store-primary bg-store-surface text-store-primary font-medium"
                                                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                                            }`}
                                          >
                                            {val}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Stock warning */}
                              {isMatchedVariantOutOfStock(item) && (
                                <div className="flex items-center gap-1.5 p-2 bg-amber-50 text-amber-700 text-xs rounded-none">
                                  <IoAlertCircleOutline className="w-4 h-4 shrink-0" />
                                  <span>Sold out in this combination</span>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2 border-t border-zinc-100">
                                <button
                                  type="button"
                                  onClick={() => setOpenDropdownId(null)}
                                  className="flex-1 min-h-11 py-2 text-sm border border-zinc-200 rounded-none text-zinc-600 hover:bg-zinc-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isApplyDisabled(item)}
                                  onClick={() => handleApplyChange(item)}
                                  className="flex-1 min-h-11 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-950 hover:bg-zinc-800 text-white rounded-none disabled:opacity-50 cursor-pointer transition-colors"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Order summary */}
            <section aria-labelledby="order-summary-title" className="min-w-0 self-start rounded-none border border-zinc-200 bg-white p-5 sm:p-6 lg:sticky lg:top-36 shadow-xs">
              <h2 id="order-summary-title" className="text-xl font-bold tracking-tight text-zinc-950">Order summary</h2>

              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700"><LuMapPin className="h-4 w-4 text-zinc-900" /> Delivery location</div>
                <div className="grid gap-2" role="group" aria-label="Delivery location">
                  {([
                    { zone: "dhaka" as const, label: "Inside Dhaka", rate: insideRate },
                    { zone: "outside" as const, label: "Outside Dhaka", rate: outsideRate },
                  ]).map(({ zone, label, rate }) => (
                    <button key={zone} type="button" onClick={() => selectDeliveryZone(zone)} aria-pressed={deliveryZone === zone} className={`flex w-full items-center justify-between gap-3 rounded-none border px-4 py-3 text-left transition-colors cursor-pointer ${deliveryZone === zone ? "border-zinc-950 bg-stone-50" : "border-stone-200 bg-white hover:bg-stone-50"}`}>
                      <span className="flex items-center gap-3 text-sm font-medium text-zinc-900"><span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-none ${deliveryZone === zone ? "bg-zinc-950 text-white" : "border border-stone-300"}`}>{deliveryZone === zone && <LuCheck className="h-3 w-3" />}</span>{label}</span>
                      <span className="shrink-0 text-sm font-semibold text-zinc-950">{rate === 0 ? "Free" : formatCurrency(rate)}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-500">Delivery is confirmed at checkout based on your address.</p>
              </div>

              <div className="mt-5 border-t border-stone-100 pt-4">
                {!appliedCoupon && <button type="button" onClick={() => setPromoOpen(!promoOpen)} aria-expanded={promoOpen} aria-controls={promoOpen && !appliedCoupon ? "cart-promo" : undefined} className="flex w-full items-center justify-between gap-2 py-1 text-left text-sm font-medium text-zinc-900 hover:text-black">
                  <span className="flex items-center gap-2"><LuTag className="h-4 w-4 text-zinc-900" /> Promo code</span>
                  {promoOpen ? <LuChevronUp className="h-4 w-4" /> : <IoChevronDownOutline className="h-4 w-4" />}
                </button>}
                {appliedCoupon ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-none bg-stone-100 p-3 text-sm">
                    <span className="min-w-0 break-all font-medium text-zinc-900">{appliedCoupon.code} applied</span>
                    <button type="button" onClick={handleRemovePromo} className="shrink-0 text-xs font-semibold text-rose-600 hover:underline cursor-pointer">Remove</button>
                  </div>
                ) : promoOpen ? (
                  <form id="cart-promo" onSubmit={handleApplyPromo} className="mt-3 flex min-w-0 gap-2">
                    <input type="text" aria-label="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Enter promo code" className="min-h-11 min-w-0 flex-1 rounded-none border border-stone-200 px-3 text-sm uppercase text-zinc-900" />
                    <button type="submit" disabled={isApplyingPromo || !promoInput.trim()} className="rounded-none bg-zinc-950 px-5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 cursor-pointer">{isApplyingPromo ? "Applying..." : "Apply"}</button>
                  </form>
                ) : null}
              </div>

              <div className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm">
                <div className="flex justify-between gap-4 text-stone-600"><span>Subtotal ({items.reduce((count, item) => count + item.quantity, 0)} {items.reduce((count, item) => count + item.quantity, 0) === 1 ? "item" : "items"})</span><span className="font-semibold text-zinc-900">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between gap-4 text-stone-600"><span>Delivery</span><span className="font-semibold text-zinc-900">{baseShipping === 0 ? "Free" : formatCurrency(baseShipping)}</span></div>
                {promoDiscount > 0 && <div className="flex justify-between gap-4 text-emerald-700"><span>Discount</span><span>−{formatCurrency(promoDiscount)}</span></div>}
                <div className="flex items-baseline justify-between gap-4 border-t border-stone-200 pt-4"><span className="text-base font-bold text-zinc-950">Estimated total</span><span className="text-xl font-extrabold text-zinc-950">{formatCurrency(total)}</span></div>
              </div>

              <button type="button" onClick={() => {
                if (!isAuthenticated) { setShowAuthModal(true); return; }
                clearBuyNowItem();
                router.push("/checkout");
              }} className="mt-6 flex min-h-12 w-full items-center justify-center rounded-none bg-zinc-950 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-zinc-800 shadow-sm cursor-pointer">Proceed to checkout</button>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}
