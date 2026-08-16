"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Dialog({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl",
        )}
      >
        <h2 id="dialog-title" className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-slate-600">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="drawer-title" className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
