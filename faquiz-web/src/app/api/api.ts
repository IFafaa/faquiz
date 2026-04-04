import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from '@/app/store/authStore'
import type {
  AggregatesResponse,
  AnalyticsResponse,
  LoginResponse,
  PublishedQuizCard,
  PublicQuizPayload,
  QuestionType,
  QuizSessionRow,
  QuizSummary,
  QuizTreeSnapshot,
  ResponseFilters,
  SessionDetailResponse,
  ShareResponse,
  StartSessionResponse,
  SubmitAnswerResponse,
  UndoLastAnswerResponse,
} from '@/shared/types/api'

export type SaveQuizTreeBody = {
  rootNodeId: string | null
  nodes: Array<{
    id: string
    title: string
    description: string
    questionType: QuestionType
    positionX: number
    positionY: number
    answerOptions: Array<{
      id: string
      label: string
      value: string
      order: number
      nextQuestionNodeId: string | null
    }>
  }>
}

export interface IFaquizApi {
  login(email: string, password: string): Promise<LoginResponse>
  listQuizzes(): Promise<QuizSummary[]>
  getQuiz(id: string): Promise<QuizSummary>
  createQuiz(body: {
    title: string
    description?: string
    collectName?: boolean
    collectEmail?: boolean
    collectPhone?: boolean
  }): Promise<QuizSummary>
  updateQuiz(
    id: string,
    body: { title?: string; description?: string; isPublished?: boolean },
  ): Promise<QuizSummary>
  deleteQuiz(id: string): Promise<void>
  getQuizTree(id: string): Promise<QuizTreeSnapshot>
  saveQuizTree(id: string, body: SaveQuizTreeBody): Promise<void>
  getPublicQuiz(id: string): Promise<PublicQuizPayload>
  getPublishedQuizzes(): Promise<PublishedQuizCard[]>
  getShare(id: string): Promise<ShareResponse>
  getQuizAnalytics(id: string): Promise<AnalyticsResponse>
  listQuizSessions(quizId: string): Promise<QuizSessionRow[]>
  postQuizAggregates(
    quizId: string,
    body: { filters?: ResponseFilters },
  ): Promise<AggregatesResponse>
  exportQuizResponses(
    quizId: string,
    body: { filters?: ResponseFilters },
  ): Promise<Blob>
  startSession(
    quizId: string,
    body: {
      respondentName?: string
      respondentEmail?: string
      respondentPhone?: string
    },
  ): Promise<StartSessionResponse>
  submitAnswer(
    sessionId: string,
    body: { answerOptionId?: string | null; answerValue?: string },
  ): Promise<SubmitAnswerResponse>
  undoLastAnswer(sessionId: string): Promise<UndoLastAnswerResponse>
  getSessionDetail(sessionId: string): Promise<SessionDetailResponse>
}

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api'

const trustedOrigin = new URL(baseURL).origin

function isTrustedUrl(url: string | undefined): boolean {
  if (!url) return true
  if (url.startsWith('/')) return true
  try {
    return new URL(url, baseURL).origin === trustedOrigin
  } catch {
    return false
  }
}

export class FaquizApi implements IFaquizApi {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use((config) => {
      const token = useAuthStore.getState().token
      if (token && isTrustedUrl(config.url)) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          const url = err.config?.url ?? ''
          if (!url.includes('/auth/login')) {
            useAuthStore.getState().clearAuth()
          }
        }
        return Promise.reject(err)
      },
    )
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return data
  }

  async listQuizzes() {
    const { data } = await this.client.get<QuizSummary[]>('/quizzes')
    return data
  }

  async getQuiz(id: string) {
    const { data } = await this.client.get<QuizSummary>(`/quizzes/${id}`)
    return data
  }

  async createQuiz(body: {
    title: string
    description?: string
    collectName?: boolean
    collectEmail?: boolean
    collectPhone?: boolean
  }) {
    const { data } = await this.client.post<QuizSummary>('/quizzes', body)
    return data
  }

  async updateQuiz(
    id: string,
    body: { title?: string; description?: string; isPublished?: boolean },
  ) {
    const { data } = await this.client.put<QuizSummary>(
      `/quizzes/${id}`,
      body,
    )
    return data
  }

  async deleteQuiz(id: string) {
    await this.client.delete(`/quizzes/${id}`)
  }

  async getQuizTree(id: string) {
    const { data } = await this.client.get<QuizTreeSnapshot>(
      `/quizzes/${id}/tree`,
    )
    return data
  }

  async saveQuizTree(id: string, body: SaveQuizTreeBody) {
    await this.client.put(`/quizzes/${id}/tree`, body)
  }

  async getPublicQuiz(id: string) {
    const { data } = await this.client.get<PublicQuizPayload>(
      `/quizzes/${id}/public`,
    )
    return data
  }

  async getPublishedQuizzes() {
    const { data } = await this.client.get<PublishedQuizCard[]>(
      '/quizzes/published',
    )
    return data
  }

  async getShare(id: string) {
    const { data } = await this.client.get<ShareResponse>(
      `/quizzes/${id}/share`,
    )
    return data
  }

  async getQuizAnalytics(id: string) {
    const { data } = await this.client.get<AnalyticsResponse>(
      `/quizzes/${id}/analytics`,
    )
    return data
  }

  async listQuizSessions(quizId: string) {
    const { data } = await this.client.get<QuizSessionRow[]>(
      `/quizzes/${quizId}/sessions`,
    )
    return data
  }

  async postQuizAggregates(
    quizId: string,
    body: { filters?: ResponseFilters },
  ) {
    const { data } = await this.client.post<AggregatesResponse>(
      `/quizzes/${quizId}/analytics/aggregates`,
      body,
    )
    return data
  }

  async exportQuizResponses(
    quizId: string,
    body: { filters?: ResponseFilters },
  ) {
    const { data } = await this.client.post<Blob>(
      `/quizzes/${quizId}/export/responses`,
      body,
      { responseType: 'blob' },
    )
    return data
  }

  async startSession(
    quizId: string,
    body: {
      respondentName?: string
      respondentEmail?: string
      respondentPhone?: string
    },
  ) {
    const { data } = await this.client.post<StartSessionResponse>(
      `/quizzes/${quizId}/sessions`,
      {
        respondentName: body.respondentName,
        respondentEmail: body.respondentEmail,
        respondentPhone: body.respondentPhone,
      },
    )
    return data
  }

  async submitAnswer(
    sessionId: string,
    body: { answerOptionId?: string | null; answerValue?: string },
  ) {
    const { data } = await this.client.post<SubmitAnswerResponse>(
      `/sessions/${sessionId}/answers`,
      body,
    )
    return data
  }

  async undoLastAnswer(sessionId: string) {
    const { data } = await this.client.post<UndoLastAnswerResponse>(
      `/sessions/${sessionId}/back`,
    )
    return data
  }

  async getSessionDetail(sessionId: string) {
    const { data } = await this.client.get<SessionDetailResponse>(
      `/sessions/${sessionId}`,
    )
    return data
  }
}

export const faquizApi = new FaquizApi()
