import type { AgreementStatus, MetricLayer } from "@/generated/prisma/enums";
import type { SessionUser } from "@/lib/auth/current-user";
import { isDottedLeadOf, isHr, isSelf, isSolidLeadOf, type Subject } from "@/lib/auth/rbac";
import { ApiError, apiError } from "@/lib/http";

export const METRIC_LAYERS: MetricLayer[] = ["STRATEGIC", "OPERATIONAL", "DEVELOPMENTAL"];
export const TOTAL_WEIGHT = 100;

export type AgreementAction =
  | "SUBMIT_FOR_REVIEW"
  | "DOTTED_LEAD_REVIEW"
  | "EMPLOYEE_SIGN"
  | "MANAGER_SIGN"
  | "APPROVE"
  | "RETURN_TO_DRAFT"
  | "REQUEST_AMENDMENT"
  | "COMPLETE_AMENDMENT"
  | "ARCHIVE";

/// Who may trigger an action, relative to the agreement's owner.
type ActorRelation = "EMPLOYEE" | "SOLID_LEAD" | "DOTTED_LEAD" | "HR";

type TransitionRule = {
  from: AgreementStatus[];
  to: AgreementStatus;
  actors: ActorRelation[];
  /// Goals must be complete (weights + all three layers) before this step.
  requiresCompleteGoals?: boolean;
};

export const AGREEMENT_TRANSITIONS: Record<AgreementAction, TransitionRule> = {
  SUBMIT_FOR_REVIEW: {
    from: ["DRAFT"],
    to: "DOTTED_LEAD_REVIEW",
    actors: ["EMPLOYEE", "SOLID_LEAD", "HR"],
    requiresCompleteGoals: true,
  },
  // Recording the dotted lead's consultation does not move the agreement forward;
  // it unlocks the employee signature (see assertReadyForEmployeeSignature).
  DOTTED_LEAD_REVIEW: {
    from: ["DOTTED_LEAD_REVIEW"],
    to: "DOTTED_LEAD_REVIEW",
    actors: ["DOTTED_LEAD", "HR"],
  },
  EMPLOYEE_SIGN: {
    from: ["DOTTED_LEAD_REVIEW"],
    to: "EMPLOYEE_SIGNED",
    actors: ["EMPLOYEE"],
    requiresCompleteGoals: true,
  },
  MANAGER_SIGN: {
    from: ["EMPLOYEE_SIGNED"],
    to: "MANAGER_SIGNED",
    actors: ["SOLID_LEAD"],
    requiresCompleteGoals: true,
  },
  APPROVE: {
    from: ["MANAGER_SIGNED"],
    to: "APPROVED",
    actors: ["SOLID_LEAD", "HR"],
    requiresCompleteGoals: true,
  },
  RETURN_TO_DRAFT: {
    from: ["DOTTED_LEAD_REVIEW", "EMPLOYEE_SIGNED", "MANAGER_SIGNED"],
    to: "DRAFT",
    actors: ["SOLID_LEAD", "DOTTED_LEAD", "HR"],
  },
  REQUEST_AMENDMENT: {
    from: ["APPROVED"],
    to: "AMENDMENT_IN_PROGRESS",
    actors: ["SOLID_LEAD", "HR"],
  },
  COMPLETE_AMENDMENT: {
    from: ["AMENDMENT_IN_PROGRESS"],
    to: "APPROVED",
    actors: ["SOLID_LEAD", "HR"],
    requiresCompleteGoals: true,
  },
  ARCHIVE: {
    from: ["DRAFT", "DOTTED_LEAD_REVIEW", "EMPLOYEE_SIGNED", "MANAGER_SIGNED", "APPROVED", "AMENDMENT_IN_PROGRESS"],
    to: "ARCHIVED",
    actors: ["HR"],
  },
};

/// Goals are only editable before the solid lead locks the agreement, or while a
/// mid-term amendment is open.
export function isEditable(status: AgreementStatus): boolean {
  return status === "DRAFT" || status === "AMENDMENT_IN_PROGRESS";
}

export function assertEditable(status: AgreementStatus): void {
  if (!isEditable(status)) throw apiError.conflict("AGREEMENT_LOCKED");
}

export function actorRelations(user: SessionUser, owner: Subject): ActorRelation[] {
  const relations: ActorRelation[] = [];

  if (isSelf(user, owner)) relations.push("EMPLOYEE");
  if (isSolidLeadOf(user, owner)) relations.push("SOLID_LEAD");
  if (isDottedLeadOf(user, owner)) relations.push("DOTTED_LEAD");
  if (isHr(user)) relations.push("HR");

  return relations;
}

export function availableActions(
  user: SessionUser,
  owner: Subject,
  status: AgreementStatus,
): AgreementAction[] {
  const relations = actorRelations(user, owner);

  return (Object.keys(AGREEMENT_TRANSITIONS) as AgreementAction[]).filter((action) => {
    const rule = AGREEMENT_TRANSITIONS[action];
    return rule.from.includes(status) && rule.actors.some((actor) => relations.includes(actor));
  });
}

export function assertTransitionAllowed(
  user: SessionUser,
  owner: Subject,
  status: AgreementStatus,
  action: AgreementAction,
): TransitionRule {
  const rule = AGREEMENT_TRANSITIONS[action];

  if (!rule.from.includes(status)) {
    throw new ApiError(422, "INVALID_TRANSITION", { action, from: status, allowedFrom: rule.from });
  }

  const relations = actorRelations(user, owner);
  if (!rule.actors.some((actor) => relations.includes(actor))) {
    throw apiError.forbidden();
  }

  return rule;
}

type WeightedItem = { layer: MetricLayer; weight: number };

/// Every layer needs at least one goal and the weights must total exactly 100 —
/// this is what makes a final rating traceable back to the agreement.
export function assertGoalsComplete(items: WeightedItem[]): void {
  const missingLayers = METRIC_LAYERS.filter(
    (layer) => !items.some((item) => item.layer === layer),
  );

  if (missingLayers.length > 0) {
    throw new ApiError(422, "AGREEMENT_LAYER_MISSING", { missingLayers });
  }

  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total !== TOTAL_WEIGHT) {
    throw new ApiError(422, "AGREEMENT_WEIGHT_INVALID", { total, expected: TOTAL_WEIGHT });
  }
}

/// The dotted lead's consultation is mandatory when the employee has one.
export function assertDottedLeadConsulted(owner: Subject, dottedLeadReviewAt: Date | null): void {
  if (owner.dottedLeadId && !dottedLeadReviewAt) {
    throw new ApiError(422, "INVALID_TRANSITION", { reason: "DOTTED_LEAD_REVIEW_REQUIRED" });
  }
}

export function weightSummary(items: WeightedItem[]) {
  const byLayer = Object.fromEntries(
    METRIC_LAYERS.map((layer) => [
      layer,
      items.filter((item) => item.layer === layer).reduce((sum, item) => sum + item.weight, 0),
    ]),
  ) as Record<MetricLayer, number>;

  return {
    total: items.reduce((sum, item) => sum + item.weight, 0),
    byLayer,
    isBalanced: items.reduce((sum, item) => sum + item.weight, 0) === TOTAL_WEIGHT,
  };
}
