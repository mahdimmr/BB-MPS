import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { addDays, addMonths } from "date-fns";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/// Demo password for every seeded account — development only.
const DEMO_PASSWORD = "Bimeh@1405";

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const hr = await prisma.user.upsert({
    where: { email: "hr@bimehbazar.test" },
    update: {},
    create: {
      email: "hr@bimehbazar.test",
      name: "زهرا موسوی",
      nameEn: "Zahra Mousavi",
      jobTitle: "مدیر منابع انسانی",
      jobTitleEn: "Head of People",
      department: "منابع انسانی",
      roles: ["HR_ADMIN", "COMMITTEE_MEMBER"],
      passwordHash,
    },
  });

  const solidLead = await prisma.user.upsert({
    where: { email: "lead@bimehbazar.test" },
    update: {},
    create: {
      email: "lead@bimehbazar.test",
      name: "امیر رضایی",
      nameEn: "Amir Rezaei",
      jobTitle: "مدیر مهندسی",
      jobTitleEn: "Engineering Manager",
      department: "فناوری",
      roles: ["SOLID_LEAD", "EMPLOYEE"],
      passwordHash,
    },
  });

  const dottedLead = await prisma.user.upsert({
    where: { email: "tech-lead@bimehbazar.test" },
    update: {},
    create: {
      email: "tech-lead@bimehbazar.test",
      name: "سارا کریمی",
      nameEn: "Sara Karimi",
      jobTitle: "راهبر فنی بک‌اند",
      jobTitleEn: "Backend Tech Lead",
      department: "فناوری",
      roles: ["DOTTED_LEAD", "EMPLOYEE"],
      passwordHash,
    },
  });

  const committeeMember = await prisma.user.upsert({
    where: { email: "committee@bimehbazar.test" },
    update: {},
    create: {
      email: "committee@bimehbazar.test",
      name: "محمد احمدی",
      nameEn: "Mohammad Ahmadi",
      jobTitle: "مدیر عملیات",
      jobTitleEn: "Operations Director",
      department: "عملیات",
      roles: ["COMMITTEE_MEMBER", "SOLID_LEAD", "EMPLOYEE"],
      passwordHash,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@bimehbazar.test" },
    update: { solidLeadId: solidLead.id, dottedLeadId: dottedLead.id },
    create: {
      email: "employee@bimehbazar.test",
      name: "نگار حسینی",
      nameEn: "Negar Hosseini",
      jobTitle: "مهندس نرم‌افزار",
      jobTitleEn: "Software Engineer",
      department: "فناوری",
      roles: ["EMPLOYEE"],
      passwordHash,
      solidLeadId: solidLead.id,
      dottedLeadId: dottedLead.id,
    },
  });

  // Cycles run for exactly four months.
  const startDate = new Date("2026-07-22T00:00:00.000Z");
  const endDate = addMonths(startDate, 4);

  const cycle = await prisma.performanceCycle.upsert({
    where: { title: "1405-Q2" },
    update: {},
    create: {
      title: "1405-Q2",
      titleEn: "1405-Q2 (Jul–Nov 2026)",
      description: "دومین چرخه عملکرد سال ۱۴۰۵",
      startDate,
      endDate,
      status: "ACTIVE",
      goalSettingDeadline: addMonths(startDate, 1),
      midTermReviewDate: addMonths(startDate, 2),
      finalEvaluationStart: addDays(endDate, -15),
      createdById: hr.id,
    },
  });

  const existingObjectives = await prisma.companyObjective.count({ where: { cycleId: cycle.id } });

  const objective =
    existingObjectives > 0
      ? await prisma.companyObjective.findFirstOrThrow({ where: { cycleId: cycle.id } })
      : await prisma.companyObjective.create({
          data: {
            cycleId: cycle.id,
            title: "رشد سهم بازار بیمه‌های آنلاین",
            titleEn: "Grow online insurance market share",
            description: "افزایش سهم فروش دیجیتال و بهبود تجربه خرید مشتری",
            ownerTeam: "فناوری",
            keyResults: [
              { title: "افزایش نرخ تبدیل قیف خرید", target: "18", unit: "درصد" },
              { title: "کاهش زمان صدور بیمه‌نامه", target: "4", unit: "دقیقه" },
            ],
            order: 0,
          },
        });

  const agreement = await prisma.performanceAgreement.upsert({
    where: { userId_cycleId: { userId: employee.id, cycleId: cycle.id } },
    update: {},
    create: {
      userId: employee.id,
      cycleId: cycle.id,
      status: "DRAFT",
      items: {
        create: [
          {
            layer: "STRATEGIC",
            title: "افزایش نرخ تبدیل صفحه مقایسه بیمه شخص ثالث",
            titleEn: "Increase conversion on the third-party comparison page",
            description: "همکاری با تیم محصول برای بازطراحی جریان خرید",
            weight: 30,
            targetValue: "+۳ واحد درصد",
            measurementMethod: "داشبورد تحلیلی محصول",
            isStretch: true,
            companyObjectiveId: objective.id,
            order: 0,
          },
          {
            layer: "OPERATIONAL",
            title: "پایداری سرویس صدور بیمه‌نامه",
            titleEn: "Policy issuance service reliability",
            weight: 25,
            targetValue: "۹۹٫۹٪ در دسترس‌بودن",
            measurementMethod: "گزارش ماهانه SLA",
            order: 1,
          },
          {
            layer: "OPERATIONAL",
            title: "بستن تیکت‌های پشتیبانی فنی در SLA",
            titleEn: "Resolve engineering support tickets within SLA",
            weight: 25,
            targetValue: "۹۰٪ تیکت‌ها",
            measurementMethod: "سامانه تیکتینگ",
            order: 2,
          },
          {
            layer: "DEVELOPMENTAL",
            title: "تسلط بر طراحی سیستم‌های رویدادمحور",
            titleEn: "Deepen event-driven system design skills",
            weight: 20,
            developmentCategory: "TECHNICAL_SKILL",
            measurementMethod: "ارائه داخلی و بازبینی طراحی با راهبر فنی",
            order: 3,
          },
        ],
      },
    },
    include: { items: true },
  });

  const existingMeetings = await prisma.oneToOneMeeting.count({
    where: { cycleId: cycle.id, employeeId: employee.id },
  });

  if (existingMeetings === 0) {
    await prisma.oneToOneMeeting.createMany({
      data: [
        {
          employeeId: employee.id,
          managerId: solidLead.id,
          cycleId: cycle.id,
          scheduledFor: addDays(startDate, 14),
          completedAt: addDays(startDate, 14),
          status: "COMPLETED",
          wentWell: "تحویل به‌موقع نسخه اول صفحه مقایسه",
          roadblocks: "وابستگی به تیم داده برای رویدادهای تحلیلی",
          discussionPoints: "هماهنگی با تیم داده در هفته آینده",
        },
        {
          employeeId: employee.id,
          managerId: solidLead.id,
          cycleId: cycle.id,
          scheduledFor: addDays(startDate, 35),
          status: "SCHEDULED",
        },
      ],
    });
  }

  console.log("Seed complete:");
  console.table([
    { role: "HR / Committee", email: hr.email },
    { role: "Solid Lead", email: solidLead.email },
    { role: "Dotted Lead", email: dottedLead.email },
    { role: "Committee Member", email: committeeMember.email },
    { role: "Employee", email: employee.email },
  ]);
  console.log(`Password for all demo accounts: ${DEMO_PASSWORD}`);
  console.log(`Cycle ${cycle.title} with agreement ${agreement.id} (${agreement.items.length} goals)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
