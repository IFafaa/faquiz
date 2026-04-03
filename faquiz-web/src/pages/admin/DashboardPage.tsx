import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getQuizAnalytics, listQuizzes } from '@/api/quiz'
import type { AnalyticsResponse } from '@/types/api'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

function mergeSessionsPerDay(
  analytics: AnalyticsResponse[],
): Array<{ date: string; count: number }> {
  const map = new Map<string, number>()
  for (const a of analytics) {
    for (const { date, count } of a.sessionsPerDay) {
      map.set(date, (map.get(date) ?? 0) + count)
    }
  }
  return Array.from(map.entries())
    .sort(([d1], [d2]) => d1.localeCompare(d2))
    .map(([date, count]) => ({ date, count }))
}

export function DashboardPage() {
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery({
    queryKey: ['quizzes'],
    queryFn: listQuizzes,
  })

  const analyticsQueries = useQueries({
    queries: (quizzes ?? []).map((q) => ({
      queryKey: ['analytics', q.id],
      queryFn: () => getQuizAnalytics(q.id),
      enabled: !!quizzes?.length,
    })),
  })

  const loadingAnalytics =
    !!quizzes?.length &&
    analyticsQueries.some((q) => q.isPending || q.isLoading)

  const analyticsList = useMemo(() => {
    return analyticsQueries
      .map((q) => q.data)
      .filter((d): d is AnalyticsResponse => d != null)
  }, [analyticsQueries])

  const chartData = useMemo(
    () => mergeSessionsPerDay(analyticsList),
    [analyticsList],
  )

  const totals = useMemo(() => {
    let totalSessions = 0
    let completedSessions = 0
    for (const a of analyticsList) {
      totalSessions += a.totalSessions
      completedSessions += a.completedSessions
    }
    const rate =
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 1000) / 10
        : 0
    return { totalSessions, completedSessions, rate }
  }, [analyticsList])

  if (loadingQuizzes || loadingAnalytics) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Visão geral dos quizzes e sessões nos últimos 30 dias.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">
              Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="font-display text-3xl font-bold text-zinc-50">
              {quizzes?.length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">
              Sessões totais
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="font-display text-3xl font-bold text-zinc-50">
              {totals.totalSessions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">
              Taxa de conclusão
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="font-display text-3xl font-bold text-zinc-50">
              {totals.rate}%
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {totals.completedSessions} de {totals.totalSessions} concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessões por dia (todos os quizzes)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Ainda não há dados de sessão para exibir no gráfico.
            </p>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e4e4e7' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Sessões"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    fill="url(#fillSessions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-zinc-100">
          Seus quizzes
        </h2>
        {(!quizzes || quizzes.length === 0) ? (
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
                        to={`/admin/quizzes/${q.id}/responses`}
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
    </div>
  )
}
