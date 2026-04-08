import type { AnalyticsResponse } from '@/shared/types/api'

export type SessionsPerDayPoint = { date: string; count: number }

export function mergeSessionsPerDay(
  analytics: AnalyticsResponse[],
): SessionsPerDayPoint[] {
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
