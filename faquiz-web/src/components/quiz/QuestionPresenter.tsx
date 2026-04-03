import { AnimatePresence, motion } from 'framer-motion'
import type { PublicQuestion } from '@/types/api'
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion'
import { RatingQuestion } from './RatingQuestion'
import { TextQuestion } from './TextQuestion'

interface Props {
  question: PublicQuestion
  disabled?: boolean
  onAnswer: (payload: {
    answerOptionId?: string | null
    answerValue?: string
  }) => void
}

export function QuestionPresenter({
  question,
  disabled,
  onAnswer,
}: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={question.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <header className="space-y-2">
          <h2 className="font-display text-xl font-semibold text-zinc-50 md:text-2xl">
            {question.title}
          </h2>
          {question.description ? (
            <p className="text-sm text-zinc-400 leading-relaxed">
              {question.description}
            </p>
          ) : null}
        </header>

        {question.questionType === 'multiple_choice' ? (
          <MultipleChoiceQuestion
            question={question}
            disabled={disabled}
            onSelect={(opt) =>
              onAnswer({
                answerOptionId: opt.id,
                answerValue: opt.value,
              })
            }
          />
        ) : null}

        {question.questionType === 'text' ? (
          <TextQuestion
            question={question}
            disabled={disabled}
            onSubmit={(value, firstOptionId) =>
              onAnswer({
                answerValue: value,
                answerOptionId: firstOptionId ?? null,
              })
            }
          />
        ) : null}

        {question.questionType === 'rating' ? (
          <RatingQuestion
            question={question}
            disabled={disabled}
            onSelect={(n, firstOptionId) =>
              onAnswer({
                answerValue: String(n),
                answerOptionId: firstOptionId ?? null,
              })
            }
          />
        ) : null}
      </motion.article>
    </AnimatePresence>
  )
}
