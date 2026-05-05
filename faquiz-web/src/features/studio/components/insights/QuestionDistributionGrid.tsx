import {
  Bar,
  BarChart,
  CartesianGrid,
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

export function QuestionDistributionGrid({ questions }: Props) {
  if (questions.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="font-display text-base font-semibold text-zinc-100">
        Distribuição por pergunta
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {questions.map((q) => (
          <Card key={q.questionNodeId}>
            <CardHeader>
              <CardTitle className="text-sm">{q.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {q.distribution.length === 0 ? (
                <p className="py-6 text-center text-xs text-zinc-500">
                  Sem respostas
                </p>
              ) : (
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={q.distribution}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_GRID_STROKE}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelStyle={{ color: '#e4e4e7' }}
                      />
                      <Bar
                        dataKey="count"
                        name="Respostas"
                        fill="#8000CB"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
