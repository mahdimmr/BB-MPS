import { apiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const ownerSelect = {
  id: true,
  name: true,
  nameEn: true,
  jobTitle: true,
  department: true,
  solidLeadId: true,
  dottedLeadId: true,
} as const;

export const itemOrder = [{ layer: "asc" as const }, { order: "asc" as const }];

export async function loadAgreement(agreementId: string) {
  const agreement = await prisma.performanceAgreement.findUnique({
    where: { id: agreementId },
    include: {
      user: { select: ownerSelect },
      cycle: {
        select: {
          id: true,
          title: true,
          status: true,
          startDate: true,
          endDate: true,
          goalSettingDeadline: true,
          midTermReviewDate: true,
          finalEvaluationStart: true,
        },
      },
      items: { orderBy: itemOrder },
      midTermReview: { select: { id: true, status: true, reviewDate: true } },
    },
  });

  if (!agreement) throw apiError.notFound();

  return agreement;
}

export type LoadedAgreement = Awaited<ReturnType<typeof loadAgreement>>;
