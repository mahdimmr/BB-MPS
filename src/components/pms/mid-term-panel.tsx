"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

import { Notice, SectionHeading } from "@/components/pms/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { can, usePms } from "@/lib/pms/context";
import type { MidTermStatus } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

const PATHS: {
  status: MidTermStatus;
  icon: typeof CheckCircle2;
  tone: "success" | "support" | "critical";
}[] = [
  { status: "ON_TRACK", icon: CheckCircle2, tone: "success" },
  { status: "AMENDMENT_NEEDED", icon: RefreshCw, tone: "support" },
  { status: "PERFORMANCE_RISK", icon: AlertTriangle, tone: "critical" },
];

export function MidTermPanel() {
  const pms = usePms();
  const { t, role, meetings, midTermStatus, midTermFeedback, midTermAcknowledged, setTab } = pms;
  const allowed = can(role, "midTermDecide");
  const [selected, setSelected] = useState<MidTermStatus | null>(midTermStatus);
  const [feedback, setFeedback] = useState(midTermFeedback);
  const [riskOpen, setRiskOpen] = useState(false);

  const confirm = (status: MidTermStatus) => {
    if (status === "PERFORMANCE_RISK") {
      setRiskOpen(true);
      return;
    }
    pms.submitMidTerm(status, feedback);
    if (status === "AMENDMENT_NEEDED") setTab("agreement");
  };

  return (
    <div className="space-y-6">
      <SectionHeading title={t.midTerm.title} description={t.midTerm.noSurpriseRule} />

      {midTermStatus ? (
        <Notice tone={midTermStatus === "PERFORMANCE_RISK" ? "critical" : midTermStatus === "ON_TRACK" ? "success" : "support"}>
          {t.midTerm.status[midTermStatus]} — {t.midTerm.statusHint[midTermStatus]}
        </Notice>
      ) : null}

      <p className="text-sm font-medium text-slate-800">{t.ui.midTerm.choosePath}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {PATHS.map((path) => {
          const Icon = path.icon;
          const active = selected === path.status;
          return (
            <button
              key={path.status}
              type="button"
              disabled={!allowed}
              onClick={() => setSelected(path.status)}
              className={cn(
                "rounded-2xl border p-4 text-start transition-colors disabled:opacity-60",
                active
                  ? path.tone === "success"
                    ? "border-achievement-400 bg-achievement-50"
                    : path.tone === "support"
                      ? "border-candor-400 bg-candor-50"
                      : "border-rose-400 bg-rose-50"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <Icon className="mb-2 size-5 text-slate-700" />
              <p className="text-sm font-semibold text-slate-900">{t.midTerm.status[path.status]}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.midTerm.statusHint[path.status]}</p>
            </button>
          );
        })}
      </div>

      <Textarea
        disabled={!allowed}
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder={t.common.notes}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={meetings.length > 0 ? "success" : "support"}>
          {t.oneToOne.plural}: {meetings.length}
        </Badge>
        {allowed ? (
          <Button
            disabled={!selected}
            variant={selected === "PERFORMANCE_RISK" ? "danger" : "primary"}
            onClick={() => selected && confirm(selected)}
          >
            {selected === "ON_TRACK"
              ? t.ui.midTerm.continueProgram
              : selected === "AMENDMENT_NEEDED"
                ? t.agreement.action.REQUEST_AMENDMENT
                : t.ui.midTerm.initiatePip}
          </Button>
        ) : null}
        {midTermStatus === "PERFORMANCE_RISK" && role === "EMPLOYEE" && !midTermAcknowledged ? (
          <Button variant="secondary" onClick={pms.acknowledgeMidTerm}>
            {t.common.confirm}
          </Button>
        ) : null}
      </div>

      <Dialog
        open={riskOpen}
        title={t.ui.midTerm.confirmRiskTitle}
        onClose={() => setRiskOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRiskOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (meetings.length === 0) return;
                pms.submitMidTerm("PERFORMANCE_RISK", feedback);
                setRiskOpen(false);
                setTab("pip");
              }}
            >
              {t.ui.midTerm.initiatePip}
            </Button>
          </>
        }
      >
        <p>{t.ui.midTerm.confirmRiskBody}</p>
        {meetings.length === 0 ? <p className="mt-2 font-medium text-rose-700">{t.ui.midTerm.evidenceRequired}</p> : null}
      </Dialog>
    </div>
  );
}
