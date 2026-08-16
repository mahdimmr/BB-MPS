import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700",
        secondary: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        ghost: "text-slate-700 hover:bg-slate-100",
        success: "bg-achievement-600 text-white hover:bg-achievement-700",
        warning: "bg-candor-600 text-white hover:bg-candor-700",
        danger: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
