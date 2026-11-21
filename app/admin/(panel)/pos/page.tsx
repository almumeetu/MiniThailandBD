"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { useCurrency } from "../../../../lib/currency-context";
import {
  apiRequest,
  resolveImageUrl,
  type Order,
  type PaginatedProducts,
  type Product,
  type ProductVariant,
} from "../../../../lib/admin-api";

type PosCartItem = {
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  stockQuantity: number;
  unitPrice: number;
};

const PAGE_SIZE = 24;

function money(value: number, symbol: string) {
  return `${symbol}${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function variantLabel(variant: ProductVariant) {
  const attributes = variant.attributes
    ?.map(({ attributeValue }) => `${attributeValue.attribute.name}: ${attributeValue.value}`)
    .join(" · ");
  return attributes ? `${variant.sku} · ${attributes}` : variant.sku;
}

function selectedVariantFor(
  product: Product,
  selectedIds: Record<string, string>,
): ProductVariant | undefined {
  const variants = product.variants ?? [];
  const selected = variants.find((variant) => variant.id === selectedIds[product.id]);
  return selected ?? variants.find((variant) => variant.isDefault && variant.stockQuantity > 0)
    ?? variants.find((variant) => variant.stockQuantity > 0)
    ?? variants[0];
}

export default function PosPage() {
  const { symbol } = useCurrency();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState("Walk-in customer");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bkash" | "card" | "other">("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">("paid");
  const [orderNote, setOrderNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError("");

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), status: "active" });
      if (search.trim()) params.set("search", search.trim());

      void apiRequest<PaginatedProducts>(`/products?${params.toString()}`)
        .then((response) => {
          if (currentRequest !== requestId.current) return;
          setProducts(response.data);
          setTotalProducts(response.meta.total);
        })
        .catch((err) => {
          if (currentRequest !== requestId.current) return;
          setProducts([]);
          setTotalProducts(0);
          setError(err instanceof Error ? err.message : "Failed to load products");
        })
        .finally(() => {
          if (currentRequest === requestId.current) setIsLoading(false);
        });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [page, reloadVersion, search]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );
  const pageCount = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  function addToCart(product: Product, variant: ProductVariant | undefined) {
    if (!variant || variant.stockQuantity < 1) return;

    setError("");
    setLastOrderNumber("");
    const currentQuantity = cart.find((item) => item.variantId === variant.id)?.quantity ?? 0;
    if (currentQuantity >= variant.stockQuantity) {
      setError(`Only ${variant.stockQuantity} unit(s) are available for ${variant.sku}.`);
      return;
    }

    const line: PosCartItem = {
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantLabel: variantLabel(variant),
      sku: variant.sku,
      quantity: currentQuantity + 1,
      stockQuantity: variant.stockQuantity,
      unitPrice: Number(variant.price),
    };
    setCart((current) => {
      const exists = current.some((item) => item.variantId === variant.id);
      return exists
        ? current.map((item) => (item.variantId === variant.id ? line : item))
        : [...current, line];
    });
  }

  function changeQuantity(variantId: string, change: number) {
    const item = cart.find((line) => line.variantId === variantId);
    if (!item) return;

    const quantity = item.quantity + change;
    if (quantity > item.stockQuantity) {
      setError(`Only ${item.stockQuantity} unit(s) are available for ${item.sku}.`);
      return;
    }

    setError("");
    setCart((current) => current.flatMap((line) => {
      if (line.variantId !== variantId) return [line];
      return quantity <= 0 ? [] : [{ ...line, quantity }];
    }));
  }

  async function completeSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length) {
      setError("Add at least one product before checkout.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const order = await apiRequest<Order>("/orders/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "Walk-in customer",
          phone: phone.trim() || undefined,
          paymentMethod,
          paymentStatus,
          orderNote: orderNote.trim() || undefined,
          items: cart.map(({ variantId, quantity }) => ({ variantId, quantity })),
        }),
      });

      setLastOrderNumber(order.orderNumber);
      setCart([]);
      setPhone("");
      setOrderNote("");
      setPage(1);
      setReloadVersion((version) => version + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete sale");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="POS" description="Create in-store sales from live product and stock data." />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <label className="mb-5 flex h-12 items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search product name or scan SKU"
              value={search}
            />
          </label>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          {isLoading ? (
            <p className="py-12 text-center text-sm font-medium text-slate-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="py-12 text-center text-sm font-medium text-slate-500">No active products found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => {
                const variant = selectedVariantFor(product, selectedVariantIds);
                const variants = product.variants ?? [];
                const image = product.media?.find((media) => media.isFeatured)?.media.url ?? product.media?.[0]?.media.url;
                return (
                  <article className="rounded-xl border border-slate-200 p-4" key={product.id}>
                    <div className="flex gap-3">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resolveImageUrl(image)} alt="" className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
                      ) : (
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                          <AdminIcon className="h-5 w-5 text-slate-400" name="package" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-sm font-bold text-slate-900">{product.name}</h2>
                        <p className="mt-1 text-xs text-slate-500">{product.brand?.name ?? ""}{product.category?.name ? ` · ${product.category.name}` : ""}</p>
                      </div>
                    </div>

                    <label className="mt-4 block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">Variant / SKU</span>
                      <select
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 disabled:bg-slate-50"
                        disabled={variants.length === 0}
                        onChange={(event) => setSelectedVariantIds((current) => ({ ...current, [product.id]: event.target.value }))}
                        value={variant?.id ?? ""}
                      >
                        {variants.length === 0 ? (
                          <option value="">No variants</option>
                        ) : variants.map((option) => (
                          <option disabled={option.stockQuantity < 1} key={option.id} value={option.id}>
                            {variantLabel(option)}{option.stockQuantity < 1 ? " · Out of stock" : ` · Stock ${option.stockQuantity}`}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">{money(Number(variant?.price ?? 0), symbol)}</p>
                        <p className="text-xs text-slate-500">Stock: {variant?.stockQuantity ?? 0}</p>
                      </div>
                      <button
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        disabled={!variant || variant.stockQuantity < 1}
                        onClick={() => addToCart(product, variant)}
                        type="button"
                      >
                        <AdminIcon className="h-4 w-4" name="plus" /> Add
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">{totalProducts.toLocaleString()} active products</span>
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >Previous</button>
              <span className="text-xs font-semibold text-slate-500">{page} / {pageCount}</span>
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40"
                disabled={page >= pageCount || isLoading}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                type="button"
              >Next</button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-xl bg-white p-5 shadow-sm xl:sticky xl:top-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Current sale</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{cart.length} items</span>
          </div>

          {lastOrderNumber && (
            <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              Sale saved: {lastOrderNumber}
            </p>
          )}

          {cart.length === 0 ? (
            <p className="mt-8 rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">Add products to start a sale.</p>
          ) : (
            <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div className="rounded-lg border border-slate-100 p-3" key={item.variantId}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold text-slate-800">{item.productName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{item.variantLabel}</p>
                    </div>
                    <button
                      aria-label={`Remove ${item.productName}`}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setCart((current) => current.filter((line) => line.variantId !== item.variantId))}
                      type="button"
                    >
                      <AdminIcon className="h-4 w-4" name="trash" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex h-8 items-center rounded-md border border-slate-200">
                      <button aria-label="Decrease quantity" className="h-7 w-8 text-slate-600" onClick={() => changeQuantity(item.variantId, -1)} type="button">−</button>
                      <span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span>
                      <button aria-label="Increase quantity" className="h-7 w-8 text-slate-600" onClick={() => changeQuantity(item.variantId, 1)} type="button">+</button>
                    </div>
                    <span className="text-sm font-bold">{money(item.unitPrice * item.quantity, symbol)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{money(subtotal, symbol)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{money(0, symbol)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-900"><span>Total</span><span>{money(subtotal, symbol)}</span></div>
          </div>

          <form className="mt-5 space-y-3 border-t border-slate-100 pt-4" onSubmit={completeSale}>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Customer</span>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" onChange={(event) => setCustomerName(event.target.value)} value={customerName} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Phone (optional)</span>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" onChange={(event) => setPhone(event.target.value)} type="tel" value={phone} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">Payment method</span>
                <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm" onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)} value={paymentMethod}>
                  <option value="cash">Cash</option><option value="bkash">bKash</option><option value="card">Card</option><option value="other">Other</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">Payment status</span>
                <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm" onChange={(event) => setPaymentStatus(event.target.value as typeof paymentStatus)} value={paymentStatus}>
                  <option value="paid">Paid</option><option value="unpaid">Due</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Note (optional)</span>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" onChange={(event) => setOrderNote(event.target.value)} value={orderNote} />
            </label>
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!cart.length || isSaving}
              type="submit"
            >
              {isSaving ? "Saving sale..." : "Complete sale"}
            </button>
          </form>
        </aside>
      </section>
    </>
  );
}
