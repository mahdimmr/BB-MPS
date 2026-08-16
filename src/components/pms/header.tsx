"use client";

import type { ReactNode } from "react";

import { RoleHint } from "@/components/pms/role-switcher";
import { Badge } from "@/components/ui/badge";
import { usePms } from "@/lib/pms/context";
import { CYCLE, SUBJECT } from "@/lib/pms/mock-data";

export function Header({ localeSwitch }: { localeSwitch: ReactNode }) {
  const { t, loc, agreementStatus, pipTriggered } = usePms();

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              BB
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">{t.app.name}</p>
              <p className="text-xs text-slate-500">{t.app.shortName}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{CYCLE.title}</Badge>
            <Badge tone={agreementStatus === "APPROVED" ? "success" : "neutral"}>
              {t.agreement.status[agreementStatus]}
            </Badge>
            {pipTriggered ? <Badge tone="support">{t.pip.title}</Badge> : null}
            {localeSwitch}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{t.ui.subject}</p>
            <p className="text-base font-semibold text-slate-900">{loc(SUBJECT.name)}</p>
            <p className="text-sm text-slate-500">
              {loc(SUBJECT.title)} · {loc(SUBJECT.department)}
            </p>
          </div>
          <RoleHint />
        </div>
      </section>
    </>
  );
}
