"use client";

import { Check, HeartHandshake, LogOut } from "lucide-react";

import { Notice, SectionHeading } from "@/components/pms/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { can, usePms } from "@/lib/pms/context";
import { cn } from "@/lib/utils";

export function PipTracker() {
  const pms = usePms();
  const {
    t,
    loc,
    role,
    pipTriggered,
    pipStatus,
    pipDuration,
    pipCheckpoints,
    pipObjectives,
    authorizePip,
    setPipDuration,
    toggleCheckpoint,
    togglePipObjective,
    setPipOutcome,
  } = pms;

  if (!pipTriggered) {
    return (
      <div className="space-y-4">
        <SectionHeading title={t.pip.title} description={t.pip.supportiveFraming} />
        <Notice tone="brand">{t.ui.pip.inactive}</Notice>
      </div>
    );
  }

  const active = pipStatus === "ACTIVE";
  const closed = pipStatus === "SUCCESS_RETURNED" || pipStatus === "FAILED_TERMINATED";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeading title={t.pip.title} description={t.pip.supportiveFraming} />
        <Badge tone={pipStatus === "PENDING_COMMITTEE" ? "support" : pipStatus === "ACTIVE" ? "success" : pipStatus === "SUCCESS_RETURNED" ? "success" : "critical"}>
          {pipStatus === "PENDING_COMMITTEE" ? t.ui.pip.awaiting : pipStatus === "ACTIVE" ? t.ui.pip.approvedActive : t.pip.status[pipStatus]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.ui.pip.durationStepper}</CardTitle>
          <CardDescription>{t.pip.duration}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {([1, 2] as const).map((months) => (
              <button
                key={months}
                type="button"
                disabled={closed || (!can(role, "pipAuthorize") && !can(role, "pipCoach"))}
                onClick={() => setPipDuration(months)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium",
                  pipDuration === months ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                )}
              >
                {months === 1 ? t.ui.pip.month1 : t.ui.pip.month2}
              </button>
            ))}
          </div>
          <ol className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {pipCheckpoints.map((done, index) => (
              <li key={index}>
                <button
                  type="button"
                  disabled={!active || !can(role, "pipCoach")}
                  onClick={() => toggleCheckpoint(index)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px]",
                    done
                      ? "border-achievement-300 bg-achievement-50 text-achievement-800"
                      : "border-slate-200 bg-white text-slate-500",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full",
                      done ? "bg-achievement-600 text-white" : "bg-slate-100",
                    )}
                  >
                    {done ? <Check className="size-3" /> : index + 1}
                  </span>
                  {t.ui.pip.week} {index + 1}
                </button>
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-500">{t.ui.pip.weeklyCheckpoint}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.ui.pip.smartBoard}</CardTitle>
          <CardDescription>{t.pip.objectives}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {pipObjectives.map((objective) => (
            <label
              key={objective.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3",
                objective.done ? "border-achievement-200 bg-achievement-50" : "border-slate-200 bg-white",
              )}
            >
              <input
                type="checkbox"
                className="mt-1 size-4 accent-achievement-600"
                checked={objective.done}
                disabled={!active || !can(role, "pipCoach")}
                onChange={() => togglePipObjective(objective.id)}
              />
              <span className="text-sm text-slate-800">{loc(objective.title)}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {pipStatus === "PENDING_COMMITTEE" && can(role, "pipAuthorize") ? (
          <Button onClick={authorizePip}>{t.ui.pip.authorize}</Button>
        ) : null}
        {active && can(role, "pipOutcome") ? (
          <>
            <Button variant="success" onClick={() => setPipOutcome("SUCCESS_RETURNED")}>
              <HeartHandshake className="size-4" />
              {t.ui.pip.successfulExit}
            </Button>
            <Button variant="danger" onClick={() => setPipOutcome("FAILED_TERMINATED")}>
              <LogOut className="size-4" />
              {t.ui.pip.initiateExit}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
