import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "border-slate-200 bg-slate-50 text-slate-700",
        brand: "border-brand-200 bg-brand-50 text-brand-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        /// Used for "needs improvement" — supportive amber, never alarming red.
        support: "border-amber-200 bg-amber-50 text-amber-700",
        critical: "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
