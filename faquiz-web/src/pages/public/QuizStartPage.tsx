import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuizStartFlow } from '@/hooks/useQuizSession'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

export function QuizStartPage() {
  const { publicQuiz, isLoadingQuiz, isStarting, startQuiz } = useQuizStartFlow()
  const phase = useQuizSessionStore((s) => s.phase)
  const errorMessage = useQuizSessionStore((s) => s.errorMessage)
  const [name, setName] = useState('')

  const loading = isLoadingQuiz || phase === 'loading'
  const ready = phase === 'ready' && publicQuiz

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Início
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Spinner />
          <p className="text-sm text-zinc-500">Carregando quiz…</p>
        </div>
      ) : null}

      {errorMessage ? (
        <Card className="border-red-900/50">
          <CardContent className="py-6 text-center text-sm text-red-300">
            {errorMessage}
          </CardContent>
        </Card>
      ) : null}

      {ready && publicQuiz ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardContent className="space-y-6 py-8">
              <div className="space-y-2 text-center">
                <h1 className="font-display text-2xl font-bold text-zinc-50">
                  {publicQuiz.quiz.title}
                </h1>
                {publicQuiz.quiz.description ? (
                  <p className="text-sm text-zinc-400">
                    {publicQuiz.quiz.description}
                  </p>
                ) : null}
              </div>
              <Input
                label="Seu nome (opcional)"
                placeholder="Como podemos te chamar?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                className="w-full"
                size="lg"
                disabled={isStarting}
                onClick={() => startQuiz(name.trim())}
              >
                {isStarting ? 'Iniciando…' : 'Começar'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </div>
  )
}
