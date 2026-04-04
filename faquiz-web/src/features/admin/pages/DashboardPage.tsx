import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { faquizApi } from '@/app/api'
import type { AnalyticsResponse } from '@/shared/types/api'
import { Spinner } from '@/shared/ui/Spinner'
import { DashboardStatsGrid } from '@/features/admin/components/dashboard/DashboardStatsGrid'
import { DashboardSessionsChart } from '@/features/admin/components/dashboard/DashboardSessionsChart'
import { DashboardQuizTable } from '@/features/admin/components/dashboard/DashboardQuizTable'

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
    queryFn: () => faquizApi.listQuizzes(),
  })

  const analyticsQueries = useQueries({
    queries: (quizzes ?? []).map((q) => ({
      queryKey: ['analytics', q.id],
      queryFn: () => faquizApi.getQuizAnalytics(q.id),
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

      <DashboardStatsGrid
        quizCount={quizzes?.length ?? 0}
        totalSessions={totals.totalSessions}
        completedSessions={totals.completedSessions}
        completionRate={totals.rate}
      />

      <DashboardSessionsChart data={chartData} />

      <DashboardQuizTable quizzes={quizzes ?? []} />
    </div>
  )
}
