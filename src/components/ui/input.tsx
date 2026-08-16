import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-slate-600", className)} {...props} />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldClass, "min-h-24 resize-y leading-relaxed", className)} {...props} />;
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
