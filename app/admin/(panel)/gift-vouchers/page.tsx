"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { apiRequest, formatDate, type Coupon } from "../../../../lib/admin-api";

type VoucherForm = {
  id?: string;
  code: string;
  value: string;
  maxUsage: string;
  expiresAt: string;
};

const emptyForm: VoucherForm = { code: "", value: "", maxUsage: "1", expiresAt: "" };

function voucherStatus(coupon: Coupon) {
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) return "Expired";
  if (coupon.usedCount >= coupon.maxUsage) return "Redeemed";
  return "Active";
}

function dateInputValue(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function GiftVouchersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<VoucherForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Coupon | null>(null);
  const [error, setError] = useState("");

  const vouchers = useMemo(
    () => coupons
      .filter((coupon) => coupon.type === "fixed")
      .filter((coupon) => coupon.code.toLowerCase().includes(search.trim().toLowerCase())),
    [coupons, search],
  );

  async function loadVouchers() {
    setIsLoading(true);
    setError("");
    try {
      setCoupons(await apiRequest<Coupon[]>("/coupons"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gift vouchers");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadVouchers(); }, []);

  function openAddModal() {
    setError("");
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(coupon: Coupon) {
    setError("");
    setForm({
      id: coupon.id,
      code: coupon.code,
      value: String(coupon.value),
      maxUsage: String(coupon.maxUsage),
      expiresAt: dateInputValue(coupon.expiresAt),
    });
    setIsModalOpen(true);
  }

  async function saveVoucher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const expiresAt = form.expiresAt
        ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
        : form.id
          ? null
          : undefined;
      await apiRequest<Coupon>(form.id ? `/coupons/${form.id}` : "/coupons", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          type: "fixed",
          value: Number(form.value),
          maxUsage: Number(form.maxUsage),
          expiresAt,
        }),
      });
      setIsModalOpen(false);
      setForm(emptyForm);
      await loadVouchers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save gift voucher");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteVoucher() {
    if (!voucherToDelete) return;
    setError("");
    try {
      await apiRequest(`/coupons/${voucherToDelete.id}`, { method: "DELETE" });
      setVoucherToDelete(null);
      await loadVouchers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete gift voucher");
    }
  }

  return (
    <>
      <PageHeader
        title="Gift Vouchers"
        description="Issue and track fixed-value vouchers using the store coupon API."
        action={
          <button
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={openAddModal}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="plus" /> Add Voucher
          </button>
        }
      />

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Gift voucher list</h2>
            <p className="mt-1 text-sm text-slate-500">{vouchers.length} fixed-value voucher{vouchers.length === 1 ? "" : "s"}</p>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 px-3 sm:max-w-xs">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input className="w-full bg-transparent text-sm outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search voucher code" value={search} />
          </label>
        </div>

        {error && !isModalOpen && (
          <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50">
              <tr>{["Voucher code", "Value", "Redemptions", "Expires", "Status", "Actions"].map((heading) => (
                <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={heading}>{heading}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={6}>Loading vouchers...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={6}>{search ? "No matching vouchers." : "No fixed-value vouchers yet."}</td></tr>
              ) : vouchers.map((coupon) => {
                const status = voucherStatus(coupon);
                return (
                  <tr className="odd:bg-white even:bg-slate-50/50" key={coupon.id}>
                    <td className="px-5 py-4 font-bold text-slate-900">{coupon.code}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">৳{Number(coupon.value).toLocaleString("en-BD", { maximumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{coupon.usedCount} / {coupon.maxUsage}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{coupon.expiresAt ? formatDate(coupon.expiresAt) : "No expiry"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button aria-label={`Edit ${coupon.code}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => openEditModal(coupon)} type="button">
                          <AdminIcon className="h-4 w-4" name="edit" />
                        </button>
                        <button aria-label={`Delete ${coupon.code}`} className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50" onClick={() => setVoucherToDelete(coupon)} type="button">
                          <AdminIcon className="h-4 w-4" name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="voucher-modal-title">
          <form className="w-full max-w-lg rounded-xl bg-white shadow-2xl" onSubmit={saveVoucher}>
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="font-bold text-slate-900" id="voucher-modal-title">{form.id ? "Edit gift voucher" : "Add gift voucher"}</h3>
                <p className="mt-1 text-xs text-slate-500">Fixed-value voucher redeemed as a store coupon.</p>
              </div>
              <button aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setIsModalOpen(false)} type="button">
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Voucher code</span>
                <input autoFocus className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm uppercase" minLength={3} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} required value={form.code} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Value (BDT)</span>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" min="0.01" onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} required step="0.01" type="number" value={form.value} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Maximum redemptions</span>
                  <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" min="1" onChange={(event) => setForm((current) => ({ ...current, maxUsage: event.target.value }))} required step="1" type="number" value={form.maxUsage} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Expiry date (optional)</span>
                  <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} type="date" value={form.expiresAt} />
                </label>
              </div>
              {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700" disabled={isSaving} onClick={() => setIsModalOpen(false)} type="button">Cancel</button>
              <button className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:bg-slate-300" disabled={isSaving} type="submit">{isSaving ? "Saving..." : form.id ? "Save changes" : "Create voucher"}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!voucherToDelete}
        onClose={() => setVoucherToDelete(null)}
        onConfirm={deleteVoucher}
        title="Delete gift voucher"
        message={`Delete voucher "${voucherToDelete?.code}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        error={error}
      />
    </>
  );
}
