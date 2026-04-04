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
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← Sair
          </Link>
          {canGoBack ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={isSubmitting}
              onClick={() => goToPreviousQuestion()}
            >
              Questão anterior
            </Button>
          ) : (
            <span className="shrink-0 sm:w-[140px]" aria-hidden />
          )}
        </div>
        {quizTitle ? (
          <h2 className="text-balance px-1 text-center text-sm font-medium leading-snug text-zinc-300 sm:text-base">
            {quizTitle}
          </h2>
        ) : null}
      </header>

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
