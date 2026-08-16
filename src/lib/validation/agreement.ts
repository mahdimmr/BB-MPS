import { z } from "zod";

const dateInput = z.coerce.date();

const layerEnum = z.enum(["STRATEGIC", "OPERATIONAL", "DEVELOPMENTAL"]);
const developmentCategoryEnum = z.enum([
  "TECHNICAL_SKILL",
  "BEHAVIORAL_COMPETENCY",
  "LEADERSHIP",
  "CERTIFICATION",
]);

const baseItemShape = {
  layer: layerEnum,
  title: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  weight: z.number().int().min(0).max(100),
  targetValue: z.string().trim().max(200).optional(),
  measurementMethod: z.string().trim().max(500).optional(),
  dueDate: dateInput.optional(),
  isStretch: z.boolean().default(false),
  companyObjectiveId: z.string().min(1).optional(),
  developmentCategory: developmentCategoryEnum.optional(),
  order: z.number().int().min(0).default(0),
};

/// Layer-specific fields must not leak across layers: OKR alignment and stretch
/// flags belong to strategic goals, competency types to developmental ones.
function checkLayerFields(
  value: {
    layer?: "STRATEGIC" | "OPERATIONAL" | "DEVELOPMENTAL";
    companyObjectiveId?: string;
    isStretch?: boolean;
    developmentCategory?: string;
  },
  ctx: z.RefinementCtx,
) {
  if (!value.layer) return;

  if (value.layer !== "STRATEGIC") {
    if (value.companyObjectiveId) {
      ctx.addIssue({
        code: "custom",
        path: ["companyObjectiveId"],
        message: "Only strategic goals can be aligned to a company objective",
      });
    }
    if (value.isStretch) {
      ctx.addIssue({
        code: "custom",
        path: ["isStretch"],
        message: "Only strategic goals can be marked as stretch targets",
      });
    }
  }

  if (value.layer !== "DEVELOPMENTAL" && value.developmentCategory) {
    ctx.addIssue({
      code: "custom",
      path: ["developmentCategory"],
      message: "Development categories apply to developmental goals only",
    });
  }
}

export const agreementItemSchema = z.object(baseItemShape).superRefine(checkLayerFields);

export const updateAgreementItemSchema = z
  .object(baseItemShape)
  .partial()
  .superRefine(checkLayerFields)
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const createAgreementSchema = z.object({
  cycleId: z.string().min(1),
  /// Defaults to the caller; a solid lead or HR may open an agreement for a report.
  userId: z.string().min(1).optional(),
  items: z.array(agreementItemSchema).max(30).default([]),
});

export const listAgreementsQuerySchema = z.object({
  cycleId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  status: z
    .enum([
      "DRAFT",
      "DOTTED_LEAD_REVIEW",
      "EMPLOYEE_SIGNED",
      "MANAGER_SIGNED",
      "APPROVED",
      "AMENDMENT_IN_PROGRESS",
      "ARCHIVED",
    ])
    .optional(),
  /// "reports" narrows the list to people the caller leads (solid or dotted).
  scope: z.enum(["all", "mine", "reports"]).default("all"),
  take: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export const agreementTransitionSchema = z.object({
  action: z.enum([
    "SUBMIT_FOR_REVIEW",
    "DOTTED_LEAD_REVIEW",
    "EMPLOYEE_SIGN",
    "MANAGER_SIGN",
    "APPROVE",
    "RETURN_TO_DRAFT",
    "REQUEST_AMENDMENT",
    "COMPLETE_AMENDMENT",
    "ARCHIVE",
  ]),
  /// Required for amendments so the reason for changing a locked agreement is on record.
  reason: z.string().trim().max(2000).optional(),
  note: z.string().trim().max(2000).optional(),
});

export const agreementCommentSchema = z.object({
  itemId: z.string().min(1).optional(),
  type: z.enum(["SUGGESTION", "ENDORSEMENT", "OBJECTION", "QUESTION"]).default("SUGGESTION"),
  body: z.string().trim().min(1).max(2000),
});

export const replaceItemsSchema = z.object({
  items: z.array(agreementItemSchema).min(1).max(30),
});

export type AgreementItemInput = z.infer<typeof agreementItemSchema>;
export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;
export type AgreementTransitionInput = z.infer<typeof agreementTransitionSchema>;
