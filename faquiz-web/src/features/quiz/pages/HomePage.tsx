import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { Spinner } from '@/shared/ui/Spinner'
import { richTextToPlainText } from '@/shared/utils/richText'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function HomePage() {
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['published-quizzes'],
    queryFn: () => faquizApi.getPublishedQuizzes(),
  })

  return (
    <div className="relative min-h-[calc(100vh-9rem)]">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-600/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-32 h-64 w-64 rounded-full bg-fuchsia-600/15 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-40 h-px w-[120%] -translate-x-1/2 rotate-[-8deg] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
        aria-hidden
      />

      <div className="relative space-y-14">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-5"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-brand-300">
            Questionários abertos
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
            <span className="bg-gradient-to-r from-zinc-100 via-white to-brand-200/90 bg-clip-text text-transparent">
              FAQuiz
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-zinc-400">
            Cada resposta define o próximo passo: fluxos em árvore para pesquisas e
            formulários. Escolha um dos questionários abaixo para participar.
          </p>
        </motion.header>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center py-16">
            <Spinner />
          </div>
        ) : !quizzes || quizzes.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 px-6 py-14 text-center text-zinc-500"
          >
            Ainda não há questionários publicados. Volte em breve.
          </motion.p>
        ) : (
          <section aria-labelledby="catalog-heading" className="space-y-6">
            <h2 id="catalog-heading" className="sr-only">
              Lista de questionários
            </h2>
            <motion.ul
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {quizzes.map((q, i) => (
                <motion.li key={q.id} variants={item} className="min-w-0">
                  <Link
                    to={`/quiz/${q.id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-zinc-950 p-0 shadow-lg shadow-black/30 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-brand-900/20"
                  >
                    <span
                      className="pointer-events-none absolute -right-6 -top-4 font-display text-7xl font-bold tabular-nums text-zinc-800/80 transition-colors group-hover:text-brand-900/50"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative flex flex-1 flex-col p-6 pt-7">
                      <span className="mb-3 inline-flex w-fit rounded-md bg-brand-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                        Participar
                      </span>
                      <h3 className="font-display text-xl font-semibold leading-snug text-zinc-100">
                        {q.title}
                      </h3>
                      {q.description ? (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-500">
                          {richTextToPlainText(q.description)}
                        </p>
                      ) : (
                        <p className="mt-2 flex-1 text-sm italic text-zinc-600">
                          Sem descrição
                        </p>
                      )}
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-400 transition-colors group-hover:text-brand-300">
                        Iniciar questionário
                        <svg
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </div>
                    <div
                      className="h-1 w-full bg-gradient-to-r from-brand-600 via-fuchsia-500/80 to-transparent opacity-60 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </section>
        )}

        <footer className="border-t border-zinc-800/80 pt-10 text-center text-sm text-zinc-500">
          © 2026 Fabricio Lima Carvalho. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
