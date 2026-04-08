import {
  Area,
  AreaChart,
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

interface Props {
  data: Array<{ date: string; count: number }>
}

export function DashboardSessionsChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessões por dia (todos os quizzes)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            Ainda não há dados de sessão para exibir no gráfico.
          </p>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B366FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8000CB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
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
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Sessões"
                  stroke="#8000CB"
                  strokeWidth={2}
                  fill="url(#fillSessions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
