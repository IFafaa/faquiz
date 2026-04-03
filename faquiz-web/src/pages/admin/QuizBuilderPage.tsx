import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'

export function QuizBuilderPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-zinc-50">
        Builder — quiz {id}
      </h1>
      <Card>
        <CardContent className="text-sm text-zinc-400 py-8">
          React Flow e edição visual na fase dedicada ao builder.
        </CardContent>
      </Card>
    </div>
  )
}
