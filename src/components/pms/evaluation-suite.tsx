"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/input";
import { LayerCard, Notice, RangeSlider, SectionHeading } from "@/components/pms/shared";
import { can, usePms } from "@/lib/pms/context";
import { DOTTED_LEAD } from "@/lib/pms/mock-data";
import { LAYERS, SCORE_ORDER, SLIDER_TO_SCORE, type Score } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

const STEPS = [1, 2, 3, 4] as const;

export function EvaluationSuite() {
  const pms = usePms();
  const { t, evalStep, setEvalStep } = pms;

  return (
    <div className="space-y-6">
      <SectionHeading title={t.evaluation.title} description={t.ui.evaluation.behaviourHint} />

      <ol className="grid gap-2 sm:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step}>
            <button
              type="button"
              onClick={() => setEvalStep(step)}
              className={cn(
                "w-full rounded-xl border px-3 py-2 text-start text-xs font-medium",
                evalStep === step ? "border-brand-400 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600",
              )}
            >
              {t.ui.evaluation[`step${step}` as "step1" | "step2" | "step3" | "step4"]}
            </button>
          </li>
        ))}
      </ol>

      {evalStep === 1 ? <SelfEval /> : null}
      {evalStep === 2 ? <ManagerEval /> : null}
      {evalStep === 3 ? <MultiLevel /> : null}
      {evalStep === 4 ? <Calibration /> : null}
    </div>
  );
}

function SelfEval() {
  const { t, role, selfReflection, impactNarrative, challenges, selfSubmitted, setEvalField, submitSelfEval } = usePms();
  const allowed = can(role, "selfEval") && !selfSubmitted;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.evaluation.selfEvaluation}</CardTitle>
        <CardDescription>{t.ui.evaluation.selfReflection}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selfSubmitted ? <Notice tone="success">{t.evaluation.status.SELF_EVALUATED}</Notice> : null}
        <Field label={t.ui.evaluation.selfReflection}>
          <Textarea
            disabled={!allowed}
            value={selfReflection}
            onChange={(event) => setEvalField("selfReflection", event.target.value)}
          />
        </Field>
        <Field label={t.ui.evaluation.impactNarrative}>
          <Textarea
            disabled={!allowed}
            value={impactNarrative}
            onChange={(event) => setEvalField("impactNarrative", event.target.value)}
          />
        </Field>
        <Field label={t.ui.evaluation.challenges}>
          <Textarea
            disabled={!allowed}
            value={challenges}
            onChange={(event) => setEvalField("challenges", event.target.value)}
          />
        </Field>
        {allowed ? (
          <Button onClick={submitSelfEval} disabled={!selfReflection.trim()}>
            {t.ui.evaluation.submitSelf}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ManagerEval() {
  const { t, role, loc, items, layerScores, setLayerScore, managerSubmitted, submitManagerEval } = usePms();
  const allowed = can(role, "managerEval") && !managerSubmitted;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{t.ui.evaluation.layerRating}</p>
      {LAYERS.map((layer) => {
        const score = SLIDER_TO_SCORE[layerScores[layer] - 1];
        return (
          <LayerCard key={layer} layer={layer}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{t.agreement.layer[layer]}</p>
              <Badge tone={score === "NEEDS_IMPROVEMENT" ? "support" : score === "POOR" ? "critical" : "brand"}>
                {t.score[score]}
              </Badge>
            </div>
            <RangeSlider value={layerScores[layer]} disabled={!allowed} onChange={(value) => setLayerScore(layer, value)} />
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {items
                .filter((item) => item.layer === layer)
                .map((item) => (
                  <li key={item.id}>• {loc(item.title)}</li>
                ))}
            </ul>
          </LayerCard>
        );
      })}
      {allowed ? (
        <Button onClick={submitManagerEval}>{t.ui.evaluation.submitManager}</Button>
      ) : managerSubmitted ? (
        <Notice tone="success">{t.evaluation.status.SOLID_LEAD_EVALUATED}</Notice>
      ) : null}
    </div>
  );
}

function MultiLevel() {
  const { t, loc, role, peerNotes, dottedEvalComment, setEvalField, setEvalStep } = usePms();
  const allowed = can(role, "multiLevel");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t.ui.evaluation.dottedInput}</CardTitle>
          <CardDescription>
            {loc(DOTTED_LEAD.name)} · {loc(DOTTED_LEAD.title)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            disabled={!allowed}
            value={dottedEvalComment}
            onChange={(event) => setEvalField("dottedEvalComment", event.target.value)}
            placeholder={t.roleHints.DOTTED_LEAD}
          />
        </CardContent>
      </Card>
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-800">{t.ui.evaluation.peerTestimonial}</p>
        {peerNotes.map((note) => (
          <article key={note.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{loc(note.author)}</p>
            <p className="text-xs text-slate-500">{loc(note.relationship)}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{loc(note.text)}</p>
          </article>
        ))}
        <Button variant="secondary" onClick={() => setEvalStep(4)}>
          {t.common.next}
        </Button>
      </div>
    </div>
  );
}

function Calibration() {
  const { t, role, finalRating, setFinalRating, calibrated, submitCalibration, setTab } = usePms();
  const allowed = can(role, "calibrate") && !calibrated;

  const toneFor = (score: Score) => {
    if (score === "OUTSTANDING" || score === "ABOVE_EXPECTATIONS") return "success" as const;
    if (score === "MEETS_EXPECTATIONS") return "brand" as const;
    if (score === "NEEDS_IMPROVEMENT") return "support" as const;
    return "critical" as const;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{t.ui.evaluation.pickRating}</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {SCORE_ORDER.map((score, index) => {
          const selected = finalRating === score;
          return (
            <button
              key={score}
              type="button"
              disabled={!allowed && !selected}
              onClick={() => allowed && setFinalRating(score)}
              className={cn(
                "rounded-2xl border p-4 text-start transition-colors",
                selected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <p className="text-xs text-slate-400">{index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{t.score[score]}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.scoreDescription[score]}</p>
            </button>
          );
        })}
      </div>
      {finalRating ? <Badge tone={toneFor(finalRating)}>{t.score[finalRating]}</Badge> : null}
      {allowed ? (
        <Button disabled={!finalRating} onClick={submitCalibration}>
          {t.ui.evaluation.submitCalibration}
        </Button>
      ) : null}
      {calibrated ? (
        <Notice
          tone={finalRating === "NEEDS_IMPROVEMENT" || finalRating === "POOR" ? "support" : "success"}
        >
          {t.evaluation.status.CALIBRATED}
          {finalRating === "NEEDS_IMPROVEMENT" || finalRating === "POOR" ? (
            <button type="button" className="ms-2 underline" onClick={() => setTab("pip")}>
              {t.pip.title}
            </button>
          ) : null}
        </Notice>
      ) : null}
    </div>
  );
}
