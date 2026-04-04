import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { Badge } from '@/shared/ui/Badge'
import { Card, CardContent } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { formatDateTimePtBr } from '@/shared/utils/date'

export function ResponsesPage() {
  const { id = '' } = useParams<{ id: string }>()

  const { data: quizMeta, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => faquizApi.getQuiz(id),
    enabled: !!id,
  })

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['quiz-sessions', id],
    queryFn: () => faquizApi.listQuizSessions(id),
    enabled: !!id,
  })

  const loading = loadingQuiz || loadingSessions
  const showName = quizMeta?.collectName ?? false
  const showEmail = quizMeta?.collectEmail ?? false
  const showPhone = quizMeta?.collectPhone ?? false
  const idCols =
    (showName ? 1 : 0) + (showEmail ? 1 : 0) + (showPhone ? 1 : 0)

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
                    {idCols === 0 ? (
                      <th className="px-4 py-3 font-medium text-zinc-400">
                        Identificação
                      </th>
                    ) : null}
                    {showName ? (
                      <th className="px-4 py-3 font-medium text-zinc-400">
                        Nome
                      </th>
                    ) : null}
                    {showEmail ? (
                      <th className="px-4 py-3 font-medium text-zinc-400">
                        E-mail
                      </th>
                    ) : null}
                    {showPhone ? (
                      <th className="px-4 py-3 font-medium text-zinc-400">
                        Telefone
                      </th>
                    ) : null}
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
                        colSpan={Math.max(1, idCols) + 4}
                        className="px-4 py-12 text-center text-zinc-500"
                      >
                        Nenhuma sessão registrada ainda.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="bg-zinc-950/40">
                        {idCols === 0 ? (
                          <td className="px-4 py-3 text-zinc-500">
                            Anônimo
                          </td>
                        ) : null}
                        {showName ? (
                          <td className="px-4 py-3 text-zinc-200">
                            {s.respondentName || '—'}
                          </td>
                        ) : null}
                        {showEmail ? (
                          <td className="px-4 py-3 text-zinc-200">
                            {s.respondentEmail || '—'}
                          </td>
                        ) : null}
                        {showPhone ? (
                          <td className="px-4 py-3 text-zinc-200">
                            {s.respondentPhone || '—'}
                          </td>
                        ) : null}
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
                          {formatDateTimePtBr(s.startedAt)}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {s.completedAt ? formatDateTimePtBr(s.completedAt) : '—'}
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
