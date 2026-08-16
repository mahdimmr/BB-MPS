import type { Prisma } from "@/generated/prisma/client";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { isHr } from "@/lib/auth/rbac";
import {
  assertDottedLeadConsulted,
  assertGoalsComplete,
  assertTransitionAllowed,
  availableActions,
} from "@/lib/domain/agreement";
import { loadAgreement } from "@/lib/domain/agreement-repo";
import { ApiError, apiError, jsonOk, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { agreementTransitionSchema } from "@/lib/validation/agreement";

type Context = { params: Promise<{ agreementId: string }> };

/// Phase 1 workflow engine: employee drafts, dotted lead consults, employee signs,
/// solid lead signs and approves (which locks the agreement).
export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);
  const { action, reason, note } = await readJson(request, agreementTransitionSchema);

  const rule = assertTransitionAllowed(user, agreement.user, agreement.status, action);
  if (rule.requiresCompleteGoals) assertGoalsComplete(agreement.items);

  const now = new Date();
  const data: Prisma.PerformanceAgreementUpdateInput = { status: rule.to };

  switch (action) {
    case "SUBMIT_FOR_REVIEW":
      data.submittedAt = now;
      break;

    case "DOTTED_LEAD_REVIEW":
      data.dottedLeadReviewAt = now;
      break;

    case "EMPLOYEE_SIGN":
      assertDottedLeadConsulted(agreement.user, agreement.dottedLeadReviewAt);
      data.employeeSignedAt = now;
      break;

    case "MANAGER_SIGN":
      if (agreement.user.id === user.id) throw new ApiError(422, "SELF_APPROVAL_FORBIDDEN");
      data.managerSignedAt = now;
      break;

    case "APPROVE":
      data.approvedAt = now;
      data.lockedAt = now;
      break;

    case "RETURN_TO_DRAFT":
      data.submittedAt = null;
      data.dottedLeadReviewAt = null;
      data.employeeSignedAt = null;
      data.managerSignedAt = null;
      break;

    case "REQUEST_AMENDMENT": {
      if (!reason) throw apiError.unprocessable("VALIDATION_ERROR", { field: "reason" });

      // Locked goals only reopen when the mid-term review says circumstances shifted.
      const midTermAllows = agreement.midTermReview?.status === "AMENDMENT_NEEDED";
      if (!midTermAllows && !isHr(user)) {
        throw new ApiError(422, "INVALID_TRANSITION", { reason: "MID_TERM_AMENDMENT_REQUIRED" });
      }

      data.lockedAt = null;
      break;
    }

    case "COMPLETE_AMENDMENT":
      data.version = { increment: 1 };
      data.approvedAt = now;
      data.lockedAt = now;
      break;

    case "ARCHIVE":
      break;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.performanceAgreement.update({
      where: { id: agreementId },
      data,
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (action === "REQUEST_AMENDMENT") {
      await tx.agreementAmendment.create({
        data: {
          agreementId,
          midTermReviewId: agreement.midTermReview?.id,
          requestedById: user.id,
          reason: reason as string,
          before: agreement.items as unknown as Prisma.InputJsonValue,
        },
      });
    }

    if (action === "COMPLETE_AMENDMENT") {
      const pending = await tx.agreementAmendment.findFirst({
        where: { agreementId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (pending) {
        await tx.agreementAmendment.update({
          where: { id: pending.id },
          data: {
            status: "APPROVED",
            decidedById: user.id,
            decidedAt: now,
            after: result.items as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    if (note) {
      await tx.agreementComment.create({
        data: {
          agreementId,
          authorId: user.id,
          type: action === "DOTTED_LEAD_REVIEW" ? "ENDORSEMENT" : "SUGGESTION",
          body: note,
        },
      });
    }

    return result;
  });

  await recordAudit({
    actorId: user.id,
    action: `agreement.${action.toLowerCase()}`,
    entityType: "PerformanceAgreement",
    entityId: agreementId,
    before: { status: agreement.status, version: agreement.version },
    after: { status: updated.status, version: updated.version },
    request,
  });

  return jsonOk({
    ...updated,
    availableActions: availableActions(user, agreement.user, updated.status),
  });
});
