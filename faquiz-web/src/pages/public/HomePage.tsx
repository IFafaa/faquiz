import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function HomePage() {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl space-y-6"
      >
        <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
          Quizzes em árvore de decisão
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Cada resposta define o próximo passo. Responda com uma experiência
          fluida; quem cria o quiz usa o builder visual no painel admin.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card>
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left text-sm text-zinc-400">
              <p>
                Para abrir um quiz público, use{' '}
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-brand-100">
                  /quiz/&lt;id&gt;
                </code>{' '}
                com o ID publicado.
              </p>
            </div>
            <Link to="/admin/login" className="inline-flex shrink-0">
              <Button variant="secondary">Área administrativa</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
