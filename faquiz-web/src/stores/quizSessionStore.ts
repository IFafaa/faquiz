import { create } from 'zustand'
import type { PublicQuestion } from '@/types/api'

export type QuizPlayPhase =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'submitting'
  | 'completed'
  | 'error'

interface QuizSessionState {
  phase: QuizPlayPhase
  sessionId: string | null
  quizId: string | null
  quizTitle: string | null
  quizDescription: string | null
  respondentName: string
  respondentEmail: string
  respondentPhone: string
  currentQuestion: PublicQuestion | null
  totalQuestions: number | null
  answeredCount: number | null
  currentQuestionNumber: number | null
  errorMessage: string | null
  reset: () => void
  setPhase: (phase: QuizPlayPhase) => void
  setError: (message: string | null) => void
  setSessionBootstrap: (payload: {
    sessionId: string
    quizId: string
    quizTitle: string
    quizDescription: string
    respondentName: string
    respondentEmail: string
    respondentPhone: string
    question: PublicQuestion | null
    totalQuestions: number
    answeredCount: number
    currentQuestionNumber: number
  }) => void
  setPlayState: (payload: {
    question: PublicQuestion | null
    totalQuestions: number
    answeredCount: number
    currentQuestionNumber: number
  }) => void
  setRespondentName: (name: string) => void
}

export const useQuizSessionStore = create<QuizSessionState>((set) => ({
  phase: 'idle',
  sessionId: null,
  quizId: null,
  quizTitle: null,
  quizDescription: null,
  respondentName: '',
  respondentEmail: '',
  respondentPhone: '',
  currentQuestion: null,
  totalQuestions: null,
  answeredCount: null,
  currentQuestionNumber: null,
  errorMessage: null,
  reset: () =>
    set({
      phase: 'idle',
      sessionId: null,
      quizId: null,
      quizTitle: null,
      quizDescription: null,
      respondentName: '',
      respondentEmail: '',
      respondentPhone: '',
      currentQuestion: null,
      totalQuestions: null,
      answeredCount: null,
      currentQuestionNumber: null,
      errorMessage: null,
    }),
  setPhase: (phase) => set({ phase }),
  setError: (errorMessage) => set({ errorMessage }),
  setSessionBootstrap: (payload) =>
    set({
      sessionId: payload.sessionId,
      quizId: payload.quizId,
      quizTitle: payload.quizTitle,
      quizDescription: payload.quizDescription,
      respondentName: payload.respondentName,
      respondentEmail: payload.respondentEmail,
      respondentPhone: payload.respondentPhone,
      currentQuestion: payload.question,
      totalQuestions: payload.totalQuestions,
      answeredCount: payload.answeredCount,
      currentQuestionNumber: payload.currentQuestionNumber,
      phase: 'playing',
      errorMessage: null,
    }),
  setPlayState: (payload) =>
    set({
      currentQuestion: payload.question,
      totalQuestions: payload.totalQuestions,
      answeredCount: payload.answeredCount,
      currentQuestionNumber: payload.currentQuestionNumber,
    }),
  setRespondentName: (respondentName) => set({ respondentName }),
}))
