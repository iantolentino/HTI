ALTER TABLE "UserTask" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserTask" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "UserTask" ADD COLUMN "scheduleDays" JSONB NOT NULL DEFAULT '[0,1,2,3,4,5,6]';
ALTER TABLE "UserTask" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "UserTask_userId_isArchived_isPaused_sortOrder_idx" ON "UserTask"("userId", "isArchived", "isPaused", "sortOrder");
ALTER TABLE "MonthlyChallenge" ADD COLUMN "requirements" JSONB NOT NULL DEFAULT '{"health":true,"mental":true}';
