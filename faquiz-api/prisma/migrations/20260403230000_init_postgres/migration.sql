CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "rootNodeId" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionNode" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "questionNodeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nextQuestionNodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "respondentName" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "pathTaken" TEXT NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SessionAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionNodeId" TEXT NOT NULL,
    "answerOptionId" TEXT,
    "answerValue" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

CREATE INDEX "Quiz_adminId_idx" ON "Quiz"("adminId");

CREATE INDEX "QuestionNode_quizId_idx" ON "QuestionNode"("quizId");

CREATE INDEX "AnswerOption_questionNodeId_idx" ON "AnswerOption"("questionNodeId");

CREATE INDEX "AnswerOption_nextQuestionNodeId_idx" ON "AnswerOption"("nextQuestionNodeId");

CREATE INDEX "QuizSession_quizId_idx" ON "QuizSession"("quizId");

CREATE INDEX "QuizSession_status_idx" ON "QuizSession"("status");

CREATE INDEX "SessionAnswer_sessionId_idx" ON "SessionAnswer"("sessionId");

CREATE INDEX "SessionAnswer_questionNodeId_idx" ON "SessionAnswer"("questionNodeId");

ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QuestionNode" ADD CONSTRAINT "QuestionNode_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionNodeId_fkey" FOREIGN KEY ("questionNodeId") REFERENCES "QuestionNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_nextQuestionNodeId_fkey" FOREIGN KEY ("nextQuestionNodeId") REFERENCES "QuestionNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SessionAnswer" ADD CONSTRAINT "SessionAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionAnswer" ADD CONSTRAINT "SessionAnswer_questionNodeId_fkey" FOREIGN KEY ("questionNodeId") REFERENCES "QuestionNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SessionAnswer" ADD CONSTRAINT "SessionAnswer_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "AnswerOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
