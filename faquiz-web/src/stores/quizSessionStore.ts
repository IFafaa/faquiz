import { create } from 'zustand'
import type { PublicQuestion } from '@/types/api'

interface QuizSessionState {
  sessionId: string | null
  quizId: string | null
  currentQuestion: PublicQuestion | null
  reset: () => void
  setSession: (payload: {
    sessionId: string
    quizId: string
    question: PublicQuestion | null
  }) => void
  setQuestion: (question: PublicQuestion | null) => void
}

export const useQuizSessionStore = create<QuizSessionState>((set) => ({
  sessionId: null,
  quizId: null,
  currentQuestion: null,
  reset: () =>
    set({ sessionId: null, quizId: null, currentQuestion: null }),
  setSession: ({ sessionId, quizId, question }) =>
    set({ sessionId, quizId, currentQuestion: question }),
  setQuestion: (question) => set({ currentQuestion: question }),
}))
