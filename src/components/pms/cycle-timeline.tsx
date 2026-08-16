"use client";

import { Check } from "lucide-react";

import { usePms } from "@/lib/pms/context";
import { formatDate } from "@/lib/i18n/config";
import { CYCLE } from "@/lib/pms/mock-data";
import { cn } from "@/lib/utils";

export function CycleTimeline() {
  const { t, locale, agreementStatus, meetings, midTermStatus, calibrated } = usePms();

  const steps = [
    {
      key: "month1" as const,
      hint: t.ui.timeline.month1Hint,
      date: CYCLE.goalDeadline,
      done: agreementStatus === "APPROVED" || agreementStatus === "AMENDMENT_IN_PROGRESS",
    },
    {
      key: "month2" as const,
      hint: t.ui.timeline.month2Hint,
      date: CYCLE.midTerm,
      done: meetings.length >= 2 || midTermStatus !== null,
    },
    {
      key: "month2End" as const,
      hint: t.ui.timeline.month2EndHint,
      date: CYCLE.midTerm,
      done: midTermStatus !== null,
    },
    {
      key: "month4" as const,
      hint: t.ui.timeline.month4Hint,
      date: CYCLE.finalStart,
      done: calibrated,
    },
  ];

  const currentIndex = steps.findIndex((step) => !step.done);

  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const current = currentIndex === index || (currentIndex === -1 && index === steps.length - 1);
        return (
          <li
            key={step.key}
            className={cn(
              "relative rounded-2xl border p-4",
              step.done
                ? "border-achievement-200 bg-achievement-50"
                : current
                  ? "border-brand-300 bg-white shadow-sm"
                  : "border-slate-200 bg-white/70",
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-semibold",
                  step.done
                    ? "bg-achievement-600 text-white"
                    : current
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-500",
                )}
              >
                {step.done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className="text-[11px] text-slate-500">{formatDate(step.date, locale)}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{t.ui.timeline[step.key]}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.hint}</p>
          </li>
        );
      })}
    </ol>
  );
}
