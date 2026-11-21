"use client";

import { AdminIcon } from "./admin-shell";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  error?: string | null;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  error,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="modal-panel w-full max-w-md rounded-[6px] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800" id="confirm-modal-title">
              {title}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {message}
            </p>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-[6px] border border-slate-300 text-xl font-medium text-slate-600 cursor-pointer hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            type="button"
            disabled={isLoading}
          >
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-[6px] bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="h-11 rounded-[6px] border-2 border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            type="button"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`inline-flex h-11 items-center gap-2 rounded-[6px] px-5 text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={onConfirm}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isDestructive ? "Deleting..." : "Processing..."}</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
