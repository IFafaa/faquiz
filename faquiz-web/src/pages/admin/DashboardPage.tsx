import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Visão geral e métricas (em breve com gráficos).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400 space-y-2">
          <p>
            Gerencie quizzes em{' '}
            <Link
              to="/admin/quizzes"
              className="text-brand-100 underline underline-offset-2"
            >
              Quizzes
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
