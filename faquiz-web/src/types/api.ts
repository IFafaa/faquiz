export type QuestionType = 'multiple_choice' | 'text' | 'rating'

export interface PublicAnswerOption {
  id: string
  label: string
  value: string
  order: number
}

export interface PublicQuestion {
  id: string
  title: string
  description: string
  questionType: QuestionType
  answerOptions: PublicAnswerOption[]
}

export interface LoginResponse {
  accessToken: string
}

export interface QuizSummary {
  id: string
  title: string
  description: string
  isPublished: boolean
  collectName: boolean
  collectEmail: boolean
  collectPhone: boolean
  rootNodeId: string | null
  adminId: string
  createdAt: string
  updatedAt: string
}

export interface PublicQuizPayload {
  quiz: {
    id: string
    title: string
    description: string
    collectName: boolean
    collectEmail: boolean
    collectPhone: boolean
  }
  rootQuestion: PublicQuestion | null
}

export interface StartSessionResponse {
  sessionId: string
  quiz: {
    id: string
    title: string
    description: string
  }
  question: PublicQuestion | null
  /** Total de nós de pergunta no quiz (ex.: 30). */
  totalQuestions: number
  /** Quantas perguntas já foram respondidas nesta sessão. */
  answeredCount: number
  /**
   * Posição global da pergunta atual (1…totalQuestions), pela ordem de criação
   * dos nós. Barra = currentQuestionNumber / totalQuestions (ex.: 20/30 ou 11/30).
   */
  currentQuestionNumber: number
}

export interface SubmitAnswerResponse {
  completed: boolean
  question: PublicQuestion | null
  totalQuestions: number
  answeredCount: number
  currentQuestionNumber: number
}

export interface PublishedQuizCard {
  id: string
  title: string
  description: string
}

export interface UndoLastAnswerResponse {
  question: PublicQuestion
  totalQuestions: number
  answeredCount: number
  currentQuestionNumber: number
}

export interface QuizTreeSnapshot {
  quiz: QuizSummary
  nodes: Array<{
    id: string
    quizId: string
    title: string
    description: string
    questionType: QuestionType
    positionX: number
    positionY: number
    answerOptions: Array<{
      id: string
      questionNodeId: string
      label: string
      value: string
      order: number
      nextQuestionNodeId: string | null
    }>
  }>
}

export interface ShareResponse {
  publicUrl: string
  qrCodePngBase64: string
}

export interface AnalyticsResponse {
  quizId: string
  totalSessions: number
  completedSessions: number
  completionRate: number
  sessionsPerDay: Array<{ date: string; count: number }>
}

export interface QuizSessionRow {
  id: string
  quizId: string
  respondentName: string
  respondentEmail: string
  respondentPhone: string
  status: string
  pathTaken: string
  startedAt: string
  completedAt: string | null
}

export interface SessionDetailResponse {
  session: QuizSessionRow
  answers: Array<{
    id: string
    sessionId: string
    questionNodeId: string
    answerOptionId: string | null
    answerValue: string
    answeredAt: string
  }>
}

export interface QuestionAnswerFilter {
  questionNodeId: string
  answerValues: string[]
}

export interface ResponseFilters {
  respondentNameContains?: string
  respondentEmailContains?: string
  respondentPhoneContains?: string
  status?: string[]
  startedAtFrom?: string
  startedAtTo?: string
  completedAtFrom?: string
  completedAtTo?: string
  questionFilters?: QuestionAnswerFilter[]
}

export interface AggregatesResponse {
  quizId: string
  filteredSessionCount: number
  questions: Array<{
    questionNodeId: string
    title: string
    questionType: string
    distribution: Array<{ label: string; value: string; count: number }>
  }>
  timeline: Array<{ date: string; count: number }>
}
