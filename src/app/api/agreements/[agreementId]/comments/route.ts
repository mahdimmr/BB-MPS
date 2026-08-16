import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { requireCanViewSubject } from "@/lib/auth/rbac";
import { loadAgreement } from "@/lib/domain/agreement-repo";
import { apiError, jsonCreated, jsonOk, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { agreementCommentSchema } from "@/lib/validation/agreement";

type Context = { params: Promise<{ agreementId: string }> };

const authorSelect = { id: true, name: true, nameEn: true, roles: true } as const;

export const GET = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireCanViewSubject(user, agreement.user);

  const comments = await prisma.agreementComment.findMany({
    where: { agreementId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: authorSelect } },
  });

  return jsonOk({ items: comments });
});

/// The consultation surface used by the dotted lead drawer during goal setting.
export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { agreementId } = await params;

  const agreement = await loadAgreement(agreementId);
  requireCanViewSubject(user, agreement.user);

  const input = await readJson(request, agreementCommentSchema);

  if (input.itemId && !agreement.items.some((item) => item.id === input.itemId)) {
    throw apiError.notFound();
  }

  const comment = await prisma.agreementComment.create({
    data: {
      agreementId,
      itemId: input.itemId,
      authorId: user.id,
      type: input.type,
      body: input.body,
    },
    include: { author: { select: authorSelect } },
  });

  await recordAudit({
    actorId: user.id,
    action: "agreement.comment.create",
    entityType: "AgreementComment",
    entityId: comment.id,
    after: { type: comment.type, itemId: comment.itemId },
    request,
  });

  return jsonCreated(comment);
});
