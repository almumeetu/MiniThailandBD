"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/_providers/cart-provider";
import { getCustomerToken, API_BASE_URL } from "@/lib/storefront-api";
import { fetchShopProductById, fetchShopProductBySlug } from "@/lib/shop-api";
import type { AddressForm, CartItem, OrderResult } from "@/lib/types";

export function usePlaceOrder() {
  const { items, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const placeOrder = async (
    address: AddressForm,
    extra?: {
      paymentMethod?: string;
      orderNote?: string;
      items?: CartItem[];
      addressId?: string;
      couponCode?: string;
      shippingCost?: number;
    }
  ): Promise<OrderResult> => {
    setSubmitting(true);
    const token = getCustomerToken();
    const orderItems = extra?.items ?? items;
    const orderSubtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    try {
      let data: Record<string, unknown>;

      if (token) {
        let addressId = extra?.addressId;

        if (!addressId) {
          const addressRes = await fetch(`${API_BASE_URL}/addresses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fullName: address.fullName,
              phone: address.phone,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2 || undefined,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode?.trim() || undefined,
              country: address.country,
              isDefault: true,
            }),
          });

          if (!addressRes.ok) {
            const err = await addressRes.json().catch(() => ({}));
            throw new Error((err as { message?: string }).message ?? "Failed to save address");
          }

          const savedAddress = (await addressRes.json()) as { id: string };
          addressId = savedAddress.id;
        }

        const orderRes = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            addressId,
            couponCode: extra?.couponCode || undefined,
            shippingCost: extra?.shippingCost ?? 0,
            orderNote: extra?.orderNote || undefined,
            items: extra?.items
              ? extra.items.map((i) => ({
                  variantId: i.variantId,
                  quantity: i.quantity,
                }))
              : undefined,
          }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message ?? "Failed to place order");
        }

        data = await orderRes.json();
      } else {
        // Auto-resolve missing variant IDs so guest checkout never fails
        const lineItems = await Promise.all(
          orderItems.map(async (i) => {
            let variantId = i.variantId;
            if (!variantId && (i.productId || i.id || i.slug)) {
              try {
                const targetId = i.productId || i.id;
                if (targetId) {
                  const prod = await fetchShopProductById(targetId);
                  const def = prod?.variants?.find((v) => v.isDefault) ?? prod?.variants?.[0];
                  if (def?.id) variantId = def.id;
                }
                if (!variantId && i.slug) {
                  const prod = await fetchShopProductBySlug(i.slug);
                  const def = prod?.variants?.find((v) => v.isDefault) ?? prod?.variants?.[0];
                  if (def?.id) variantId = def.id;
                }
              } catch {
                // ignore
              }
            }
            if (!variantId) {
              throw new Error(`Missing product variant for "${i.name}". Please re-add the item to cart.`);
            }
            return { variantId, quantity: i.quantity };
          })
        );

        const res = await fetch(`${API_BASE_URL}/orders/guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: {
              email: address.email?.trim() || undefined,
              fullName: address.fullName,
              phone: address.phone,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2 || undefined,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode?.trim() || undefined,
              country: address.country,
            },
            items: lineItems,
            couponCode: extra?.couponCode || undefined,
            shippingCost: extra?.shippingCost ?? 0,
            orderNote: extra?.orderNote || undefined,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message ?? "Failed to place order");
        }

        data = await res.json();
      }

      const totalAmount = data.total != null ? Number(data.total) : (orderSubtotal + (extra?.shippingCost ?? 0));
      const orderShipping = Number(data.shippingCost ?? extra?.shippingCost ?? 0);
      const orderDiscount = Number(data.discount ?? 0);

      const result: OrderResult = {
        id: typeof data.id === "string" ? data.id : undefined,
        orderNumber: (data.orderNumber ?? data.id ?? "N/A") as string,
        total: totalAmount,
        subtotal: orderSubtotal,
        shippingCost: orderShipping,
        discount: orderDiscount,
        couponCode: extra?.couponCode,
        items: orderItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
        })),
        address: { ...address },
        paymentMethod: extra?.paymentMethod,
        orderNote: extra?.orderNote,
      };

      if (!extra?.items) clearCart();

      if (extra?.paymentMethod === "bkash") {
        if (!result.id) {
          throw new Error("The order was created without an ID, so bKash payment cannot start.");
        }
        const paymentRes = await fetch(`${API_BASE_URL}/payments/bkash/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: result.id }),
        });
        const paymentData = (await paymentRes.json().catch(() => ({}))) as {
          bkashURL?: string;
          message?: string | string[];
        };
        if (!paymentRes.ok || !paymentData.bkashURL) {
          const message = Array.isArray(paymentData.message)
            ? paymentData.message.join(", ")
            : paymentData.message;
          throw new Error(message || "Unable to start bKash payment");
        }
        result.paymentUrl = paymentData.bkashURL;
      }

      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("applied_coupon");
        } catch {}
      }

      try {
        await fetch("/api/resend/order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
      } catch (notifyErr) {
        console.error("Order confirmation email failed:", notifyErr);
      }

      toast.success("Order placed successfully!");
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { placeOrder, submitting };
}
