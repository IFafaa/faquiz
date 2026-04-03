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
}

export interface SubmitAnswerResponse {
  completed: boolean
  question: PublicQuestion | null
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
