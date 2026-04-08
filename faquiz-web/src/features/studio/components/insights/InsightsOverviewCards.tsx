import type { AggregatesResponse } from '@/shared/types/api'
import { StatCard } from '@/shared/ui/StatCard'

interface Props {
  aggregates: AggregatesResponse
}

export function InsightsOverviewCards({ aggregates }: Props) {
  const totalQuestions = aggregates.questions.length
  const totalAnswers = aggregates.questions.reduce(
    (sum, q) => sum + q.distribution.reduce((s, d) => s + d.count, 0),
    0,
  )

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Sessões filtradas"
        value={aggregates.filteredSessionCount}
      />
      <StatCard label="Perguntas alcançadas" value={totalQuestions} />
      <StatCard label="Total de respostas" value={totalAnswers} />
    </div>
  )
}
