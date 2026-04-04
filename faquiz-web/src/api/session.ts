import type {
  SessionDetailResponse,
  StartSessionResponse,
  SubmitAnswerResponse,
  UndoLastAnswerResponse,
} from '@/types/api'
import { api } from './client'

export async function startSession(
  quizId: string,
  body: {
    respondentName?: string
    respondentEmail?: string
    respondentPhone?: string
  },
) {
  const { data } = await api.post<StartSessionResponse>(
    `/quizzes/${quizId}/sessions`,
    { ...body },
  )
  return data
}

export async function submitAnswer(
  sessionId: string,
  body: { answerOptionId?: string | null; answerValue?: string },
) {
  const { data } = await api.post<SubmitAnswerResponse>(
    `/sessions/${sessionId}/answers`,
    body,
  )
  return data
}

export async function undoLastAnswer(sessionId: string) {
  const { data } = await api.post<UndoLastAnswerResponse>(
    `/sessions/${sessionId}/back`,
  )
  return data
}

export async function getSessionDetail(sessionId: string) {
  const { data } = await api.get<SessionDetailResponse>(
    `/sessions/${sessionId}`,
  )
  return data
}
