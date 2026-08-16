import type { Role } from "@/generated/prisma/enums";
import type { SessionUser } from "@/lib/auth/current-user";
import { apiError } from "@/lib/http";

/// Someone the actor may act upon. Authority is decided by the reporting lines,
/// not by the role alone: a SOLID_LEAD only has authority over their own reports.
export type Subject = {
  id: string;
  solidLeadId: string | null;
  dottedLeadId: string | null;
};

export function hasRole(user: SessionUser, role: Role): boolean {
  return user.roles.includes(role);
}

export function isHr(user: SessionUser): boolean {
  return hasRole(user, "HR_ADMIN");
}

export function isCommitteeMember(user: SessionUser): boolean {
  return hasRole(user, "COMMITTEE_MEMBER");
}

export function isSelf(user: SessionUser, subject: Subject): boolean {
  return user.id === subject.id;
}

export function isSolidLeadOf(user: SessionUser, subject: Subject): boolean {
  return subject.solidLeadId !== null && subject.solidLeadId === user.id;
}

export function isDottedLeadOf(user: SessionUser, subject: Subject): boolean {
  return subject.dottedLeadId !== null && subject.dottedLeadId === user.id;
}

/// Read access to an employee's performance data.
export function canViewSubject(user: SessionUser, subject: Subject): boolean {
  return (
    isSelf(user, subject) ||
    isHr(user) ||
    isSolidLeadOf(user, subject) ||
    isDottedLeadOf(user, subject)
  );
}

export function assert(condition: boolean, code: Parameters<typeof apiError.forbidden>[0] = "FORBIDDEN"): void {
  if (!condition) throw apiError.forbidden(code);
}

export function requireHr(user: SessionUser): void {
  assert(isHr(user));
}

export function requireCanViewSubject(user: SessionUser, subject: Subject): void {
  assert(canViewSubject(user, subject));
}

/// Employees the actor is allowed to list, expressed as a Prisma `where` fragment.
export function visibleUserFilter(user: SessionUser) {
  if (isHr(user)) return {};

  return {
    OR: [{ id: user.id }, { solidLeadId: user.id }, { dottedLeadId: user.id }],
  };
}
