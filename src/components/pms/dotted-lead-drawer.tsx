"use client";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { Notice } from "@/components/pms/shared";
import { can, usePms } from "@/lib/pms/context";
import { DOTTED_LEAD } from "@/lib/pms/mock-data";

export function DottedLeadDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, loc, role, items, dottedFeedback, setDottedFeedback, recordDottedConsultation, dottedConsulted } = usePms();
  const developmental = items.filter((item) => item.layer === "DEVELOPMENTAL");
  const allowed = can(role, "dottedConsult");

  return (
    <Drawer open={open} title={t.ui.agreement.technicalDrawer} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          {loc(DOTTED_LEAD.name)} · {loc(DOTTED_LEAD.title)}
        </p>
        {dottedConsulted ? <Notice tone="success">{t.ui.agreement.consultationRecorded}</Notice> : null}

        <div className="space-y-2">
          {developmental.map((item) => (
            <div key={item.id} className="rounded-xl border border-candor-200 bg-candor-50 p-3">
              <p className="text-sm font-medium text-slate-900">{loc(item.title)}</p>
              <p className="text-xs text-slate-500">{loc(item.successCriteria)}</p>
            </div>
          ))}
        </div>

        <Textarea
          disabled={!allowed || dottedConsulted}
          value={dottedFeedback}
          onChange={(event) => setDottedFeedback(event.target.value)}
          placeholder={t.roleHints.DOTTED_LEAD}
        />

        {allowed && !dottedConsulted ? (
          <Button
            className="w-full"
            disabled={!dottedFeedback.trim()}
            onClick={() => {
              recordDottedConsultation();
              onClose();
            }}
          >
            {t.agreement.action.DOTTED_LEAD_REVIEW}
          </Button>
        ) : null}
      </div>
    </Drawer>
  );
}
