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
  currentQuestion: PublicQuestion | null
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
    question: PublicQuestion | null
  }) => void
  setQuestion: (question: PublicQuestion | null) => void
  setRespondentName: (name: string) => void
}

export const useQuizSessionStore = create<QuizSessionState>((set) => ({
  phase: 'idle',
  sessionId: null,
  quizId: null,
  quizTitle: null,
  quizDescription: null,
  respondentName: '',
  currentQuestion: null,
  errorMessage: null,
  reset: () =>
    set({
      phase: 'idle',
      sessionId: null,
      quizId: null,
      quizTitle: null,
      quizDescription: null,
      respondentName: '',
      currentQuestion: null,
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
      currentQuestion: payload.question,
      phase: 'playing',
      errorMessage: null,
    }),
  setQuestion: (currentQuestion) => set({ currentQuestion }),
  setRespondentName: (respondentName) => set({ respondentName }),
}))
