"use client";

import { useState } from "react";
import { Lock, PenLine, Plus, Sparkles, Trash2 } from "lucide-react";

import { DottedLeadDrawer } from "@/components/pms/dotted-lead-drawer";
import { LayerCard, Notice } from "@/components/pms/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { can, usePms } from "@/lib/pms/context";
import { LAYERS, type AgreementItem, type MetricLayer } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

export function AgreementForm() {
  const pms = usePms();
  const { t, items, locked, weightTotal, role, agreementStatus, employeeSigned, managerSigned, dottedConsulted } =
    pms;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const editable = !locked && can(role, "editAgreement");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t.agreement.title}</h2>
          <p className="text-sm text-slate-500">{t.agreement.totalWeightHint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={locked ? "success" : weightTotal === 100 ? "brand" : "support"}>
            {t.ui.agreement.weightTotal}: {weightTotal}
          </Badge>
          <Badge tone={locked ? "success" : "neutral"}>{t.agreement.status[agreementStatus]}</Badge>
          {locked ? (
            <Badge tone="success">
              <Lock className="size-3" /> {t.common.locked}
            </Badge>
          ) : null}
        </div>
      </div>

      {locked ? <Notice tone="success">{t.agreement.lockedNotice}</Notice> : null}
      {agreementStatus === "AMENDMENT_IN_PROGRESS" ? (
        <Notice tone="support">{t.ui.agreement.unlockedForAmendment}</Notice>
      ) : null}
      {!dottedConsulted ? <Notice tone="support">{t.ui.agreement.consultationNeeded}</Notice> : null}

      {LAYERS.map((layer) => (
        <section key={layer} className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t.agreement.layer[layer]}</h3>
              <p className="text-xs text-slate-500">{t.agreement.layerHint[layer]}</p>
            </div>
            {editable ? (
              <Button variant="secondary" size="sm" onClick={() => pms.addItem(layer)}>
                <Plus className="size-3.5" />
                {t.ui.agreement.addGoal}
              </Button>
            ) : null}
          </div>
          {items
            .filter((item) => item.layer === layer)
            .map((item) => (
              <GoalEditor key={item.id} item={item} editable={editable} layer={layer} />
            ))}
        </section>
      ))}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-xs text-slate-500">{t.ui.agreement.bothSignedLock}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            <Sparkles className="size-4" />
            {t.ui.agreement.openDrawer}
          </Button>
          <Button
            variant={employeeSigned ? "success" : "primary"}
            disabled={!can(role, "employeeSign") || employeeSigned || locked || !dottedConsulted || weightTotal !== 100}
            onClick={pms.signEmployee}
          >
            <PenLine className="size-4" />
            {employeeSigned ? t.common.signed : t.ui.agreement.employeeSign}
          </Button>
          <Button
            variant={managerSigned ? "success" : "primary"}
            disabled={!can(role, "managerSign") || managerSigned || locked || !employeeSigned || weightTotal !== 100}
            onClick={pms.signManager}
          >
            <PenLine className="size-4" />
            {managerSigned ? t.common.signed : t.ui.agreement.solidLeadSign}
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge tone={employeeSigned ? "success" : "neutral"}>
            {t.agreement.signedByEmployee}: {employeeSigned ? t.common.signed : t.common.unsigned}
          </Badge>
          <Badge tone={managerSigned ? "success" : "neutral"}>
            {t.agreement.signedByManager}: {managerSigned ? t.common.signed : t.common.unsigned}
          </Badge>
          <Badge tone={dottedConsulted ? "success" : "support"}>
            {dottedConsulted ? t.ui.agreement.consultationRecorded : t.ui.agreement.technicalDrawer}
          </Badge>
        </div>
      </div>

      <DottedLeadDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

function GoalEditor({
  item,
  editable,
  layer,
}: {
  item: AgreementItem;
  editable: boolean;
  layer: MetricLayer;
}) {
  const { t, loc, locale, updateItem, removeItem } = usePms();

  const setText = (field: "title" | "targetValue" | "measurementMethod" | "successCriteria", value: string) => {
    updateItem(item.id, { [field]: { ...item[field], [locale]: value } });
  };

  return (
    <LayerCard layer={layer}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {item.isStretch ? (
            <Badge tone="brand">
              <Sparkles className="size-3" /> {t.ui.agreement.stretch}
            </Badge>
          ) : null}
          {item.okrTitle ? <Badge tone="brand">{t.ui.agreement.okrAlign}</Badge> : null}
          {item.developmentCategory ? (
            <Badge tone="support">{t.agreement.developmentCategory[item.developmentCategory]}</Badge>
          ) : null}
        </div>
        {editable ? (
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
          >
            <Trash2 className="size-3.5" />
            {t.ui.agreement.removeGoal}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t.agreement.layer[layer]} className="md:col-span-2">
          <Input disabled={!editable} value={loc(item.title)} onChange={(event) => setText("title", event.target.value)} />
        </Field>
        <Field label={t.ui.agreement.metric}>
          <Input
            disabled={!editable}
            value={loc(item.targetValue)}
            onChange={(event) => setText("targetValue", event.target.value)}
          />
        </Field>
        <Field label={t.common.weight}>
          <Input
            type="number"
            min={0}
            max={100}
            disabled={!editable}
            value={item.weight}
            onChange={(event) => updateItem(item.id, { weight: Number(event.target.value) })}
          />
        </Field>
        <Field label={t.ui.agreement.measurementMethod}>
          <Input
            disabled={!editable}
            value={loc(item.measurementMethod)}
            onChange={(event) => setText("measurementMethod", event.target.value)}
          />
        </Field>
        <Field label={t.ui.agreement.successCriteria} className="md:col-span-2">
          <Textarea
            disabled={!editable}
            value={loc(item.successCriteria)}
            onChange={(event) => setText("successCriteria", event.target.value)}
          />
        </Field>
      </div>

      {layer === "STRATEGIC" && editable ? (
        <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(item.isStretch)}
            onChange={(event) => updateItem(item.id, { isStretch: event.target.checked })}
            className="size-4 accent-brand-600"
          />
          {t.ui.agreement.stretch}
        </label>
      ) : null}

      {item.okrTitle ? (
        <p className={cn("mt-3 text-xs text-slate-500")}>
          OKR: {loc(item.okrTitle)}
        </p>
      ) : null}
    </LayerCard>
  );
}
