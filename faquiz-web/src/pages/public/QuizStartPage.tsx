import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useQuizStartFlow } from '@/hooks/useQuizSession'
import { RichTextHtml } from '@/components/rich-text/RichTextHtml'
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
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const loading = isLoadingQuiz || phase === 'loading'
  const ready = phase === 'ready' && publicQuiz

  const cfg = publicQuiz?.quiz
  const asksAnything = useMemo(
    () =>
      !!cfg &&
      (cfg.collectName || cfg.collectEmail || cfg.collectPhone),
    [cfg],
  )

  const canSubmit = useMemo(() => {
    if (!cfg) return false
    if (cfg.collectName && name.trim().length === 0) return false
    if (cfg.collectEmail && email.trim().length === 0) return false
    if (cfg.collectPhone && phone.trim().length === 0) return false
    return true
  }, [cfg, name, email, phone])

  const handleStart = () => {
    if (!cfg) return
    startQuiz({
      respondentName: cfg.collectName ? name.trim() : undefined,
      respondentEmail: cfg.collectEmail ? email.trim() : undefined,
      respondentPhone: cfg.collectPhone ? phone.trim() : undefined,
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
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
                  <RichTextHtml
                    html={publicQuiz.quiz.description}
                    className="text-center text-sm text-zinc-400"
                  />
                ) : null}
              </div>

              {asksAnything ?? (
                <p className="text-center text-xs text-zinc-500">
                  Preencha os dados abaixo antes de iniciar.
                </p>
              )}

              {publicQuiz.quiz.collectName ? (
                <Input
                  label="Nome"
                  placeholder="Como podemos te chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              ) : null}

              {publicQuiz.quiz.collectEmail ? (
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              ) : null}

              {publicQuiz.quiz.collectPhone ? (
                <Input
                  label="Telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              ) : null}

              <Button
                className="w-full"
                size="lg"
                disabled={isStarting || !canSubmit}
                onClick={() => void handleStart()}
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
