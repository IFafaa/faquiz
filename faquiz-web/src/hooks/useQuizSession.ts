import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPublicQuiz } from '@/api/quiz'
import { startSession, submitAnswer, undoLastAnswer } from '@/api/session'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

export function useQuizStartFlow() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setPhase = useQuizSessionStore((s) => s.setPhase)
  const setError = useQuizSessionStore((s) => s.setError)
  const setSessionBootstrap = useQuizSessionStore((s) => s.setSessionBootstrap)

  const {
    data: publicQuiz,
    isPending: isLoadingQuiz,
    isError: isPublicQuizError,
  } = useQuery({
    queryKey: ['public-quiz', quizId],
    queryFn: () => getPublicQuiz(quizId),
    enabled: !!quizId,
  })

  useEffect(() => {
    if (!quizId) return
    if (isLoadingQuiz) {
      setPhase('loading')
      setError(null)
      return
    }
    if (isPublicQuizError) {
      setPhase('error')
      setError(
        'Não foi possível carregar este quiz. Verifique se está publicado.',
      )
      return
    }
    if (!publicQuiz) return
    if (!publicQuiz.rootQuestion) {
      setPhase('error')
      setError('Este quiz ainda não tem perguntas configuradas.')
      return
    }
    setPhase('ready')
  }, [
    quizId,
    isLoadingQuiz,
    isPublicQuizError,
    publicQuiz,
    setPhase,
    setError,
  ])

  const start = useMutation({
    mutationFn: (vars: {
      respondentName?: string
      respondentEmail?: string
      respondentPhone?: string
    }) => startSession(quizId, vars),
    onMutate: () => {
      setPhase('loading')
      setError(null)
    },
    onSuccess: (data, variables) => {
      setSessionBootstrap({
        sessionId: data.sessionId,
        quizId: data.quiz.id,
        quizTitle: data.quiz.title,
        quizDescription: data.quiz.description,
        respondentName: variables.respondentName ?? '',
        respondentEmail: variables.respondentEmail ?? '',
        respondentPhone: variables.respondentPhone ?? '',
        question: data.question,
        totalQuestions: data.totalQuestions,
        answeredCount: data.answeredCount,
        currentQuestionNumber: data.currentQuestionNumber,
      })
      void navigate(`/quiz/${quizId}/play`, { replace: true })
    },
    onError: (err: unknown) => {
      setPhase('error')
      const msg =
        axios.isAxiosError(err) &&
        err.response?.data &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data
          ? String(
              (err.response.data as { message?: string }).message ??
                'Não foi possível iniciar o quiz.',
            )
          : 'Não foi possível iniciar o quiz.'
      setError(msg)
    },
  })

  return {
    quizId,
    publicQuiz,
    isLoadingQuiz,
    isStarting: start.isPending,
    startQuiz: (vars: {
      respondentName?: string
      respondentEmail?: string
      respondentPhone?: string
    }) => start.mutate(vars),
  }
}

export function useQuizPlayFlow() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessionId = useQuizSessionStore((s) => s.sessionId)
  const storeQuizId = useQuizSessionStore((s) => s.quizId)
  const currentQuestion = useQuizSessionStore((s) => s.currentQuestion)
  const phase = useQuizSessionStore((s) => s.phase)
  const errorMessage = useQuizSessionStore((s) => s.errorMessage)
  const setPhase = useQuizSessionStore((s) => s.setPhase)
  const setError = useQuizSessionStore((s) => s.setError)
  const setPlayState = useQuizSessionStore((s) => s.setPlayState)
  const totalQuestions = useQuizSessionStore((s) => s.totalQuestions)
  const answeredCount = useQuizSessionStore((s) => s.answeredCount)
  const currentQuestionNumber = useQuizSessionStore(
    (s) => s.currentQuestionNumber,
  )

  useEffect(() => {
    if (!quizId) return
    if (!sessionId || storeQuizId !== quizId) {
      void navigate(`/quiz/${quizId}`, { replace: true })
    }
  }, [quizId, sessionId, storeQuizId, navigate])

  const answer = useMutation({
    mutationFn: (input: {
      answerOptionId?: string | null
      answerValue?: string
    }) => {
      const sid = useQuizSessionStore.getState().sessionId
      if (!sid) throw new Error('Sessão inválida')
      return submitAnswer(sid, input)
    },
    onMutate: () => {
      setPhase('submitting')
      setError(null)
    },
    onSuccess: (data) => {
      if (data.completed) {
        setPhase('completed')
        setPlayState({
          question: null,
          totalQuestions: data.totalQuestions,
          answeredCount: data.answeredCount,
          currentQuestionNumber: data.currentQuestionNumber,
        })
        void navigate(`/quiz/${quizId}/complete`, { replace: true })
        return
      }
      setPlayState({
        question: data.question,
        totalQuestions: data.totalQuestions,
        answeredCount: data.answeredCount,
        currentQuestionNumber: data.currentQuestionNumber,
      })
      setPhase('playing')
    },
    onError: () => {
      setPhase('error')
      setError('Não foi possível enviar a resposta.')
    },
  })

  const undo = useMutation({
    mutationFn: () => {
      const sid = useQuizSessionStore.getState().sessionId
      if (!sid) throw new Error('Sessão inválida')
      return undoLastAnswer(sid)
    },
    onMutate: () => {
      setPhase('submitting')
      setError(null)
    },
    onSuccess: (data) => {
      setPlayState({
        question: data.question,
        totalQuestions: data.totalQuestions,
        answeredCount: data.answeredCount,
        currentQuestionNumber: data.currentQuestionNumber,
      })
      setPhase('playing')
    },
    onError: () => {
      setPhase('error')
      setError('Não foi possível voltar à pergunta anterior.')
    },
  })

  const submit = useCallback(
    (input: { answerOptionId?: string | null; answerValue?: string }) => {
      answer.mutate(input)
    },
    [answer],
  )

  const goToPreviousQuestion = useCallback(() => {
    undo.mutate()
  }, [undo])

  return {
    quizId,
    sessionId,
    currentQuestion,
    phase,
    errorMessage,
    totalQuestions,
    answeredCount,
    currentQuestionNumber,
    canGoBack: (answeredCount ?? 0) > 0,
    isSubmitting: answer.isPending || undo.isPending,
    submitAnswer: submit,
    goToPreviousQuestion,
  }
}
