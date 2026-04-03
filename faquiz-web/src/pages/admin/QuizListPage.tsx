import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function QuizListPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-zinc-50">Quizzes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          A listagem e o CRUD serão implementados na fase de admin completa.
        </CardContent>
      </Card>
    </div>
  )
}
