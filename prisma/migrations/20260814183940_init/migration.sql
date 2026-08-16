-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HR_ADMIN', 'EMPLOYEE', 'SOLID_LEAD', 'DOTTED_LEAD', 'COMMITTEE_MEMBER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'ON_PIP', 'OFFBOARDING', 'TERMINATED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('FA', 'EN');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CALIBRATING', 'CLOSED');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'DOTTED_LEAD_REVIEW', 'EMPLOYEE_SIGNED', 'MANAGER_SIGNED', 'APPROVED', 'AMENDMENT_IN_PROGRESS', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MetricLayer" AS ENUM ('STRATEGIC', 'OPERATIONAL', 'DEVELOPMENTAL');

-- CreateEnum
CREATE TYPE "DevelopmentCategory" AS ENUM ('TECHNICAL_SKILL', 'BEHAVIORAL_COMPETENCY', 'LEADERSHIP', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('SUGGESTION', 'ENDORSEMENT', 'OBJECTION', 'QUESTION');

-- CreateEnum
CREATE TYPE "AmendmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActionItemStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MidTermStatus" AS ENUM ('ON_TRACK', 'AMENDMENT_NEEDED', 'PERFORMANCE_RISK');

-- CreateEnum
CREATE TYPE "RiskAction" AS ENUM ('CONTINUE', 'AMENDMENT', 'PIP', 'OFFBOARDING');

-- CreateEnum
CREATE TYPE "FinalEvaluationStatus" AS ENUM ('DRAFT', 'SELF_EVALUATED', 'SOLID_LEAD_EVALUATED', 'MULTI_LEVEL_COMPLETED', 'CALIBRATED', 'SHARED_WITH_EMPLOYEE');

-- CreateEnum
CREATE TYPE "Score" AS ENUM ('OUTSTANDING', 'ABOVE_EXPECTATIONS', 'MEETS_EXPECTATIONS', 'NEEDS_IMPROVEMENT', 'POOR');

-- CreateEnum
CREATE TYPE "FeedbackRelationship" AS ENUM ('DOTTED_LEAD', 'CROSS_TEAM_STAKEHOLDER', 'PEER', 'PROJECT_LEAD', 'INTERNAL_CUSTOMER');

-- CreateEnum
CREATE TYPE "FeedbackVisibility" AS ENUM ('HR_ONLY', 'MANAGER_AND_HR', 'SHARED_WITH_EMPLOYEE');

-- CreateEnum
CREATE TYPE "CalibrationStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PipStatus" AS ENUM ('PENDING_COMMITTEE', 'REJECTED_BY_COMMITTEE', 'ACTIVE', 'SUCCESS_RETURNED', 'FAILED_TERMINATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PipTrigger" AS ENUM ('MID_TERM_RISK', 'FINAL_NEEDS_IMPROVEMENT', 'MANAGER_INITIATED');

-- CreateEnum
CREATE TYPE "PipObjectiveStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'MISSED');

-- CreateEnum
CREATE TYPE "CommitteeReviewType" AS ENUM ('PIP_APPROVAL', 'PIP_OUTCOME', 'TERMINATION_APPROVAL', 'CALIBRATION_APPEAL');

-- CreateEnum
CREATE TYPE "CommitteeDecision" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CHANGES', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "ExitTrigger" AS ENUM ('POOR_RATING', 'PIP_FAILED', 'VOLUNTARY', 'OTHER');

-- CreateEnum
CREATE TYPE "ExitStatus" AS ENUM ('EVIDENCE_REVIEW', 'PENDING_COMMITTEE', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "employeeNumber" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "jobTitle" TEXT,
    "jobTitleEn" TEXT,
    "department" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['EMPLOYEE']::"Role"[],
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "locale" "Locale" NOT NULL DEFAULT 'FA',
    "hireDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "solidLeadId" TEXT,
    "dottedLeadId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceCycle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'DRAFT',
    "goalSettingDeadline" TIMESTAMP(3) NOT NULL,
    "midTermReviewDate" TIMESTAMP(3) NOT NULL,
    "finalEvaluationStart" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyObjective" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "ownerTeam" TEXT,
    "keyResults" JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceAgreement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3),
    "dottedLeadReviewAt" TIMESTAMP(3),
    "employeeSignedAt" TIMESTAMP(3),
    "managerSignedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementItem" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "layer" "MetricLayer" NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "targetValue" TEXT,
    "measurementMethod" TEXT,
    "dueDate" TIMESTAMP(3),
    "isStretch" BOOLEAN NOT NULL DEFAULT false,
    "companyObjectiveId" TEXT,
    "developmentCategory" "DevelopmentCategory",
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgreementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementComment" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "itemId" TEXT,
    "authorId" TEXT NOT NULL,
    "type" "CommentType" NOT NULL DEFAULT 'SUGGESTION',
    "body" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementAmendment" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "midTermReviewId" TEXT,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "status" "AmendmentStatus" NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneToOneMeeting" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "cycleId" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "wentWell" TEXT,
    "roadblocks" TEXT,
    "discussionPoints" TEXT,
    "pipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneToOneMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "ActionItemStatus" NOT NULL DEFAULT 'OPEN',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MidTermReview" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "status" "MidTermStatus" NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "riskAction" "RiskAction",
    "dottedLeadInput" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "employeeResponse" TEXT,
    "evidenceMeetingIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MidTermReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalEvaluation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "agreementId" TEXT,
    "status" "FinalEvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "selfAchievements" TEXT,
    "selfChallenges" TEXT,
    "selfGrowth" TEXT,
    "selfSubmittedAt" TIMESTAMP(3),
    "evaluatedById" TEXT,
    "strategicScore" "Score",
    "operationalScore" "Score",
    "developmentalScore" "Score",
    "proposedScore" "Score",
    "managerFeedback" TEXT,
    "strengths" TEXT,
    "developmentAreas" TEXT,
    "managerSubmittedAt" TIMESTAMP(3),
    "calibrationSessionId" TEXT,
    "calibratedScore" "Score",
    "calibrationNotes" TEXT,
    "calibratedAt" TIMESTAMP(3),
    "sharedAt" TIMESTAMP(3),
    "employeeAcknowledgedAt" TIMESTAMP(3),
    "employeeComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationItemScore" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "agreementItemId" TEXT NOT NULL,
    "score" "Score" NOT NULL,
    "achievementPercent" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationItemScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiLevelFeedback" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "relationship" "FeedbackRelationship" NOT NULL,
    "projectContext" TEXT,
    "technicalFeedback" TEXT,
    "collaborationFeedback" TEXT,
    "suggestedScore" "Score",
    "visibility" "FeedbackVisibility" NOT NULL DEFAULT 'MANAGER_AND_HR',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MultiLevelFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationSession" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "CalibrationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "facilitatorId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalibrationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CalibrationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationAdjustment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "evaluationId" TEXT NOT NULL,
    "fromScore" "Score",
    "toScore" "Score" NOT NULL,
    "rationale" TEXT NOT NULL,
    "decidedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalibrationAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PIP" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "evaluationId" TEXT,
    "midTermReviewId" TEXT,
    "trigger" "PipTrigger" NOT NULL,
    "status" "PipStatus" NOT NULL DEFAULT 'PENDING_COMMITTEE',
    "durationMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "gapDescription" TEXT NOT NULL,
    "successCriteria" TEXT,
    "supportProvided" TEXT,
    "ownerId" TEXT NOT NULL,
    "hrMonitorId" TEXT,
    "committeeApprovedAt" TIMESTAMP(3),
    "outcomeDecidedAt" TIMESTAMP(3),
    "outcomeById" TEXT,
    "outcomeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PIP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipObjective" (
    "id" TEXT NOT NULL,
    "pipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "successMeasure" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "PipObjectiveStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipCoachingLog" (
    "id" TEXT NOT NULL,
    "pipId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "progressNotes" TEXT NOT NULL,
    "blockers" TEXT,
    "supportGiven" TEXT,
    "employeeComment" TEXT,
    "trend" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipCoachingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeReview" (
    "id" TEXT NOT NULL,
    "type" "CommitteeReviewType" NOT NULL,
    "pipId" TEXT,
    "exitCaseId" TEXT,
    "reviewerId" TEXT NOT NULL,
    "decision" "CommitteeDecision",
    "rationale" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitteeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitCase" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trigger" "ExitTrigger" NOT NULL,
    "status" "ExitStatus" NOT NULL DEFAULT 'EVIDENCE_REVIEW',
    "evaluationId" TEXT,
    "pipId" TEXT,
    "evidenceChecklist" JSONB NOT NULL DEFAULT '{}',
    "rationale" TEXT,
    "initiatedById" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "lastWorkingDay" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeNumber_key" ON "User"("employeeNumber");

-- CreateIndex
CREATE INDEX "User_solidLeadId_idx" ON "User"("solidLeadId");

-- CreateIndex
CREATE INDEX "User_dottedLeadId_idx" ON "User"("dottedLeadId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceCycle_title_key" ON "PerformanceCycle"("title");

-- CreateIndex
CREATE INDEX "PerformanceCycle_status_idx" ON "PerformanceCycle"("status");

-- CreateIndex
CREATE INDEX "PerformanceCycle_startDate_endDate_idx" ON "PerformanceCycle"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "CompanyObjective_cycleId_idx" ON "CompanyObjective"("cycleId");

-- CreateIndex
CREATE INDEX "PerformanceAgreement_cycleId_status_idx" ON "PerformanceAgreement"("cycleId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceAgreement_userId_cycleId_key" ON "PerformanceAgreement"("userId", "cycleId");

-- CreateIndex
CREATE INDEX "AgreementItem_agreementId_layer_idx" ON "AgreementItem"("agreementId", "layer");

-- CreateIndex
CREATE INDEX "AgreementItem_companyObjectiveId_idx" ON "AgreementItem"("companyObjectiveId");

-- CreateIndex
CREATE INDEX "AgreementComment_agreementId_idx" ON "AgreementComment"("agreementId");

-- CreateIndex
CREATE INDEX "AgreementComment_itemId_idx" ON "AgreementComment"("itemId");

-- CreateIndex
CREATE INDEX "AgreementAmendment_agreementId_status_idx" ON "AgreementAmendment"("agreementId", "status");

-- CreateIndex
CREATE INDEX "OneToOneMeeting_employeeId_scheduledFor_idx" ON "OneToOneMeeting"("employeeId", "scheduledFor");

-- CreateIndex
CREATE INDEX "OneToOneMeeting_managerId_status_idx" ON "OneToOneMeeting"("managerId", "status");

-- CreateIndex
CREATE INDEX "OneToOneMeeting_cycleId_idx" ON "OneToOneMeeting"("cycleId");

-- CreateIndex
CREATE INDEX "ActionItem_meetingId_idx" ON "ActionItem"("meetingId");

-- CreateIndex
CREATE INDEX "ActionItem_ownerId_status_idx" ON "ActionItem"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MidTermReview_agreementId_key" ON "MidTermReview"("agreementId");

-- CreateIndex
CREATE INDEX "MidTermReview_reviewerId_idx" ON "MidTermReview"("reviewerId");

-- CreateIndex
CREATE INDEX "MidTermReview_status_idx" ON "MidTermReview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FinalEvaluation_agreementId_key" ON "FinalEvaluation"("agreementId");

-- CreateIndex
CREATE INDEX "FinalEvaluation_cycleId_status_idx" ON "FinalEvaluation"("cycleId", "status");

-- CreateIndex
CREATE INDEX "FinalEvaluation_calibrationSessionId_idx" ON "FinalEvaluation"("calibrationSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalEvaluation_employeeId_cycleId_key" ON "FinalEvaluation"("employeeId", "cycleId");

-- CreateIndex
CREATE INDEX "EvaluationItemScore_evaluationId_idx" ON "EvaluationItemScore"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationItemScore_evaluationId_agreementItemId_key" ON "EvaluationItemScore"("evaluationId", "agreementItemId");

-- CreateIndex
CREATE INDEX "MultiLevelFeedback_evaluationId_idx" ON "MultiLevelFeedback"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "MultiLevelFeedback_evaluationId_authorId_key" ON "MultiLevelFeedback"("evaluationId", "authorId");

-- CreateIndex
CREATE INDEX "CalibrationSession_cycleId_status_idx" ON "CalibrationSession"("cycleId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationParticipant_sessionId_userId_key" ON "CalibrationParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "CalibrationAdjustment_evaluationId_idx" ON "CalibrationAdjustment"("evaluationId");

-- CreateIndex
CREATE INDEX "CalibrationAdjustment_sessionId_idx" ON "CalibrationAdjustment"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PIP_evaluationId_key" ON "PIP"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "PIP_midTermReviewId_key" ON "PIP"("midTermReviewId");

-- CreateIndex
CREATE INDEX "PIP_employeeId_status_idx" ON "PIP"("employeeId", "status");

-- CreateIndex
CREATE INDEX "PIP_status_idx" ON "PIP"("status");

-- CreateIndex
CREATE INDEX "PipObjective_pipId_idx" ON "PipObjective"("pipId");

-- CreateIndex
CREATE INDEX "PipCoachingLog_pipId_checkInDate_idx" ON "PipCoachingLog"("pipId", "checkInDate");

-- CreateIndex
CREATE INDEX "CommitteeReview_pipId_idx" ON "CommitteeReview"("pipId");

-- CreateIndex
CREATE INDEX "CommitteeReview_exitCaseId_idx" ON "CommitteeReview"("exitCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeReview_type_pipId_reviewerId_key" ON "CommitteeReview"("type", "pipId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeReview_type_exitCaseId_reviewerId_key" ON "CommitteeReview"("type", "exitCaseId", "reviewerId");

-- CreateIndex
CREATE INDEX "ExitCase_employeeId_status_idx" ON "ExitCase"("employeeId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_solidLeadId_fkey" FOREIGN KEY ("solidLeadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dottedLeadId_fkey" FOREIGN KEY ("dottedLeadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceCycle" ADD CONSTRAINT "PerformanceCycle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyObjective" ADD CONSTRAINT "CompanyObjective_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAgreement" ADD CONSTRAINT "PerformanceAgreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAgreement" ADD CONSTRAINT "PerformanceAgreement_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementItem" ADD CONSTRAINT "AgreementItem_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "PerformanceAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementItem" ADD CONSTRAINT "AgreementItem_companyObjectiveId_fkey" FOREIGN KEY ("companyObjectiveId") REFERENCES "CompanyObjective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementComment" ADD CONSTRAINT "AgreementComment_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "PerformanceAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementComment" ADD CONSTRAINT "AgreementComment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AgreementItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementComment" ADD CONSTRAINT "AgreementComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementAmendment" ADD CONSTRAINT "AgreementAmendment_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "PerformanceAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementAmendment" ADD CONSTRAINT "AgreementAmendment_midTermReviewId_fkey" FOREIGN KEY ("midTermReviewId") REFERENCES "MidTermReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementAmendment" ADD CONSTRAINT "AgreementAmendment_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementAmendment" ADD CONSTRAINT "AgreementAmendment_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneToOneMeeting" ADD CONSTRAINT "OneToOneMeeting_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneToOneMeeting" ADD CONSTRAINT "OneToOneMeeting_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneToOneMeeting" ADD CONSTRAINT "OneToOneMeeting_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PerformanceCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneToOneMeeting" ADD CONSTRAINT "OneToOneMeeting_pipId_fkey" FOREIGN KEY ("pipId") REFERENCES "PIP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "OneToOneMeeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidTermReview" ADD CONSTRAINT "MidTermReview_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "PerformanceAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidTermReview" ADD CONSTRAINT "MidTermReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalEvaluation" ADD CONSTRAINT "FinalEvaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalEvaluation" ADD CONSTRAINT "FinalEvaluation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalEvaluation" ADD CONSTRAINT "FinalEvaluation_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "PerformanceAgreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalEvaluation" ADD CONSTRAINT "FinalEvaluation_evaluatedById_fkey" FOREIGN KEY ("evaluatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalEvaluation" ADD CONSTRAINT "FinalEvaluation_calibrationSessionId_fkey" FOREIGN KEY ("calibrationSessionId") REFERENCES "CalibrationSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationItemScore" ADD CONSTRAINT "EvaluationItemScore_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "FinalEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationItemScore" ADD CONSTRAINT "EvaluationItemScore_agreementItemId_fkey" FOREIGN KEY ("agreementItemId") REFERENCES "AgreementItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiLevelFeedback" ADD CONSTRAINT "MultiLevelFeedback_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "FinalEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiLevelFeedback" ADD CONSTRAINT "MultiLevelFeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationSession" ADD CONSTRAINT "CalibrationSession_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationSession" ADD CONSTRAINT "CalibrationSession_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationParticipant" ADD CONSTRAINT "CalibrationParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CalibrationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationParticipant" ADD CONSTRAINT "CalibrationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationAdjustment" ADD CONSTRAINT "CalibrationAdjustment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CalibrationSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationAdjustment" ADD CONSTRAINT "CalibrationAdjustment_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "FinalEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationAdjustment" ADD CONSTRAINT "CalibrationAdjustment_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIP" ADD CONSTRAINT "PIP_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIP" ADD CONSTRAINT "PIP_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "FinalEvaluation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIP" ADD CONSTRAINT "PIP_midTermReviewId_fkey" FOREIGN KEY ("midTermReviewId") REFERENCES "MidTermReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIP" ADD CONSTRAINT "PIP_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIP" ADD CONSTRAINT "PIP_hrMonitorId_fkey" FOREIGN KEY ("hrMonitorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PIP" ADD CONSTRAINT "PIP_outcomeById_fkey" FOREIGN KEY ("outcomeById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipObjective" ADD CONSTRAINT "PipObjective_pipId_fkey" FOREIGN KEY ("pipId") REFERENCES "PIP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipCoachingLog" ADD CONSTRAINT "PipCoachingLog_pipId_fkey" FOREIGN KEY ("pipId") REFERENCES "PIP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipCoachingLog" ADD CONSTRAINT "PipCoachingLog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeReview" ADD CONSTRAINT "CommitteeReview_pipId_fkey" FOREIGN KEY ("pipId") REFERENCES "PIP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeReview" ADD CONSTRAINT "CommitteeReview_exitCaseId_fkey" FOREIGN KEY ("exitCaseId") REFERENCES "ExitCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeReview" ADD CONSTRAINT "CommitteeReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitCase" ADD CONSTRAINT "ExitCase_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitCase" ADD CONSTRAINT "ExitCase_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "FinalEvaluation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitCase" ADD CONSTRAINT "ExitCase_pipId_fkey" FOREIGN KEY ("pipId") REFERENCES "PIP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitCase" ADD CONSTRAINT "ExitCase_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
