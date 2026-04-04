import { Link } from 'react-router-dom'
import type { QuizSummary } from '@/shared/types/api'
import { Badge } from '@/shared/ui/Badge'
import { Card, CardContent } from '@/shared/ui/Card'

interface Props {
  quizzes: QuizSummary[]
}

export function DashboardQuizTable({ quizzes }: Props) {
  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-semibold text-zinc-100">
        Seus quizzes
      </h2>
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-zinc-500">
            Nenhum quiz ainda.{' '}
            <Link
              to="/admin/quizzes"
              className="text-brand-300 underline underline-offset-2"
            >
              Crie o primeiro
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-400">Título</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-400 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {quizzes.map((q) => (
                <tr key={q.id} className="bg-zinc-950/40">
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    {q.title}
                  </td>
                  <td className="px-4 py-3">
                    {q.isPublished ? (
                      <Badge tone="success">Publicado</Badge>
                    ) : (
                      <Badge tone="muted">Rascunho</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/quizzes/${q.id}`}
                      className="text-brand-300 hover:underline"
                    >
                      Abrir quiz
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
