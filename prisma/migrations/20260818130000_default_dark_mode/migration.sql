UPDATE "User" SET "darkMode" = true WHERE "darkMode" = false;
ALTER TABLE "User" ALTER COLUMN "darkMode" SET DEFAULT true;
