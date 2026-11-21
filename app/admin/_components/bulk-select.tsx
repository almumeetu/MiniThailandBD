"use client";

import React, { useEffect, useRef } from "react";
import { AdminIcon } from "./admin-shell";

export interface TableCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
  className?: string;
}

export function TableCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  title,
  "aria-label": ariaLabel,
  className = "",
}: TableCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = !checked && indeterminate;
    }
  }, [checked, indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      onClick={(e) => e.stopPropagation()}
      className={`h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    />
  );
}

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount?: number;
  onClear: () => void;
  onSelectAll?: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  itemLabel?: string;
  itemLabelPlural?: string;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onClear,
  onSelectAll,
  onDelete,
  isDeleting = false,
  itemLabel = "item",
  itemLabelPlural = "items",
}: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  const noun = selectedCount === 1 ? itemLabel : itemLabelPlural;
  const canSelectAll =
    Boolean(onSelectAll) &&
    typeof totalCount === "number" &&
    totalCount > selectedCount;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xl backdrop-blur-md">
        {/* Left: count + select all + clear */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/70">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              {selectedCount} {noun} selected
            </span>
          </span>

          {canSelectAll && (
            <button
              type="button"
              onClick={onSelectAll}
              disabled={isDeleting}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors disabled:opacity-50"
            >
              Select all {totalCount}
            </button>
          )}

          <button
            type="button"
            onClick={onClear}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Deselect all"
          >
            <AdminIcon name="x" className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right: Delete button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <AdminIcon name="trash" className="h-4 w-4" />
                <span>Delete Selected ({selectedCount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

