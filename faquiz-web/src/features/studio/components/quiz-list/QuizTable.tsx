import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import type { QuizSummary } from '@/shared/types/api'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'

interface Props {
  quizzes: QuizSummary[]
  onDelete: (quiz: QuizSummary) => void
  deletePending: boolean
}

export function QuizTable({ quizzes, onDelete, deletePending }: Props) {
  const navigate = useNavigate()

  if (quizzes.length === 0) {
    return (
      <EmptyState>
        Nenhum quiz criado ainda. Clique em <strong>Novo quiz</strong> para
        começar.
      </EmptyState>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/80">
          <tr>
            <th className="px-4 py-3 font-medium text-zinc-400">Título</th>
            <th className="hidden px-4 py-3 font-medium text-zinc-400 sm:table-cell">
              Status
            </th>
            <th className="hidden px-4 py-3 font-medium text-zinc-400 md:table-cell">
              Criado em
            </th>
            <th className="px-4 py-3 text-right font-medium text-zinc-400">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {quizzes.map((q) => (
            <tr
              key={q.id}
              className="cursor-pointer bg-zinc-950/40 transition-colors hover:bg-zinc-900/60"
              onClick={() => void navigate(paths.painelQuiz(q.id))}
            >
              <td className="px-4 py-3 font-medium text-zinc-200">
                {q.title}
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                {q.isPublished ? (
                  <Badge tone="success">Publicado</Badge>
                ) : (
                  <Badge tone="muted">Rascunho</Badge>
                )}
              </td>
              <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">
                {new Date(q.createdAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deletePending}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(q)
                  }}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
