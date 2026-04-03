import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function QuizStartPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-zinc-50">
        Início do quiz
      </h1>
      <Card>
        <CardContent className="space-y-4 py-6">
          <p className="text-sm text-zinc-400">
            ID do quiz: <code className="text-brand-100">{id}</code>
          </p>
          <p className="text-sm text-zinc-500">
            Na fase pública, aqui carregaremos o quiz e o botão para começar a
            sessão.
          </p>
          <Link to={`/quiz/${id}/play`} className="inline-flex">
            <Button>Ir para jogar (placeholder)</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
