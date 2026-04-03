import type {
  AnalyticsResponse,
  PublicQuizPayload,
  QuizSessionRow,
  QuizSummary,
  QuizTreeSnapshot,
  ShareResponse,
} from '@/types/api'
import { api } from './client'

export async function listQuizzes() {
  const { data } = await api.get<QuizSummary[]>('/quizzes')
  return data
}

export async function getQuiz(id: string) {
  const { data } = await api.get<QuizSummary>(`/quizzes/${id}`)
  return data
}

export async function createQuiz(body: { title: string; description?: string }) {
  const { data } = await api.post<QuizSummary>('/quizzes', body)
  return data
}

export async function updateQuiz(
  id: string,
  body: { title?: string; description?: string; isPublished?: boolean },
) {
  const { data } = await api.put<QuizSummary>(`/quizzes/${id}`, body)
  return data
}

export async function deleteQuiz(id: string) {
  await api.delete(`/quizzes/${id}`)
}

export async function getQuizTree(id: string) {
  const { data } = await api.get<QuizTreeSnapshot>(`/quizzes/${id}/tree`)
  return data
}

export async function saveQuizTree(
  id: string,
  body: {
    rootNodeId: string | null
    nodes: QuizTreeSnapshot['nodes']
  },
) {
  await api.put(`/quizzes/${id}/tree`, body)
}

export async function getPublicQuiz(id: string) {
  const { data } = await api.get<PublicQuizPayload>(
    `/quizzes/${id}/public`,
  )
  return data
}

export async function getShare(id: string) {
  const { data } = await api.get<ShareResponse>(`/quizzes/${id}/share`)
  return data
}

export async function getQuizAnalytics(id: string) {
  const { data } = await api.get<AnalyticsResponse>(
    `/quizzes/${id}/analytics`,
  )
  return data
}

export async function listQuizSessions(quizId: string) {
  const { data } = await api.get<QuizSessionRow[]>(
    `/quizzes/${quizId}/sessions`,
  )
  return data
}
