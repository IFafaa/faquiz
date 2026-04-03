import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPublicQuiz } from '@/api/quiz'
import { startSession, submitAnswer } from '@/api/session'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

/**
 * Página inicial do quiz: carrega quiz público e inicia sessão.
 */
export function useQuizStartFlow() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setPhase = useQuizSessionStore((s) => s.setPhase)
  const setError = useQuizSessionStore((s) => s.setError)
  const setSessionBootstrap = useQuizSessionStore((s) => s.setSessionBootstrap)

  const loadQuiz = useMutation({
    mutationFn: () => getPublicQuiz(quizId),
    onMutate: () => {
      setPhase('loading')
      setError(null)
    },
    onSuccess: (data) => {
      if (!data.rootQuestion) {
        setPhase('error')
        setError('Este quiz ainda não tem perguntas configuradas.')
        return
      }
      setPhase('ready')
    },
    onError: () => {
      setPhase('error')
      setError(
        'Não foi possível carregar este quiz. Verifique se está publicado.',
      )
    },
  })

  const start = useMutation({
    mutationFn: ({ respondentName }: { respondentName: string }) =>
      startSession(quizId, respondentName),
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
        respondentName: variables.respondentName,
        question: data.question,
      })
      void navigate(`/quiz/${quizId}/play`, { replace: true })
    },
    onError: () => {
      setPhase('error')
      setError('Não foi possível iniciar o quiz.')
    },
  })

  useEffect(() => {
    if (!quizId) return
    void loadQuiz.mutateAsync()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apenas ao montar / trocar quiz
  }, [quizId])

  return {
    quizId,
    publicQuiz: loadQuiz.data,
    isLoadingQuiz: loadQuiz.isPending,
    isStarting: start.isPending,
    startQuiz: (respondentName: string) =>
      start.mutate({ respondentName }),
  }
}

/**
 * Página de jogo: envia respostas até concluir (máquina: playing ↔ submitting).
 */
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
  const setQuestion = useQuizSessionStore((s) => s.setQuestion)

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
        setQuestion(null)
        void navigate(`/quiz/${quizId}/complete`, { replace: true })
        return
      }
      setQuestion(data.question)
      setPhase('playing')
    },
    onError: () => {
      setPhase('error')
      setError('Não foi possível enviar a resposta.')
    },
  })

  const submit = useCallback(
    (input: { answerOptionId?: string | null; answerValue?: string }) => {
      answer.mutate(input)
    },
    [answer],
  )

  return {
    quizId,
    sessionId,
    currentQuestion,
    phase,
    errorMessage,
    isSubmitting: answer.isPending,
    submitAnswer: submit,
  }
}
