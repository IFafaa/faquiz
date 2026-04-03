import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { listQuizSessions } from '@/api/quiz'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

function formatDt(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function ResponsesPage() {
  const { id = '' } = useParams<{ id: string }>()

  const { data: sessions, isLoading: loading } = useQuery({
    queryKey: ['quiz-sessions', id],
    queryFn: () => listQuizSessions(id),
    enabled: !!id,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Sessões de resposta
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {loading
            ? 'Carregando…'
            : 'Lista de respondentes e status. Abra uma sessão para ver o detalhe.'}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Respondente
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Início
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Conclusão
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-400 text-right">
                      Detalhe
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {(!sessions || sessions.length === 0) ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-zinc-500"
                      >
                        Nenhuma sessão registrada ainda.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="bg-zinc-950/40">
                        <td className="px-4 py-3 text-zinc-200">
                          {s.respondentName || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            tone={
                              s.status === 'completed' ? 'success' : 'warning'
                            }
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {formatDt(s.startedAt)}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {s.completedAt ? formatDt(s.completedAt) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/admin/sessions/${s.id}`}
                            className="text-brand-300 hover:underline"
                          >
                            Ver sessão
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
