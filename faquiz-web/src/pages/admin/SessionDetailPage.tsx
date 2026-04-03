import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-zinc-50">
        Sessão {id}
      </h1>
      <Card>
        <CardContent className="text-sm text-zinc-400 py-8">
          Detalhe da sessão e caminho na árvore na fase admin.
        </CardContent>
      </Card>
    </div>
  )
}
