"use client";

import { LOCALES, type AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LocaleSwitch({
  locale,
  labels,
  onChange,
}: {
  locale: AppLocale;
  labels: Record<AppLocale, string>;
  onChange: (locale: AppLocale) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1"
      role="group"
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === locale}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            option === locale ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100",
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
