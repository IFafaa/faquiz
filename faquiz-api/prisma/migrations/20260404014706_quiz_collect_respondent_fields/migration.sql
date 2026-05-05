ALTER TABLE "Quiz" ADD COLUMN     "collectEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "collectName" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "collectPhone" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "QuizSession" ADD COLUMN     "respondentEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "respondentPhone" TEXT NOT NULL DEFAULT '';
