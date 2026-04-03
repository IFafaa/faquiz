import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function HomePage() {
  return (
    <div className="space-y-10">
      <div className="max-w-2xl space-y-4">
        <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
          Quizzes em árvore de decisão
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Cada resposta define o próximo passo. Experiência fluida para quem
          responde e um builder visual para quem cria.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-400 text-sm">
            Para testar um quiz público, use o ID na URL{' '}
            <code className="text-brand-100">/quiz/:id</code>.
          </p>
          <Link to="/admin/login" className="shrink-0 inline-flex">
            <Button variant="secondary">Área administrativa</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
