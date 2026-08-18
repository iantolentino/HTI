CREATE TABLE "MonthlyChallenge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "monthKey" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "exp" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "MonthlyChallenge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MonthlyChallenge_userId_monthKey_key" ON "MonthlyChallenge"("userId", "monthKey");
ALTER TABLE "MonthlyChallenge" ADD CONSTRAINT "MonthlyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
