import { AnimatePresence, motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { useQuizPlayFlow } from '@/features/quiz/hooks/useQuizSession'
import { QuestionPresenter } from '@/features/quiz/components/QuestionPresenter'
import { Button } from '@/shared/ui/Button'
import { IconArrowLeft, IconArrowRightOnRectangle } from '@/assets/icons'
import { useQuizSessionStore } from '@/app/store/quizSessionStore'

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
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 flex justify-start">
            {canGoBack ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 gap-2"
                disabled={isSubmitting}
                onClick={() => goToPreviousQuestion()}
              >
                <IconArrowLeft className="h-4 w-4 shrink-0" />
                Questão anterior
              </Button>
            ) : null}
          </div>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <IconArrowRightOnRectangle className="h-4 w-4 shrink-0" />
            Sair
          </Link>
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
