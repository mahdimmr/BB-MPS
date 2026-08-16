import { requireUser } from "@/lib/auth/current-user";
import { jsonOk, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const GET = route(async () => {
  const session = await requireUser();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      nameEn: true,
      jobTitle: true,
      department: true,
      roles: true,
      status: true,
      locale: true,
      solidLead: { select: { id: true, name: true, nameEn: true } },
      dottedLead: { select: { id: true, name: true, nameEn: true } },
      _count: { select: { solidReports: true, dottedReports: true } },
    },
  });

  return jsonOk(user);
});
