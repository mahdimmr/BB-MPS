import { z } from "zod";

const dateInput = z.coerce.date();

export const createCycleSchema = z.object({
  /// e.g. "1405-Q1"
  title: z.string().trim().min(3).max(60),
  titleEn: z.string().trim().max(60).optional(),
  description: z.string().trim().max(2000).optional(),
  startDate: dateInput,
  /// Optional: defaults to startDate + 4 months, and is validated against it.
  endDate: dateInput.optional(),
  goalSettingDeadline: dateInput.optional(),
  midTermReviewDate: dateInput.optional(),
  finalEvaluationStart: dateInput.optional(),
});

export const updateCycleSchema = z
  .object({
    title: z.string().trim().min(3).max(60),
    titleEn: z.string().trim().max(60).nullable(),
    description: z.string().trim().max(2000).nullable(),
    startDate: dateInput,
    endDate: dateInput,
    goalSettingDeadline: dateInput,
    midTermReviewDate: dateInput,
    finalEvaluationStart: dateInput,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const cycleTransitionSchema = z.object({
  status: z.enum(["ACTIVE", "CALIBRATING", "CLOSED"]),
});

export const listCyclesQuerySchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CALIBRATING", "CLOSED"]).optional(),
  take: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export const companyObjectiveSchema = z.object({
  title: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  ownerTeam: z.string().trim().max(120).optional(),
  keyResults: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        target: z.string().trim().max(120).optional(),
        unit: z.string().trim().max(40).optional(),
      }),
    )
    .default([]),
  order: z.number().int().min(0).default(0),
});

export type CreateCycleInput = z.infer<typeof createCycleSchema>;
export type UpdateCycleInput = z.infer<typeof updateCycleSchema>;
