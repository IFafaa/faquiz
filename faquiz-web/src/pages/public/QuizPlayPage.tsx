import { AnimatePresence, motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { useQuizPlayFlow } from '@/hooks/useQuizSession'
import { QuestionPresenter } from '@/components/quiz/QuestionPresenter'
import { Button } from '@/components/ui/Button'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

export function QuizPlayPage() {
  const { id: quizId = '' } = useParams<{ id: string }>()
  return <QuizPlayPageInner key={quizId} />
}

function QuizPlayPageInner() {
  const {
    currentQuestion,
    errorMessage,
    isSubmitting,
    submitAnswer,
    totalQuestions,
    currentQuestionNumber,
    canGoBack,
    goToPreviousQuestion,
  } = useQuizPlayFlow()
  const quizTitle = useQuizSessionStore((s) => s.quizTitle)

  const progressPercent =
    totalQuestions != null &&
    totalQuestions > 0 &&
    currentQuestionNumber != null
      ? Math.min(100, (currentQuestionNumber / totalQuestions) * 100)
      : 0

  if (!currentQuestion) {
    return (
      <div className="text-center py-16 text-zinc-500 text-sm">
        <p>Carregando pergunta…</p>
        <Link to="/" className="mt-4 inline-block text-brand-300">
          Ir para a página inicial
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
          <p className="min-w-0 flex-1 truncate text-center text-sm font-medium text-zinc-400">
            {quizTitle}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        {canGoBack ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={() => goToPreviousQuestion()}
          >
            Questão anterior
          </Button>
        ) : (
          <span className="w-[140px] shrink-0" aria-hidden />
        )}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="h-full bg-brand-500"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
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
