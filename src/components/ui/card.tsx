import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-6 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-base font-semibold text-slate-900", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm leading-relaxed text-slate-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6 pt-3", className)} {...props} />;
}
