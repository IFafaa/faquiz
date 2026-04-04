import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getPublishedQuizzes } from '@/api/quiz'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

export function HomePage() {
  const { data: quizzes, isPending, isError } = useQuery({
    queryKey: ['published-quizzes'],
    queryFn: getPublishedQuizzes,
  })

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
          Cada resposta define o próximo passo. Escolha um quiz abaixo para
          começar.
        </p>
      </motion.div>

      {isPending ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Não foi possível carregar os quizzes. Tente novamente mais tarde.
        </p>
      ) : null}

      {!isPending && !isError && quizzes && quizzes.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Nenhum quiz publicado no momento.
        </p>
      ) : null}

      {!isPending && quizzes && quizzes.length > 0 ? (
        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {quizzes.map((q, i) => (
            <motion.li
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              <Link to={`/quiz/${q.id}`} className="block h-full">
                <Card className="h-full transition-colors hover:border-zinc-600">
                  <CardContent className="flex h-full flex-col gap-2 py-6">
                    <h2 className="font-display text-lg font-semibold text-zinc-50">
                      {q.title}
                    </h2>
                    {q.description ? (
                      <p className="text-sm text-zinc-400 line-clamp-3">
                        {q.description}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-500">Abrir quiz</p>
                    )}
                    <span className="mt-auto pt-2 text-sm font-medium text-brand-400">
                      Começar →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      ) : null}
    </div>
  )
}
