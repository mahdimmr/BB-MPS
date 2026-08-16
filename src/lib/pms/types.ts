import type { AppLocale, Dictionary } from "@/lib/i18n";

export type DemoRole = "EMPLOYEE" | "SOLID_LEAD" | "DOTTED_LEAD" | "HR_ADMIN";

export type TabId = "dashboard" | "agreement" | "oneOnOne" | "midTerm" | "evaluation" | "pip";

export type MetricLayer = "STRATEGIC" | "OPERATIONAL" | "DEVELOPMENTAL";

export type AgreementStatus =
  | "DRAFT"
  | "DOTTED_LEAD_REVIEW"
  | "EMPLOYEE_SIGNED"
  | "MANAGER_SIGNED"
  | "APPROVED"
  | "AMENDMENT_IN_PROGRESS";

export type MidTermStatus = "ON_TRACK" | "AMENDMENT_NEEDED" | "PERFORMANCE_RISK";

export type Score =
  | "OUTSTANDING"
  | "ABOVE_EXPECTATIONS"
  | "MEETS_EXPECTATIONS"
  | "NEEDS_IMPROVEMENT"
  | "POOR";

export type PipStatus = "PENDING_COMMITTEE" | "ACTIVE" | "SUCCESS_RETURNED" | "FAILED_TERMINATED";

export type Localized = { fa: string; en: string };

export type Person = {
  name: Localized;
  title: Localized;
  department: Localized;
};

export type AgreementItem = {
  id: string;
  layer: MetricLayer;
  title: Localized;
  description: Localized;
  weight: number;
  targetValue: Localized;
  measurementMethod: Localized;
  successCriteria: Localized;
  isStretch?: boolean;
  okrTitle?: Localized;
  developmentCategory?: "TECHNICAL_SKILL" | "BEHAVIORAL_COMPETENCY" | "LEADERSHIP" | "CERTIFICATION";
};

export type OneOnOneLog = {
  id: string;
  date: string;
  achievements: string;
  roadblocks: string;
  actionItems: string;
  loggedBy: DemoRole;
};

export type PeerNote = {
  id: string;
  author: Localized;
  relationship: Localized;
  text: Localized;
};

export type PipObjective = {
  id: string;
  title: Localized;
  done: boolean;
};

export type PmsSnapshot = {
  agreementStatus: AgreementStatus;
  employeeSigned: boolean;
  managerSigned: boolean;
  dottedConsulted: boolean;
  dottedFeedback: string;
  items: AgreementItem[];
  meetings: OneOnOneLog[];
  midTermStatus: MidTermStatus | null;
  midTermFeedback: string;
  midTermAcknowledged: boolean;
  evalStep: 1 | 2 | 3 | 4;
  selfReflection: string;
  impactNarrative: string;
  challenges: string;
  selfSubmitted: boolean;
  layerScores: Record<MetricLayer, number>;
  managerSubmitted: boolean;
  dottedEvalComment: string;
  peerNotes: PeerNote[];
  finalRating: Score | null;
  calibrated: boolean;
  pipTriggered: boolean;
  pipTrigger: "MID_TERM_RISK" | "FINAL_NEEDS_IMPROVEMENT" | null;
  pipStatus: PipStatus;
  pipDuration: 1 | 2;
  pipCheckpoints: boolean[];
  pipObjectives: PipObjective[];
  notice: string | null;
};

export type PmsContextValue = PmsSnapshot & {
  role: DemoRole;
  tab: TabId;
  locale: AppLocale;
  t: Dictionary;
  setRole: (role: DemoRole) => void;
  setTab: (tab: TabId) => void;
  loc: (value: Localized) => string;
  locked: boolean;
  weightTotal: number;
  updateItem: (id: string, patch: Partial<AgreementItem>) => void;
  addItem: (layer: MetricLayer) => void;
  removeItem: (id: string) => void;
  setDottedFeedback: (value: string) => void;
  recordDottedConsultation: () => void;
  signEmployee: () => void;
  signManager: () => void;
  addMeeting: (log: Omit<OneOnOneLog, "id" | "loggedBy">) => void;
  submitMidTerm: (status: MidTermStatus, feedback: string) => void;
  acknowledgeMidTerm: () => void;
  setEvalField: (field: "selfReflection" | "impactNarrative" | "challenges" | "dottedEvalComment", value: string) => void;
  setEvalStep: (step: 1 | 2 | 3 | 4) => void;
  submitSelfEval: () => void;
  setLayerScore: (layer: MetricLayer, value: number) => void;
  submitManagerEval: () => void;
  setFinalRating: (score: Score) => void;
  submitCalibration: () => void;
  authorizePip: () => void;
  setPipDuration: (months: 1 | 2) => void;
  toggleCheckpoint: (index: number) => void;
  togglePipObjective: (id: string) => void;
  setPipOutcome: (outcome: "SUCCESS_RETURNED" | "FAILED_TERMINATED") => void;
  resetDemo: () => void;
};

export const SCORE_ORDER: Score[] = [
  "OUTSTANDING",
  "ABOVE_EXPECTATIONS",
  "MEETS_EXPECTATIONS",
  "NEEDS_IMPROVEMENT",
  "POOR",
];

export const LAYERS: MetricLayer[] = ["STRATEGIC", "OPERATIONAL", "DEVELOPMENTAL"];

export const TABS: TabId[] = ["dashboard", "agreement", "oneOnOne", "midTerm", "evaluation", "pip"];

export const DEMO_ROLES: DemoRole[] = ["EMPLOYEE", "SOLID_LEAD", "DOTTED_LEAD", "HR_ADMIN"];

export const LAYER_PILLAR: Record<MetricLayer, "wisdom" | "achievement" | "candor"> = {
  STRATEGIC: "wisdom",
  OPERATIONAL: "achievement",
  DEVELOPMENTAL: "candor",
};

export const SLIDER_TO_SCORE: Score[] = [
  "POOR",
  "NEEDS_IMPROVEMENT",
  "MEETS_EXPECTATIONS",
  "ABOVE_EXPECTATIONS",
  "OUTSTANDING",
];
