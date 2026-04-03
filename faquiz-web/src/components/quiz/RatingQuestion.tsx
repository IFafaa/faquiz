import { motion } from 'framer-motion'
import type { PublicQuestion } from '@/types/api'
import { cn } from '@/lib/cn'

interface Props {
  question: PublicQuestion
  disabled?: boolean
  onSelect: (value: number, firstOptionId?: string) => void
}

const MAX = 5

export function RatingQuestion({ question, disabled, onSelect }: Props) {
  const firstOpt = question.answerOptions[0]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap gap-2"
    >
      {Array.from({ length: MAX }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(n, firstOpt?.id)}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 text-lg font-semibold text-zinc-100 transition-colors',
            'hover:border-brand-500 hover:bg-brand-600/20',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500',
            disabled && 'opacity-50 pointer-events-none',
          )}
        >
          {n}
        </button>
      ))}
    </motion.div>
  )
}
