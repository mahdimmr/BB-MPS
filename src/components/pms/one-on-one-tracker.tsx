"use client";

import { useState } from "react";
import { CalendarPlus, History } from "lucide-react";

import { Notice, SectionHeading } from "@/components/pms/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/i18n/config";
import { can, usePms } from "@/lib/pms/context";

export function OneOnOneTracker() {
  const { t, locale, role, meetings, addMeeting } = usePms();
  const allowed = can(role, "logOneOnOne");
  const [date, setDate] = useState("2026-08-19");
  const [achievements, setAchievements] = useState("");
  const [roadblocks, setRoadblocks] = useState("");
  const [actionItems, setActionItems] = useState("");

  const submit = () => {
    if (!date || !achievements.trim()) return;
    addMeeting({ date, achievements, roadblocks, actionItems });
    setAchievements("");
    setRoadblocks("");
    setActionItems("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <SectionHeading title={t.oneToOne.scheduler} description={t.oneToOne.cadenceHint} />
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Field label={t.oneToOne.meetingDate}>
              <Input type="date" disabled={!allowed} value={date} onChange={(event) => setDate(event.target.value)} />
            </Field>
            <Field label={t.oneToOne.achievements}>
              <Textarea
                disabled={!allowed}
                value={achievements}
                onChange={(event) => setAchievements(event.target.value)}
              />
            </Field>
            <Field label={t.oneToOne.roadblocks}>
              <Textarea disabled={!allowed} value={roadblocks} onChange={(event) => setRoadblocks(event.target.value)} />
            </Field>
            <Field label={t.oneToOne.actionItems}>
              <Textarea
                disabled={!allowed}
                value={actionItems}
                onChange={(event) => setActionItems(event.target.value)}
              />
            </Field>
            {allowed ? (
              <Button className="w-full" onClick={submit}>
                <CalendarPlus className="size-4" />
                {t.oneToOne.log}
              </Button>
            ) : (
              <Notice>{t.roleHints[role === "HR_ADMIN" ? "HR_ADMIN" : role]}</Notice>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <SectionHeading title={t.oneToOne.feed} description={t.oneToOne.historyHint} />
        {meetings.length === 0 ? (
          <p className="text-sm text-slate-500">{t.common.empty}</p>
        ) : (
          <ol className="relative space-y-4 border-s-2 border-brand-100 ps-6">
            {meetings.map((meeting) => (
              <li key={meeting.id} className="relative">
                <span className="absolute -start-[31px] top-3 size-3 rounded-full border-2 border-white bg-brand-500" />
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <History className="size-3.5 text-brand-600" />
                      {formatDate(meeting.date, locale)}
                    </p>
                    <Badge tone="neutral">{t.roles[meeting.loggedBy]}</Badge>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-achievement-700">{t.oneToOne.achievements}</dt>
                      <dd className="text-slate-700">{meeting.achievements}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-candor-700">{t.oneToOne.roadblocks}</dt>
                      <dd className="text-slate-700">{meeting.roadblocks || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-brand-700">{t.oneToOne.actionItems}</dt>
                      <dd className="text-slate-700">{meeting.actionItems || "—"}</dd>
                    </div>
                  </dl>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
