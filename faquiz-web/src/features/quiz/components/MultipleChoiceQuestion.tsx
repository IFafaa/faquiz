import { motion } from 'framer-motion'
import type { PublicAnswerOption, PublicQuestion } from '@/shared/types/api'
import { cn } from '@/shared/utils/cn'

interface Props {
  question: PublicQuestion
  disabled?: boolean
  onSelect: (option: PublicAnswerOption) => void
}

export function MultipleChoiceQuestion({
  question,
  disabled,
  onSelect,
}: Props) {
  const sorted = [...question.answerOptions].sort((a, b) => a.order - b.order)
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {sorted.map((opt, i) => (
        <motion.li
          key={opt.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt)}
            className={cn(
              'w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-4 text-left text-sm font-medium text-zinc-100 transition-colors',
              'hover:border-brand-500/60 hover:bg-zinc-800/90',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500',
              disabled && 'opacity-50 pointer-events-none',
            )}
          >
            <span className="text-brand-200/90">{opt.label}</span>
          </button>
        </motion.li>
      ))}
    </ul>
  )
}
