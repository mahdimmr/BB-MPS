import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { MetricLayer } from "@/lib/pms/types";

export function Notice({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "success" | "support" | "critical" }) {
  const tones = {
    brand: "border-brand-200 bg-brand-50 text-brand-800",
    success: "border-achievement-200 bg-achievement-50 text-achievement-700",
    support: "border-candor-200 bg-candor-50 text-candor-700",
    critical: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <div className={cn("rounded-xl border px-3 py-2 text-sm leading-relaxed", tones[tone])}>{children}</div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p> : null}
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p> : null}
    </div>
  );
}

const LAYER_BAR: Record<MetricLayer, string> = {
  STRATEGIC: "border-s-brand-500",
  OPERATIONAL: "border-s-achievement-500",
  DEVELOPMENTAL: "border-s-candor-500",
};

export function LayerCard({
  layer,
  children,
  className,
}: {
  layer: MetricLayer;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 border-s-4",
        LAYER_BAR[layer],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RangeSlider({
  value,
  min = 1,
  max = 5,
  disabled,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={1}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 disabled:cursor-not-allowed"
    />
  );
}
