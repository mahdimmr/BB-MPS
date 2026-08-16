"use client";

import { FlaskConical, GraduationCap, RotateCcw, Shield, User, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePms } from "@/lib/pms/context";
import type { DemoRole } from "@/lib/pms/types";
import { DEMO_ROLES } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

const ROLE_ICON: Record<DemoRole, typeof User> = {
  EMPLOYEE: User,
  SOLID_LEAD: UserCog,
  DOTTED_LEAD: GraduationCap,
  HR_ADMIN: Shield,
};

const ROLE_LABEL: Record<DemoRole, "employee" | "solidLead" | "dottedLead" | "hr"> = {
  EMPLOYEE: "employee",
  SOLID_LEAD: "solidLead",
  DOTTED_LEAD: "dottedLead",
  HR_ADMIN: "hr",
};

export function RoleSwitcher() {
  const { role, setRole, t, resetDemo } = usePms();

  return (
    <div className="border-b border-candor-200 bg-candor-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-2 text-candor-800">
          <FlaskConical className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-xs font-semibold">{t.ui.testingBar}</p>
            <p className="text-xs leading-relaxed text-candor-700">{t.ui.testingBarHint}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-candor-200 bg-white p-1">
            {DEMO_ROLES.map((option) => {
              const Icon = ROLE_ICON[option];
              const active = option === role;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-candor-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-candor-100",
                  )}
                >
                  <Icon className="size-3.5" />
                  {t.ui.roleBar[ROLE_LABEL[option]]}
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" onClick={resetDemo}>
            <RotateCcw className="size-3.5" />
            {t.common.reset}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RoleHint() {
  const { role, t } = usePms();
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      {t.ui.viewingAs} <span className="font-medium text-slate-800">{t.roles[role]}</span>
      {" — "}
      {t.roleHints[role]}
    </p>
  );
}
