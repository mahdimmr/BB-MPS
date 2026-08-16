"use client";

import type { ReactNode } from "react";

import { AgreementForm } from "@/components/pms/agreement-form";
import { CycleNav } from "@/components/pms/cycle-nav";
import { DashboardTab } from "@/components/pms/dashboard-tab";
import { EvaluationSuite } from "@/components/pms/evaluation-suite";
import { Header } from "@/components/pms/header";
import { MidTermPanel } from "@/components/pms/mid-term-panel";
import { OneOnOneTracker } from "@/components/pms/one-on-one-tracker";
import { PipTracker } from "@/components/pms/pip-tracker";
import { RoleSwitcher } from "@/components/pms/role-switcher";
import type { AppLocale, Dictionary } from "@/lib/i18n";
import { PmsProvider, usePms } from "@/lib/pms/context";

export function PmsApp({
  locale,
  t,
  localeSwitch,
}: {
  locale: AppLocale;
  t: Dictionary;
  localeSwitch: ReactNode;
}) {
  return (
    <PmsProvider locale={locale} t={t}>
      <PmsShell localeSwitch={localeSwitch} />
    </PmsProvider>
  );
}

function PmsShell({ localeSwitch }: { localeSwitch: ReactNode }) {
  const { tab } = usePms();

  return (
    <div className="min-h-screen">
      <RoleSwitcher />
      <Header localeSwitch={localeSwitch} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <CycleNav />

        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-900/5 sm:p-6">
          {tab === "dashboard" ? <DashboardTab /> : null}
          {tab === "agreement" ? <AgreementForm /> : null}
          {tab === "oneOnOne" ? <OneOnOneTracker /> : null}
          {tab === "midTerm" ? <MidTermPanel /> : null}
          {tab === "evaluation" ? <EvaluationSuite /> : null}
          {tab === "pip" ? <PipTracker /> : null}
        </section>
      </main>
    </div>
  );
}
