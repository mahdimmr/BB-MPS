"use client";

import {
  ClipboardCheck,
  FileSignature,
  Flag,
  HeartHandshake,
  LayoutDashboard,
  MessagesSquare,
} from "lucide-react";

import { usePms } from "@/lib/pms/context";
import { TABS, type TabId } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

const TAB_ICON: Record<TabId, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  agreement: FileSignature,
  oneOnOne: MessagesSquare,
  midTerm: Flag,
  evaluation: ClipboardCheck,
  pip: HeartHandshake,
};

export function CycleNav() {
  const { tab, setTab, t, pipTriggered, agreementStatus, midTermStatus } = usePms();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1" aria-label={t.cycle.title}>
      {TABS.map((id) => {
        const Icon = TAB_ICON[id];
        const active = tab === id;
        const pipPulse = id === "pip" && pipTriggered;
        const amended = id === "agreement" && agreementStatus === "AMENDMENT_IN_PROGRESS";
        const flagged = id === "midTerm" && midTermStatus === "PERFORMANCE_RISK";

        return (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900",
            )}
          >
            <Icon className="size-4" />
            {t.ui.tabs[id]}
            {pipPulse || amended || flagged ? (
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  active ? "bg-white" : pipPulse || flagged ? "bg-rose-500" : "bg-candor-500",
                )}
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
