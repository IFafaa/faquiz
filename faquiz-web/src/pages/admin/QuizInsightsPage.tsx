import { useCallback, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { endOfDay, startOfDay } from 'date-fns'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  exportQuizResponses,
  getQuizTree,
  postQuizAggregates,
} from '@/api/quiz'
import type { ResponseFilters } from '@/types/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { InsightsDateRangeField } from '@/components/admin/InsightsDateRangeField'

type FormState = {
  respondentNameContains: string
  statusInProgress: boolean
  statusCompleted: boolean
  statusAbandoned: boolean
  startedRange: DateRange | undefined
  completedRange: DateRange | undefined
  /** questionNodeId -> selected option values */
  answerSelections: Record<string, string[]>
}

const emptyForm = (): FormState => ({
  respondentNameContains: '',
  statusInProgress: true,
  statusCompleted: true,
  statusAbandoned: false,
  startedRange: undefined,
  completedRange: undefined,
  answerSelections: {},
})

function rangeToIsoBounds(range: DateRange | undefined) {
  if (!range?.from) return undefined
  const from = startOfDay(range.from)
  const to =
    range.to != null ? endOfDay(range.to) : endOfDay(range.from)
  return { from: from.toISOString(), to: to.toISOString() }
}

function formToFilters(form: FormState): ResponseFilters {
  const f: ResponseFilters = {}
  const name = form.respondentNameContains.trim()
  if (name) f.respondentNameContains = name

  const status: string[] = []
  if (form.statusInProgress) status.push('in_progress')
  if (form.statusCompleted) status.push('completed')
  if (form.statusAbandoned) status.push('abandoned')
  if (status.length > 0 && status.length < 3) f.status = status

  const started = rangeToIsoBounds(form.startedRange)
  if (started) {
    f.startedAtFrom = started.from
    f.startedAtTo = started.to
  }
  const completed = rangeToIsoBounds(form.completedRange)
  if (completed) {
    f.completedAtFrom = completed.from
    f.completedAtTo = completed.to
  }

  const qf: ResponseFilters['questionFilters'] = []
  for (const [qid, values] of Object.entries(form.answerSelections)) {
    if (values.length > 0) {
      qf.push({ questionNodeId: qid, answerValues: values })
    }
  }
  if (qf.length > 0) f.questionFilters = qf

  return f
}

export function QuizInsightsPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [appliedFilters, setAppliedFilters] = useState<ResponseFilters>({})
  const [compareA, setCompareA] = useState<string>('')
  const [compareB, setCompareB] = useState<string>('')

  const { data: tree, isLoading: loadingTree } = useQuery({
    queryKey: ['quiz-tree', id],
    queryFn: () => getQuizTree(id),
    enabled: !!id,
  })

  const {
    data: aggregates,
    isLoading: loadingAgg,
    isFetching: fetchingAgg,
  } = useQuery({
    queryKey: ['quiz-aggregates', id, appliedFilters],
    queryFn: () =>
      postQuizAggregates(id, {
        filters:
          Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined,
      }),
    enabled: !!id,
  })

  const applyFilters = useCallback(() => {
    setAppliedFilters(formToFilters(form))
  }, [form])

  const exportMutation = useMutation({
    mutationFn: async () => {
      const filters =
        Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined
      const blob = await exportQuizResponses(id, { filters })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faquiz-${id.slice(0, 8)}-respostas.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    },
  })

  const nodes = tree?.nodes ?? []

  const toggleAnswer = (qid: string, value: string, checked: boolean) => {
    setForm((prev) => {
      const cur = new Set(prev.answerSelections[qid] ?? [])
      if (checked) cur.add(value)
      else cur.delete(value)
      return {
        ...prev,
        answerSelections: {
          ...prev.answerSelections,
          [qid]: [...cur],
        },
      }
    })
  }

  const loading = loadingTree
  const aggLoading = loadingAgg || fetchingAgg

  const qCompareA = aggregates?.questions.find((q) => q.questionNodeId === compareA)
  const qCompareB = aggregates?.questions.find((q) => q.questionNodeId === compareB)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Insights e exportação
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {loading
            ? 'Carregando…'
            : 'Filtre sessões, veja gráficos por pergunta e exporte para Excel.'}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-sm">
                  <span className="text-zinc-400">Nome do respondente contém</span>
                  <input
                    type="text"
                    value={form.respondentNameContains}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        respondentNameContains: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                </label>
                <div className="text-sm">
                  <span className="text-zinc-400">Status</span>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {(
                      [
                        ['in_progress', 'Em andamento'],
                        ['completed', 'Concluída'],
                        ['abandoned', 'Abandonada'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            key === 'in_progress'
                              ? form.statusInProgress
                              : key === 'completed'
                                ? form.statusCompleted
                                : form.statusAbandoned
                          }
                          onChange={(e) => {
                            const v = e.target.checked
                            setForm((f) =>
                              key === 'in_progress'
                                ? { ...f, statusInProgress: v }
                                : key === 'completed'
                                  ? { ...f, statusCompleted: v }
                                  : { ...f, statusAbandoned: v },
                            )
                          }}
                          className="rounded border-zinc-600"
                        />
                        <span className="text-zinc-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InsightsDateRangeField
                  label="Início da sessão (intervalo)"
                  range={form.startedRange}
                  onChange={(r) =>
                    setForm((f) => ({ ...f, startedRange: r }))
                  }
                />
                <InsightsDateRangeField
                  label="Conclusão (intervalo)"
                  range={form.completedRange}
                  onChange={(r) =>
                    setForm((f) => ({ ...f, completedRange: r }))
                  }
                />
              </div>

              {nodes.length > 0 && (
                <div className="space-y-3 border-t border-zinc-800 pt-4">
                  <p className="text-sm font-medium text-zinc-300">
                    Respostas por pergunta (incluir apenas sessões com estas opções)
                  </p>
                  <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
                    {nodes.map((n) => {
                      const sel = form.answerSelections[n.id] ?? []
                      if (n.answerOptions.length === 0) return null
                      return (
                        <div key={n.id} className="rounded-lg border border-zinc-800 p-3">
                          <p className="mb-2 text-xs font-medium text-zinc-400">
                            {n.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {n.answerOptions.map((o) => {
                              const on = sel.includes(o.value)
                              return (
                                <button
                                  key={o.id}
                                  type="button"
                                  onClick={() =>
                                    toggleAnswer(n.id, o.value, !on)
                                  }
                                  className={cn(
                                    'rounded-full border px-2.5 py-1 text-xs transition-colors',
                                    on
                                      ? 'border-brand-500 bg-brand-950/50 text-brand-200'
                                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500',
                                  )}
                                >
                                  {o.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={() => applyFilters()}>
                  Aplicar filtros
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setForm(emptyForm())
                    setAppliedFilters({})
                  }}
                >
                  Limpar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={exportMutation.isPending}
                  onClick={() => exportMutation.mutate()}
                >
                  {exportMutation.isPending ? 'Exportando…' : 'Exportar Excel'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {aggLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Spinner />
            </div>
          ) : aggregates ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sessões filtradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold text-zinc-100">
                      {aggregates.filteredSessionCount}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Total de sessões que passam nos filtros atuais.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Sessões por dia (filtrado)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aggregates.timeline.length === 0 ? (
                      <p className="py-8 text-center text-sm text-zinc-500">
                        Sem dados no período.
                      </p>
                    ) : (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={aggregates.timeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #3f3f46',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#a78bfa"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Comparar duas perguntas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <label className="text-sm">
                      <span className="text-zinc-400">Pergunta A</span>
                      <select
                        value={compareA}
                        onChange={(e) => setCompareA(e.target.value)}
                        className="mt-1 block w-56 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      >
                        <option value="">—</option>
                        {aggregates.questions.map((q) => (
                          <option key={q.questionNodeId} value={q.questionNodeId}>
                            {q.title.slice(0, 60)}
                            {q.title.length > 60 ? '…' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      <span className="text-zinc-400">Pergunta B</span>
                      <select
                        value={compareB}
                        onChange={(e) => setCompareB(e.target.value)}
                        className="mt-1 block w-56 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      >
                        <option value="">—</option>
                        {aggregates.questions.map((q) => (
                          <option key={q.questionNodeId} value={q.questionNodeId}>
                            {q.title.slice(0, 60)}
                            {q.title.length > 60 ? '…' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {compareA && qCompareA && (
                    <div className="h-[240px]">
                      <p className="mb-2 text-xs text-zinc-500">A: {qCompareA.title}</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={qCompareA.distribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                          <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={120}
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              border: '1px solid #3f3f46',
                            }}
                          />
                          <Bar dataKey="count" fill="#a78bfa" name="Respostas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {compareB && qCompareB && (
                    <div className="h-[240px]">
                      <p className="mb-2 text-xs text-zinc-500">B: {qCompareB.title}</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={qCompareB.distribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                          <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={120}
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              border: '1px solid #3f3f46',
                            }}
                          />
                          <Bar dataKey="count" fill="#34d399" name="Respostas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <h2 className="font-display text-lg font-semibold text-zinc-100">
                  Distribuição por pergunta
                </h2>
                {aggregates.questions.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nenhuma pergunta no quiz.</p>
                ) : (
                  aggregates.questions.map((q) => (
                    <Card key={q.questionNodeId}>
                      <CardHeader>
                        <CardTitle className="text-base">{q.title}</CardTitle>
                        <p className="text-xs text-zinc-500">{q.questionType}</p>
                      </CardHeader>
                      <CardContent>
                        {q.distribution.length === 0 ? (
                          <p className="py-6 text-center text-sm text-zinc-500">
                            Sem respostas nos filtros atuais.
                          </p>
                        ) : (
                          <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={q.distribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                <XAxis
                                  dataKey="label"
                                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                  interval={0}
                                  angle={-35}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis
                                  allowDecimals={false}
                                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#18181b',
                                    border: '1px solid #3f3f46',
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="count"
                                  fill="#818cf8"
                                  name="Respostas"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
