import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/current-user";
import { requireHr } from "@/lib/auth/rbac";
import { apiError, jsonCreated, jsonOk, readJson, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { companyObjectiveSchema } from "@/lib/validation/cycle";

type Context = { params: Promise<{ cycleId: string }> };

export const GET = route<Context>(async (_request, { params }) => {
  await requireUser();
  const { cycleId } = await params;

  const objectives = await prisma.companyObjective.findMany({
    where: { cycleId },
    orderBy: { order: "asc" },
    include: { _count: { select: { alignedItems: true } } },
  });

  return jsonOk({ items: objectives });
});

/// Company-level OKRs are configured by HR; strategic goals then align to them.
export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  requireHr(user);

  const { cycleId } = await params;
  const input = await readJson(request, companyObjectiveSchema);

  const cycle = await prisma.performanceCycle.findUnique({
    where: { id: cycleId },
    select: { id: true, status: true },
  });

  if (!cycle) throw apiError.notFound();
  if (cycle.status === "CLOSED") throw apiError.conflict("INVALID_TRANSITION");

  const objective = await prisma.companyObjective.create({
    data: {
      cycleId,
      title: input.title,
      titleEn: input.titleEn,
      description: input.description,
      ownerTeam: input.ownerTeam,
      keyResults: input.keyResults,
      order: input.order,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: "cycle.objective.create",
    entityType: "CompanyObjective",
    entityId: objective.id,
    after: objective,
    request,
  });

  return jsonCreated(objective);
});
