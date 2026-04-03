import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function QuizCompletePage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-zinc-50">
        Concluído
      </h1>
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-zinc-400 text-sm">
            Quiz <code className="text-brand-100">{id}</code> — tela final na
            fase pública.
          </p>
          <Link to="/" className="inline-flex justify-center">
            <Button variant="secondary">Voltar ao início</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
