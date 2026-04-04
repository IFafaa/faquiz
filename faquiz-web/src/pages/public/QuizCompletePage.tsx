import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

export function QuizCompletePage() {
  const { id } = useParams<{ id: string }>()
  const quizTitle = useQuizSessionStore((s) => s.quizTitle)
  const respondentName = useQuizSessionStore((s) => s.respondentName)
  const respondentEmail = useQuizSessionStore((s) => s.respondentEmail)
  const respondentPhone = useQuizSessionStore((s) => s.respondentPhone)
  const reset = useQuizSessionStore((s) => s.reset)

  const hasId =
    !!respondentName?.trim() ||
    !!respondentEmail?.trim() ||
    !!respondentPhone?.trim()

  return (
    <div className="mx-auto max-w-lg space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <Card className="overflow-hidden border-brand-500/20">
          <div className="bg-gradient-to-br from-brand-600/30 to-zinc-900 px-6 py-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl"
              aria-hidden
            >
              ✓
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-zinc-50">
              Obrigado!
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Você concluiu{' '}
              <span className="text-brand-100 font-medium">
                {quizTitle ?? 'o quiz'}
              </span>
              .
            </p>
            {hasId ? (
              <ul className="mt-3 space-y-1 text-left text-sm text-zinc-400">
                {respondentName?.trim() ? (
                  <li>
                    <span className="text-zinc-500">Nome:</span>{' '}
                    <span className="text-zinc-200">{respondentName.trim()}</span>
                  </li>
                ) : null}
                {respondentEmail?.trim() ? (
                  <li>
                    <span className="text-zinc-500">E-mail:</span>{' '}
                    <span className="text-zinc-200">
                      {respondentEmail.trim()}
                    </span>
                  </li>
                ) : null}
                {respondentPhone?.trim() ? (
                  <li>
                    <span className="text-zinc-500">Telefone:</span>{' '}
                    <span className="text-zinc-200">
                      {respondentPhone.trim()}
                    </span>
                  </li>
                ) : null}
              </ul>
            ) : null}
            <p className="mt-3 text-xs text-zinc-500">
              ID do quiz: <code className="text-zinc-400">{id}</code>
            </p>
          </div>
          <CardContent className="py-6">
            <Link to="/" onClick={() => reset()}>
              <Button variant="secondary" className="w-full">
                Voltar ao início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
