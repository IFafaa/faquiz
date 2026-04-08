-- Drop FK and index on Quiz.adminId, then rename Admin -> User and adminId -> userId

ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_adminId_fkey";

DROP INDEX IF EXISTS "Quiz_adminId_idx";

ALTER TABLE "Admin" RENAME TO "User";

ALTER TABLE "User" RENAME CONSTRAINT "Admin_pkey" TO "User_pkey";

ALTER INDEX "Admin_email_key" RENAME TO "User_email_key";

ALTER TABLE "Quiz" RENAME COLUMN "adminId" TO "userId";

CREATE INDEX "Quiz_userId_idx" ON "Quiz"("userId");

ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
