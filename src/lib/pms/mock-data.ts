import type { AgreementItem, OneOnOneLog, PeerNote, Person, PipObjective, PmsSnapshot } from "@/lib/pms/types";

export const SUBJECT: Person = {
  name: { fa: "نگار حسینی", en: "Negar Hosseini" },
  title: { fa: "مهندس نرم‌افزار", en: "Software Engineer" },
  department: { fa: "فناوری", en: "Engineering" },
};

export const SOLID_LEAD: Person = {
  name: { fa: "امیر رضایی", en: "Amir Rezaei" },
  title: { fa: "مدیر مهندسی", en: "Engineering Manager" },
  department: { fa: "فناوری", en: "Engineering" },
};

export const DOTTED_LEAD: Person = {
  name: { fa: "سارا کریمی", en: "Sara Karimi" },
  title: { fa: "مدیر تخصصی بک‌اند", en: "Backend Tech Lead" },
  department: { fa: "فناوری", en: "Engineering" },
};

export const HR_PERSON: Person = {
  name: { fa: "زهرا موسوی", en: "Zahra Mousavi" },
  title: { fa: "مدیر منابع انسانی", en: "Head of People" },
  department: { fa: "منابع انسانی", en: "People" },
};

export const CYCLE = {
  title: "1405-Q2",
  titleEn: "1405-Q2 (Jul–Nov 2026)",
  start: "2026-07-22",
  goalDeadline: "2026-08-22",
  midTerm: "2026-09-22",
  finalStart: "2026-11-07",
  end: "2026-11-22",
};

export const COMPANY_OKR = {
  fa: "رشد سهم بازار بیمه‌های آنلاین",
  en: "Grow online insurance market share",
};

const ITEMS: AgreementItem[] = [
  {
    id: "g-strategic-1",
    layer: "STRATEGIC",
    title: {
      fa: "افزایش نرخ تبدیل صفحه مقایسه بیمه شخص ثالث",
      en: "Increase conversion on the third-party comparison page",
    },
    description: {
      fa: "همکاری با تیم محصول برای بازطراحی جریان خرید",
      en: "Partner with product to redesign the purchase flow",
    },
    weight: 30,
    targetValue: { fa: "+۳ واحد درصد", en: "+3 percentage points" },
    measurementMethod: { fa: "داشبورد تحلیلی محصول", en: "Product analytics dashboard" },
    successCriteria: {
      fa: "نرخ تبدیل صفحه مقایسه در پایان چرخه حداقل ۳ واحد درصد بالاتر از خط پایه تیرماه باشد.",
      en: "Comparison-page conversion is at least 3pp above the July baseline by cycle end.",
    },
    isStretch: true,
    okrTitle: COMPANY_OKR,
  },
  {
    id: "g-ops-1",
    layer: "OPERATIONAL",
    title: {
      fa: "پایداری سرویس صدور بیمه‌نامه",
      en: "Policy issuance service reliability",
    },
    description: {
      fa: "نگهداری SLA صدور و کاهش خطای مسیر خرید",
      en: "Hold issuance SLA and reduce purchase-path errors",
    },
    weight: 25,
    targetValue: { fa: "۹۹٫۹٪ در دسترس‌بودن", en: "99.9% availability" },
    measurementMethod: { fa: "گزارش ماهانه SLA", en: "Monthly SLA report" },
    successCriteria: {
      fa: "در دسترس‌بودن ماهانه صدور زیر ۹۹٫۹٪ نرود و حادثه P1 بیش از یک مورد نباشد.",
      en: "Monthly issuance availability stays at 99.9% with at most one P1 incident.",
    },
  },
  {
    id: "g-ops-2",
    layer: "OPERATIONAL",
    title: {
      fa: "بستن تیکت‌های پشتیبانی فنی در SLA",
      en: "Resolve engineering support tickets within SLA",
    },
    description: {
      fa: "پاسخ‌گویی قابل اتکا به تیم‌های محصول و عملیات",
      en: "Reliable response to product and operations partners",
    },
    weight: 25,
    targetValue: { fa: "۹۰٪ تیکت‌ها", en: "90% of tickets" },
    measurementMethod: { fa: "سامانه تیکتینگ", en: "Ticketing system" },
    successCriteria: {
      fa: "حداقل ۹۰٪ تیکت‌های فنی در SLA بسته‌شوند.",
      en: "At least 90% of engineering tickets close within SLA.",
    },
  },
  {
    id: "g-dev-1",
    layer: "DEVELOPMENTAL",
    title: {
      fa: "تسلط بر طراحی سیستم‌های رویدادمحور",
      en: "Deepen event-driven system design skills",
    },
    description: {
      fa: "مسیر شغلی فنی با همراهی مدیر تخصصی",
      en: "Technical career path co-designed with the dotted lead",
    },
    weight: 20,
    targetValue: { fa: "یک ارائه داخلی + یک بازبینی طراحی", en: "One internal talk + one design review" },
    measurementMethod: {
      fa: "ارائه داخلی و بازبینی طراحی با مدیر تخصصی",
      en: "Internal talk and design review with the dotted lead",
    },
    successCriteria: {
      fa: "یک RFC رویدادمحور نوشته و با مدیر تخصصی بازبینی شود.",
      en: "Write an event-driven RFC and review it with the dotted lead.",
    },
    developmentCategory: "TECHNICAL_SKILL",
  },
];

const MEETINGS: OneOnOneLog[] = [
  {
    id: "m1",
    date: "2026-08-05",
    achievements: "تحویل به‌موقع نسخه اول صفحه مقایسه و هماهنگی اولیه با محصول.",
    roadblocks: "وابستگی به تیم داده برای رویدادهای تحلیلی.",
    actionItems: "هماهنگی با تیم داده در هفته آینده؛ پیش‌نویس قرارداد رویدادها.",
    loggedBy: "SOLID_LEAD",
  },
];

const PEERS: PeerNote[] = [
  {
    id: "p1",
    author: { fa: "علی نوری", en: "Ali Nouri" },
    relationship: { fa: "همکار محصول", en: "Product partner" },
    text: {
      fa: "نگار در بازطراحی جریان خرید نقش تسهیل‌گر داشت و تصمیم‌ها را با داده جلو برد.",
      en: "Negar unblocked the purchase-flow redesign and kept decisions evidence-based.",
    },
  },
  {
    id: "p2",
    author: { fa: "مریم کاظمی", en: "Maryam Kazemi" },
    relationship: { fa: "همکار عملیات", en: "Operations partner" },
    text: {
      fa: "پاسخ‌گویی به تیکت‌های صدور شفاف و به‌موقع بود؛ هنوز ظرفیت برای مستندسازی Runbook هست.",
      en: "Issuance tickets were answered clearly and on time; a runbook would still help.",
    },
  },
];

const PIP_OBJECTIVES: PipObjective[] = [
  {
    id: "pip-1",
    title: {
      fa: "انتشار دو آزمایش A/B روی قیف مقایسه تا پایان هفته ۴",
      en: "Ship two A/B tests on the comparison funnel by week 4",
    },
    done: false,
  },
  {
    id: "pip-2",
    title: {
      fa: "جلسه هفتگی pair با مدیر تخصصی روی طراحی رویدادمحور",
      en: "Weekly pairing with the dotted lead on event-driven design",
    },
    done: false,
  },
  {
    id: "pip-3",
    title: {
      fa: "تحویل Runbook پایداری صدور و بازبینی با مدیر مستقیم",
      en: "Deliver the issuance reliability runbook and review it with the solid lead",
    },
    done: false,
  },
  {
    id: "pip-4",
    title: {
      fa: "بستن حداقل ۹۰٪ تیکت‌ها در SLA برای چهار هفته متوالی",
      en: "Close at least 90% of tickets within SLA for four consecutive weeks",
    },
    done: false,
  },
];

const TEMPLATE: PmsSnapshot = {
    agreementStatus: "DRAFT",
    employeeSigned: false,
    managerSigned: false,
    dottedConsulted: false,
    dottedFeedback: "",
    items: ITEMS,
    meetings: MEETINGS,
    midTermStatus: null,
    midTermFeedback: "",
    midTermAcknowledged: false,
    evalStep: 1,
    selfReflection: "",
    impactNarrative: "",
    challenges: "",
    selfSubmitted: false,
    layerScores: { STRATEGIC: 3, OPERATIONAL: 3, DEVELOPMENTAL: 3 },
    managerSubmitted: false,
    dottedEvalComment: "",
    peerNotes: PEERS,
    finalRating: null,
    calibrated: false,
    pipTriggered: false,
    pipTrigger: null,
    pipStatus: "PENDING_COMMITTEE",
    pipDuration: 2,
    pipCheckpoints: Array.from({ length: 8 }, () => false),
    pipObjectives: PIP_OBJECTIVES,
    notice: null,
};

export function createInitialSnapshot(): PmsSnapshot {
  return structuredClone(TEMPLATE);
}

export const EMPTY_GOAL: Record<AgreementItem["layer"], Omit<AgreementItem, "id">> = {
  STRATEGIC: {
    layer: "STRATEGIC",
    title: { fa: "هدف راهبردی جدید", en: "New strategic goal" },
    description: { fa: "", en: "" },
    weight: 10,
    targetValue: { fa: "", en: "" },
    measurementMethod: { fa: "", en: "" },
    successCriteria: { fa: "", en: "" },
    isStretch: false,
    okrTitle: COMPANY_OKR,
  },
  OPERATIONAL: {
    layer: "OPERATIONAL",
    title: { fa: "شاخص عملیاتی جدید", en: "New operational KPI" },
    description: { fa: "", en: "" },
    weight: 10,
    targetValue: { fa: "", en: "" },
    measurementMethod: { fa: "", en: "" },
    successCriteria: { fa: "", en: "" },
  },
  DEVELOPMENTAL: {
    layer: "DEVELOPMENTAL",
    title: { fa: "هدف توسعه‌ای جدید", en: "New developmental goal" },
    description: { fa: "", en: "" },
    weight: 10,
    targetValue: { fa: "", en: "" },
    measurementMethod: { fa: "", en: "" },
    successCriteria: { fa: "", en: "" },
    developmentCategory: "TECHNICAL_SKILL",
  },
};
