import { StatCard } from '@/shared/ui/StatCard'

interface Props {
  quizCount: number
  totalSessions: number
  completedSessions: number
  completionRate: number
}

export function DashboardStatsGrid({
  quizCount,
  totalSessions,
  completedSessions,
  completionRate,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Quizzes" value={quizCount} />
      <StatCard label="Sessões totais" value={totalSessions} />
      <StatCard
        label="Taxa de conclusão"
        value={`${completionRate}%`}
        detail={`${completedSessions} de ${totalSessions} concluídas`}
      />
    </div>
  )
}
