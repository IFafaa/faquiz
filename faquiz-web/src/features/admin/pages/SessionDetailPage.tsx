import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import { Badge } from '@/shared/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { formatDateTimePtBr } from '@/shared/utils/date'

export function SessionDetailPage() {
  const { id: sessionId = '' } = useParams<{ id: string }>()

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => faquizApi.getSessionDetail(sessionId),
    enabled: !!sessionId,
  })

  const quizId = detail?.session.quizId

  const { data: tree, isLoading: loadingTree } = useQuery({
    queryKey: ['quiz-tree', quizId],
    queryFn: () => faquizApi.getQuizTree(quizId!),
    enabled: !!quizId,
  })

  const questionTitles = useMemo(() => {
    const m = new Map<string, string>()
    if (!tree) return m
    for (const n of tree.nodes) {
      m.set(n.id, n.title)
    }
    return m
  }, [tree])

  const optionLabels = useMemo(() => {
    const m = new Map<string, string>()
    if (!tree) return m
    for (const n of tree.nodes) {
      for (const o of n.answerOptions) {
        m.set(o.id, o.label)
      }
    }
    return m
  }, [tree])

  if (loadingDetail) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold text-zinc-50">
          Sessão não encontrada
        </h1>
        <Link to="/admin/quizzes" className="text-sm text-brand-300 underline">
          Voltar aos quizzes
        </Link>
      </div>
    )
  }

  const { session, answers } = detail

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-50">
            Sessão
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">{session.id}</p>
        </div>
        <Link
          to={`/admin/quizzes/${session.quizId}/responses`}
          className="text-sm text-brand-300 hover:underline"
        >
          ← Lista de sessões do quiz
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          {loadingTree ? (
            <div className="sm:col-span-2 text-xs text-zinc-500">
              Carregando configuração do quiz…
            </div>
          ) : null}
          {!loadingTree && tree?.quiz.collectName ? (
            <div>
              <p className="text-xs text-zinc-500">Nome</p>
              <p className="text-zinc-200">{session.respondentName || '—'}</p>
            </div>
          ) : null}
          {!loadingTree && tree?.quiz.collectEmail ? (
            <div>
              <p className="text-xs text-zinc-500">E-mail</p>
              <p className="text-zinc-200">{session.respondentEmail || '—'}</p>
            </div>
          ) : null}
          {!loadingTree && tree?.quiz.collectPhone ? (
            <div>
              <p className="text-xs text-zinc-500">Telefone</p>
              <p className="text-zinc-200">{session.respondentPhone || '—'}</p>
            </div>
          ) : null}
          {!loadingTree &&
          tree &&
          !tree.quiz.collectName &&
          !tree.quiz.collectEmail &&
          !tree.quiz.collectPhone ? (
            <div className="sm:col-span-2">
              <p className="text-xs text-zinc-500">Identificação</p>
              <p className="text-zinc-400">Sessão anônima (sem dados pedidos)</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs text-zinc-500">Status</p>
            <Badge
              tone={session.status === 'completed' ? 'success' : 'warning'}
            >
              {session.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Início</p>
            <p className="text-zinc-300">{formatDateTimePtBr(session.startedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Conclusão</p>
            <p className="text-zinc-300">
              {session.completedAt ? formatDateTimePtBr(session.completedAt) : '—'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-zinc-500">Caminho (IDs)</p>
            <p className="break-all font-mono text-xs text-zinc-400">
              {session.pathTaken || '—'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respostas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingTree && quizId ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Pergunta
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Valor / opção
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-400">
                      Quando
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {answers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-zinc-500"
                      >
                        Nenhuma resposta registrada.
                      </td>
                    </tr>
                  ) : (
                    answers.map((a) => {
                      const qTitle =
                        questionTitles.get(a.questionNodeId) ??
                        a.questionNodeId.slice(0, 8)
                      let displayValue = a.answerValue
                      if (a.answerOptionId) {
                        const lbl = optionLabels.get(a.answerOptionId)
                        if (lbl) displayValue = `${lbl} (${a.answerValue || a.answerOptionId})`
                      }
                      return (
                        <tr key={a.id} className="bg-zinc-950/40">
                          <td className="px-4 py-3 text-zinc-200">{qTitle}</td>
                          <td className="px-4 py-3 text-zinc-300">
                            {displayValue || '—'}
                          </td>
                          <td className="px-4 py-3 text-zinc-500">
                            {formatDateTimePtBr(a.answeredAt)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
