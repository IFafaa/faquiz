import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuizPlayFlow } from '@/hooks/useQuizSession'
import { QuestionPresenter } from '@/components/quiz/QuestionPresenter'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

export function QuizPlayPage() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  return <QuizPlayPageInner key={quizId} quizId={quizId} />
}

function QuizPlayPageInner({ quizId }: { quizId: string }) {
  const {
    currentQuestion,
    errorMessage,
    isSubmitting,
    submitAnswer,
  } = useQuizPlayFlow()
  const quizTitle = useQuizSessionStore((s) => s.quizTitle)
  const [step, setStep] = useState(1)
  const prevQuestionId = useRef<string | null>(null)

  useEffect(() => {
    if (!currentQuestion) return
    if (prevQuestionId.current === null) {
      prevQuestionId.current = currentQuestion.id
      return
    }
    if (prevQuestionId.current !== currentQuestion.id) {
      prevQuestionId.current = currentQuestion.id
      // Barra de progresso: incrementa quando a API retorna a próxima pergunta.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- contador visual ligado à pergunta atual
      setStep((s) => s + 1)
    }
  }, [currentQuestion])

  if (!currentQuestion) {
    return (
      <div className="text-center py-16 text-zinc-500 text-sm">
        <p>Carregando pergunta…</p>
        <Link to={`/quiz/${quizId}`} className="mt-4 inline-block text-brand-300">
          Voltar ao início do quiz
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Sair
        </Link>
        {quizTitle ? (
          <p className="truncate text-sm font-medium text-zinc-400">
            {quizTitle}
          </p>
        ) : null}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="h-full bg-brand-500"
          initial={false}
          animate={{ width: `${Math.min(100, step * 12)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {errorMessage ? (
          <motion.p
            key="err"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {errorMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <QuestionPresenter
        question={currentQuestion}
        disabled={isSubmitting}
        onAnswer={submitAnswer}
      />
    </div>
  )
}
