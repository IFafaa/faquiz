-- AlterTable: optional password (contas só Google) e vínculo Google

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;

ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
