import { motion } from 'framer-motion'

export function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col justify-between gap-12">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl space-y-6"
      >
        <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
          FAQuiz
        </h1>
        <p className="text-lg leading-relaxed text-zinc-400">
          Plataforma de quizzes em árvore de decisão: cada resposta define o
          próximo passo do fluxo. Participe dos questionários através dos links
          compartilhados por quem os publica.
        </p>
      </motion.section>

      <footer className="border-t border-zinc-800/80 pt-8 text-center text-sm text-zinc-500">
        © 2026 Fabricio Lima Carvalho. Todos os direitos reservados.
      </footer>
    </div>
  )
}
