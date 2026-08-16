import { addDays, addMonths, isSameDay, startOfDay } from "date-fns";

import type { CycleStatus } from "@/generated/prisma/enums";
import { ApiError } from "@/lib/http";

/// The handbook defines a fixed four-month cadence.
export const CYCLE_LENGTH_MONTHS = 4;
/// Phase 4 opens in the last 15 days of the cycle.
export const FINAL_EVALUATION_WINDOW_DAYS = 15;
/// Phase 1 (goal setting) covers the first month.
export const GOAL_SETTING_MONTHS = 1;
/// Phase 3 (mid-term review) lands at the end of month two.
export const MID_TERM_MONTHS = 2;

export type CyclePhase =
  | "GOAL_SETTING"
  | "EXECUTION"
  | "MID_TERM_REVIEW"
  | "FINAL_EVALUATION"
  | "CALIBRATION"
  | "CLOSED";

export function expectedCycleEnd(startDate: Date): Date {
  return addMonths(startOfDay(startDate), CYCLE_LENGTH_MONTHS);
}

export function isValidCycleDuration(startDate: Date, endDate: Date): boolean {
  return isSameDay(expectedCycleEnd(startDate), startOfDay(endDate));
}

export function assertCycleDuration(startDate: Date, endDate: Date): void {
  if (!isValidCycleDuration(startDate, endDate)) {
    throw new ApiError(422, "CYCLE_DURATION_INVALID", {
      expectedEndDate: expectedCycleEnd(startDate).toISOString(),
    });
  }
}

export function defaultMilestones(startDate: Date, endDate: Date) {
  return {
    goalSettingDeadline: addMonths(startOfDay(startDate), GOAL_SETTING_MONTHS),
    midTermReviewDate: addMonths(startOfDay(startDate), MID_TERM_MONTHS),
    finalEvaluationStart: addDays(startOfDay(endDate), -FINAL_EVALUATION_WINDOW_DAYS),
  };
}

type PhaseInput = {
  status: CycleStatus;
  startDate: Date;
  endDate: Date;
  goalSettingDeadline: Date;
  midTermReviewDate: Date;
  finalEvaluationStart: Date;
};

/// Which phase of the handbook the cycle is currently in.
export function derivePhase(cycle: PhaseInput, now: Date = new Date()): CyclePhase {
  if (cycle.status === "CLOSED") return "CLOSED";
  if (cycle.status === "CALIBRATING") return "CALIBRATION";
  if (now >= cycle.finalEvaluationStart) return "FINAL_EVALUATION";
  if (now >= cycle.midTermReviewDate) return "MID_TERM_REVIEW";
  if (now >= cycle.goalSettingDeadline) return "EXECUTION";

  return "GOAL_SETTING";
}

/// Agreements may only be drafted while the cycle is still being set up or running.
export function acceptsAgreements(status: CycleStatus): boolean {
  return status === "DRAFT" || status === "ACTIVE";
}

const ALLOWED_CYCLE_TRANSITIONS: Record<CycleStatus, CycleStatus[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["CALIBRATING", "CLOSED"],
  CALIBRATING: ["ACTIVE", "CLOSED"],
  CLOSED: [],
};

export function assertCycleTransition(from: CycleStatus, to: CycleStatus): void {
  if (!ALLOWED_CYCLE_TRANSITIONS[from].includes(to)) {
    throw new ApiError(422, "INVALID_TRANSITION", { from, to, allowed: ALLOWED_CYCLE_TRANSITIONS[from] });
  }
}
