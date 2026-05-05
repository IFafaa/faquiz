import { motion } from 'framer-motion'
import { useState } from 'react'
import type { PublicQuestion } from '@/shared/types/api'
import { Button } from '@/shared/ui/Button'

interface Props {
  question: PublicQuestion
  disabled?: boolean
  onSubmit: (value: string, firstOptionId?: string) => void
}

export function TextQuestion({ question, disabled, onSubmit }: Props) {
  const [value, setValue] = useState('')
  const firstOpt = question.answerOptions[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        rows={4}
        placeholder="Digite sua resposta…"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <Button
        type="button"
        disabled={disabled || !value.trim()}
        className="w-full sm:w-auto"
        onClick={() =>
          onSubmit(value.trim(), firstOpt?.id)
        }
      >
        Enviar
      </Button>
    </motion.div>
  )
}
