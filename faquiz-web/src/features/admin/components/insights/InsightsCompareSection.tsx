import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import {
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
} from '@/shared/ui/ChartTooltip'

interface QuestionAgg {
  questionNodeId: string
  title: string
  questionType: string
  distribution: Array<{ label: string; value: string; count: number }>
}

interface Props {
  questions: QuestionAgg[]
}

const COLORS = ['#8000CB', '#B366FF', '#00C9A7', '#FFB86C', '#FF5F6D']

export function InsightsCompareSection({ questions }: Props) {
  const mcQuestions = questions.filter((q) => q.questionType === 'multiple_choice')
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    mcQuestions.slice(0, 2).map((q) => q.questionNodeId),
  )

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const selected = mcQuestions.filter((q) =>
    selectedIds.includes(q.questionNodeId),
  )

  if (mcQuestions.length < 2) return null

  const allLabels = Array.from(
    new Set(selected.flatMap((q) => q.distribution.map((d) => d.label))),
  )

  const chartData = allLabels.map((label) => {
    const row: Record<string, string | number> = { label }
    for (const q of selected) {
      const entry = q.distribution.find((d) => d.label === label)
      row[q.title] = entry?.count ?? 0
    }
    return row
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparar perguntas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {mcQuestions.map((q) => (
            <button
              key={q.questionNodeId}
              type="button"
              onClick={() => toggle(q.questionNodeId)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                selectedIds.includes(q.questionNodeId)
                  ? 'border-brand-500 bg-brand-500/20 text-brand-200'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {q.title}
            </button>
          ))}
        </div>

        {selected.length >= 2 && chartData.length > 0 ? (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Legend />
                {selected.map((q, i) => (
                  <Bar
                    key={q.questionNodeId}
                    dataKey={q.title}
                    fill={COLORS[i % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500">
            Selecione ao menos duas perguntas para comparar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
