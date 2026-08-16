"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { AppLocale, Dictionary } from "@/lib/i18n";
import { createInitialSnapshot, EMPTY_GOAL } from "@/lib/pms/mock-data";
import type {
  AgreementItem,
  DemoRole,
  MetricLayer,
  MidTermStatus,
  PmsContextValue,
  PmsSnapshot,
  Score,
  TabId,
} from "@/lib/pms/types";

const PmsContext = createContext<PmsContextValue | null>(null);

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function checkpointsFor(months: 1 | 2): boolean[] {
  return Array.from({ length: months * 4 }, () => false);
}

export function PmsProvider({
  locale,
  t,
  children,
}: {
  locale: AppLocale;
  t: Dictionary;
  children: ReactNode;
}) {
  const [role, setRole] = useState<DemoRole>("EMPLOYEE");
  const [tab, setTab] = useState<TabId>("dashboard");
  const [snap, setSnap] = useState<PmsSnapshot>(createInitialSnapshot);

  const agreementLocked = snap.agreementStatus === "APPROVED";

  const value = useMemo<PmsContextValue>(() => {
    const loc = (value: { fa: string; en: string }) => value[locale];
    const weightTotal = snap.items.reduce((sum, item) => sum + Number(item.weight || 0), 0);

    const patch = (updater: (current: PmsSnapshot) => PmsSnapshot) => {
      setSnap((current) => updater(current));
    };

    return {
      ...snap,
      role,
      tab,
      locale,
      t,
      setRole,
      setTab,
      loc,
      locked: agreementLocked,
      weightTotal,
      updateItem(id, next) {
        if (agreementLocked) return;
        patch((current) => ({
          ...current,
          items: current.items.map((item) => (item.id === id ? { ...item, ...next } : item)),
        }));
      },
      addItem(layer: MetricLayer) {
        if (agreementLocked) return;
        const template = EMPTY_GOAL[layer];
        const item: AgreementItem = { ...template, id: nextId("g"), title: { ...template.title } };
        patch((current) => ({ ...current, items: [...current.items, item] }));
      },
      removeItem(id) {
        if (agreementLocked) return;
        patch((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }));
      },
      setDottedFeedback(next) {
        patch((current) => ({ ...current, dottedFeedback: next }));
      },
      recordDottedConsultation() {
        patch((current) => ({
          ...current,
          dottedConsulted: true,
          agreementStatus: current.employeeSigned ? current.agreementStatus : "DOTTED_LEAD_REVIEW",
          notice: t.ui.agreement.consultationRecorded,
        }));
      },
      signEmployee() {
        patch((current) => {
          if (!current.dottedConsulted) {
            return { ...current, notice: t.ui.agreement.consultationNeeded };
          }
          const managerSigned = current.managerSigned;
          return {
            ...current,
            employeeSigned: true,
            agreementStatus: managerSigned ? "APPROVED" : "EMPLOYEE_SIGNED",
            notice: managerSigned ? t.agreement.lockedNotice : t.agreement.status.EMPLOYEE_SIGNED,
          };
        });
      },
      signManager() {
        patch((current) => {
          const employeeSigned = current.employeeSigned;
          return {
            ...current,
            managerSigned: true,
            agreementStatus: employeeSigned ? "APPROVED" : "MANAGER_SIGNED",
            notice: employeeSigned ? t.agreement.lockedNotice : t.agreement.status.MANAGER_SIGNED,
          };
        });
      },
      addMeeting(log) {
        patch((current) => ({
          ...current,
          meetings: [{ ...log, id: nextId("m"), loggedBy: role }, ...current.meetings],
          notice: t.oneToOne.title,
        }));
      },
      submitMidTerm(status: MidTermStatus, feedback: string) {
        patch((current) => {
          if (status === "PERFORMANCE_RISK" && current.meetings.length === 0) {
            return { ...current, notice: t.ui.midTerm.evidenceRequired };
          }

          if (status === "AMENDMENT_NEEDED") {
            return {
              ...current,
              midTermStatus: status,
              midTermFeedback: feedback,
              agreementStatus: "AMENDMENT_IN_PROGRESS",
              employeeSigned: false,
              managerSigned: false,
              notice: t.ui.midTerm.unlockNotice,
            };
          }

          if (status === "PERFORMANCE_RISK") {
            return {
              ...current,
              midTermStatus: status,
              midTermFeedback: feedback,
              pipTriggered: true,
              pipTrigger: "MID_TERM_RISK",
              pipStatus: "PENDING_COMMITTEE",
              notice: t.pip.status.PENDING_COMMITTEE,
            };
          }

          return {
            ...current,
            midTermStatus: status,
            midTermFeedback: feedback,
            notice: t.midTerm.status.ON_TRACK,
          };
        });
      },
      acknowledgeMidTerm() {
        patch((current) => ({ ...current, midTermAcknowledged: true }));
      },
      setEvalField(field, next) {
        patch((current) => ({ ...current, [field]: next }));
      },
      setEvalStep(step) {
        patch((current) => ({ ...current, evalStep: step }));
      },
      submitSelfEval() {
        patch((current) => ({
          ...current,
          selfSubmitted: true,
          evalStep: 2,
          notice: t.evaluation.status.SELF_EVALUATED,
        }));
      },
      setLayerScore(layer, value) {
        patch((current) => ({
          ...current,
          layerScores: { ...current.layerScores, [layer]: value },
        }));
      },
      submitManagerEval() {
        patch((current) => ({
          ...current,
          managerSubmitted: true,
          evalStep: 3,
          notice: t.evaluation.status.SOLID_LEAD_EVALUATED,
        }));
      },
      setFinalRating(score: Score) {
        patch((current) => ({ ...current, finalRating: score }));
      },
      submitCalibration() {
        patch((current) => {
          const needsPip =
            current.finalRating === "NEEDS_IMPROVEMENT" || current.finalRating === "POOR";
          return {
            ...current,
            calibrated: true,
            evalStep: 4,
            pipTriggered: needsPip ? true : current.pipTriggered,
            pipTrigger: needsPip ? "FINAL_NEEDS_IMPROVEMENT" : current.pipTrigger,
            pipStatus: needsPip && !current.pipTriggered ? "PENDING_COMMITTEE" : current.pipStatus,
            notice: t.evaluation.status.CALIBRATED,
          };
        });
      },
      authorizePip() {
        patch((current) => ({
          ...current,
          pipStatus: "ACTIVE",
          notice: t.ui.pip.approvedActive,
        }));
        setTab("pip");
      },
      setPipDuration(months) {
        patch((current) => ({
          ...current,
          pipDuration: months,
          pipCheckpoints: checkpointsFor(months),
        }));
      },
      toggleCheckpoint(index) {
        patch((current) => {
          const next = [...current.pipCheckpoints];
          next[index] = !next[index];
          return { ...current, pipCheckpoints: next };
        });
      },
      togglePipObjective(id) {
        patch((current) => ({
          ...current,
          pipObjectives: current.pipObjectives.map((item) =>
            item.id === id ? { ...item, done: !item.done } : item,
          ),
        }));
      },
      setPipOutcome(outcome) {
        patch((current) => ({ ...current, pipStatus: outcome, notice: t.pip.status[outcome] }));
      },
      resetDemo() {
        setSnap(createInitialSnapshot());
        setTab("dashboard");
        setRole("EMPLOYEE");
      },
    };
  }, [agreementLocked, locale, role, snap, t, tab]);

  return <PmsContext.Provider value={value}>{children}</PmsContext.Provider>;
}

export function usePms() {
  const ctx = useContext(PmsContext);
  if (!ctx) throw new Error("usePms must be used within PmsProvider");
  return ctx;
}

export function can(role: DemoRole, action: Action) {
  return ACTIONS[action].includes(role);
}

type Action =
  | "editAgreement"
  | "dottedConsult"
  | "employeeSign"
  | "managerSign"
  | "logOneOnOne"
  | "midTermDecide"
  | "selfEval"
  | "managerEval"
  | "multiLevel"
  | "calibrate"
  | "pipAuthorize"
  | "pipCoach"
  | "pipOutcome";

const ACTIONS: Record<Action, DemoRole[]> = {
  editAgreement: ["EMPLOYEE", "SOLID_LEAD", "HR_ADMIN"],
  dottedConsult: ["DOTTED_LEAD", "HR_ADMIN"],
  employeeSign: ["EMPLOYEE"],
  managerSign: ["SOLID_LEAD"],
  logOneOnOne: ["EMPLOYEE", "SOLID_LEAD"],
  midTermDecide: ["SOLID_LEAD", "HR_ADMIN"],
  selfEval: ["EMPLOYEE"],
  managerEval: ["SOLID_LEAD"],
  multiLevel: ["DOTTED_LEAD", "HR_ADMIN", "SOLID_LEAD"],
  calibrate: ["HR_ADMIN"],
  pipAuthorize: ["HR_ADMIN"],
  pipCoach: ["SOLID_LEAD", "DOTTED_LEAD", "HR_ADMIN"],
  pipOutcome: ["SOLID_LEAD", "HR_ADMIN"],
};
