"use client";

import {
  ClipboardCheck,
  FileSignature,
  Flag,
  GraduationCap,
  HeartHandshake,
  MessagesSquare,
  Sparkles,
} from "lucide-react";

import { CycleTimeline } from "@/components/pms/cycle-timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePms } from "@/lib/pms/context";
import { CYCLE, SUBJECT } from "@/lib/pms/mock-data";
import type { TabId } from "@/lib/pms/types";
import { formatDate } from "@/lib/i18n/config";

type ActionCard = {
  id: string;
  title: string;
  tab: TabId;
  icon: typeof FileSignature;
  show: boolean;
};

export function DashboardTab() {
  const pms = usePms();
  const { t, locale, loc, setTab, role, agreementStatus, dottedConsulted, selfSubmitted, calibrated, pipTriggered, pipStatus, midTermStatus } =
    pms;

  const actions = (
    [
      {
        id: "sign",
        title: t.ui.pending.signAgreement,
        tab: "agreement",
        icon: FileSignature,
        show: agreementStatus !== "APPROVED" && (role === "EMPLOYEE" || role === "SOLID_LEAD"),
      },
      {
        id: "dotted",
        title: t.ui.pending.dottedFeedback,
        tab: "agreement",
        icon: GraduationCap,
        show: !dottedConsulted && (role === "DOTTED_LEAD" || role === "HR_ADMIN"),
      },
      {
        id: "log",
        title: t.ui.pending.logOneOnOne,
        tab: "oneOnOne",
        icon: MessagesSquare,
        show: role === "EMPLOYEE" || role === "SOLID_LEAD",
      },
      {
        id: "mid",
        title: t.ui.pending.reviewMidTerm,
        tab: "midTerm",
        icon: Flag,
        show: (role === "SOLID_LEAD" || role === "HR_ADMIN") && midTermStatus !== "ON_TRACK",
      },
      {
        id: "self",
        title: t.ui.pending.completeSelfEval,
        tab: "evaluation",
        icon: ClipboardCheck,
        show: role === "EMPLOYEE" && !selfSubmitted,
      },
      {
        id: "cal",
        title: t.ui.pending.calibrate,
        tab: "evaluation",
        icon: Sparkles,
        show: role === "HR_ADMIN" && !calibrated,
      },
      {
        id: "pip",
        title: t.ui.pending.pipAuthorize,
        tab: "pip",
        icon: HeartHandshake,
        show: pipTriggered && pipStatus === "PENDING_COMMITTEE" && role === "HR_ADMIN",
      },
    ] satisfies ActionCard[]
  ).filter((action) => action.show);

  const phaseLabel =
    agreementStatus !== "APPROVED" && agreementStatus !== "AMENDMENT_IN_PROGRESS"
      ? t.cycle.phase.GOAL_SETTING
      : midTermStatus === null
        ? t.cycle.phase.EXECUTION
        : calibrated
          ? t.cycle.phase.CALIBRATION
          : t.cycle.phase.FINAL_EVALUATION;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{t.cycle.duration}</Badge>
        <Badge tone="neutral">
          {t.ui.cycleLabel}: {CYCLE.title}
        </Badge>
        <Badge tone={midTermStatus === "PERFORMANCE_RISK" ? "critical" : "success"}>{phaseLabel}</Badge>
      </div>

      <CycleTimeline />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.ui.quickActions}</CardTitle>
            <CardDescription>
              {loc(SUBJECT.name)} · {loc(SUBJECT.title)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {actions.length === 0 ? (
              <p className="text-sm text-slate-500">{t.common.empty}</p>
            ) : (
              actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setTab(action.tab)}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-start transition-colors hover:border-brand-200 hover:bg-white"
                  >
                    <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-800">{action.title}</span>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.ui.pillars.wisdom} · {t.ui.pillars.achievement} · {t.ui.pillars.candor}</CardTitle>
            <CardDescription>{t.app.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Pillar label={t.ui.pillars.wisdom} hint={t.ui.pillars.wisdomHint} className="border-brand-200 bg-brand-50 text-brand-800" />
            <Pillar label={t.ui.pillars.achievement} hint={t.ui.pillars.achievementHint} className="border-achievement-200 bg-achievement-50 text-achievement-800" />
            <Pillar label={t.ui.pillars.candor} hint={t.ui.pillars.candorHint} className="border-candor-200 bg-candor-50 text-candor-800" />
            <p className="text-xs text-slate-500">
              {t.cycle.goalSettingDeadline}: {formatDate(CYCLE.goalDeadline, locale)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Pillar({ label, hint, className }: { label: string; hint: string; className: string }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-xs opacity-80">{hint}</p>
    </div>
  );
}
