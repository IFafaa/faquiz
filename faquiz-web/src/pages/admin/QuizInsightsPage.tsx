import { useCallback, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { endOfDay, startOfDay } from 'date-fns'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  respondentEmailContains: string
  respondentPhoneContains: string
  statusInProgress: boolean
  statusCompleted: boolean
  statusAbandoned: boolean
  startedRange: DateRange | undefined
  completedRange: DateRange | undefined
  answerSelections: Record<string, string[]>
}

const emptyForm = (): FormState => ({
  respondentNameContains: '',
  respondentEmailContains: '',
  respondentPhoneContains: '',
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

const CHART_PALETTE = [
  '#8000CB',
  '#B366FF',
  '#5C1BB8',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#2dd4bf',
] as const

function formToFilters(form: FormState): ResponseFilters {
  const f: ResponseFilters = {}
  const name = form.respondentNameContains.trim()
  if (name) f.respondentNameContains = name

  const email = form.respondentEmailContains.trim()
  if (email) f.respondentEmailContains = email

  const phone = form.respondentPhoneContains.trim()
  if (phone) f.respondentPhoneContains = phone

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
  const collectName = tree?.quiz.collectName ?? false
  const collectEmail = tree?.quiz.collectEmail ?? false
  const collectPhone = tree?.quiz.collectPhone ?? false

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
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-950 px-5 py-4">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <h2 className="font-display text-xl font-semibold tracking-tight text-zinc-50">
            Insights e exportação
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {loading
              ? 'Carregando…'
              : 'Filtre sessões, compare perguntas e leia distribuições em grelha densa — mais contexto por ecrã.'}
          </p>
        </div>
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
                {collectName ? (
                  <label className="block text-sm">
                    <span className="text-zinc-400">
                      Nome do respondente contém
                    </span>
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
                ) : null}
                {collectEmail ? (
                  <label className="block text-sm">
                    <span className="text-zinc-400">E-mail contém</span>
                    <input
                      type="text"
                      value={form.respondentEmailContains}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          respondentEmailContains: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                    />
                  </label>
                ) : null}
                {collectPhone ? (
                  <label className="block text-sm">
                    <span className="text-zinc-400">Telefone contém</span>
                    <input
                      type="text"
                      value={form.respondentPhoneContains}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          respondentPhoneContains: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                    />
                  </label>
                ) : null}
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
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="border-zinc-800/80 bg-zinc-950/40 lg:row-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                      Sessões filtradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-zinc-50">
                      {aggregates.filteredSessionCount}
                    </p>
                    <p className="mt-2 text-xs leading-snug text-zinc-500">
                      Total que passa nos filtros atuais.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-zinc-800/80 bg-zinc-950/40 lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                      Sessões por dia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {aggregates.timeline.length === 0 ? (
                      <p className="py-10 text-center text-sm text-zinc-500">
                        Sem dados no período.
                      </p>
                    ) : (
                      <div className="h-[min(14rem,28vh)] w-full min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={aggregates.timeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: '#a1a1aa', fontSize: 10 }}
                              stroke="#3f3f46"
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fill: '#a1a1aa', fontSize: 10 }}
                              stroke="#3f3f46"
                              width={36}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#8000CB"
                              strokeWidth={2.5}
                              dot={{ r: 3, fill: '#8000CB', strokeWidth: 0 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-zinc-800/80 bg-zinc-950/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Comparar duas perguntas</CardTitle>
                  <p className="text-xs text-zinc-500">
                    Escolha A e B — os gráficos ficam lado a lado.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="text-zinc-400">Pergunta A</span>
                      <select
                        value={compareA}
                        onChange={(e) => setCompareA(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
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
                    <label className="block text-sm">
                      <span className="text-zinc-400">Pergunta B</span>
                      <select
                        value={compareB}
                        onChange={(e) => setCompareB(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100"
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
                  <div className="grid min-h-0 gap-4 md:grid-cols-2">
                    {compareA && qCompareA ? (
                      <div className="flex min-h-[260px] flex-col rounded-xl border border-zinc-800/60 bg-black/20 p-3">
                        <p className="mb-2 line-clamp-2 text-xs font-medium text-brand-200/90">
                          A · {qCompareA.title}
                        </p>
                        <div className="min-h-[220px] flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={qCompareA.distribution}
                              layout="vertical"
                              margin={{ left: 4, right: 8, top: 4, bottom: 4 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#27272a"
                                horizontal={false}
                              />
                              <XAxis
                                type="number"
                                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                stroke="#3f3f46"
                              />
                              <YAxis
                                type="category"
                                dataKey="label"
                                width={108}
                                tick={{ fill: '#a1a1aa', fontSize: 9 }}
                                stroke="#3f3f46"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#18181b',
                                  border: '1px solid #3f3f46',
                                  borderRadius: '8px',
                                }}
                              />
                              <Bar
                                dataKey="count"
                                fill="#8000CB"
                                name="Respostas"
                                maxBarSize={28}
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 text-xs text-zinc-600">
                        Selecione a pergunta A
                      </div>
                    )}
                    {compareB && qCompareB ? (
                      <div className="flex min-h-[260px] flex-col rounded-xl border border-zinc-800/60 bg-black/20 p-3">
                        <p className="mb-2 line-clamp-2 text-xs font-medium text-emerald-300/90">
                          B · {qCompareB.title}
                        </p>
                        <div className="min-h-[220px] flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={qCompareB.distribution}
                              layout="vertical"
                              margin={{ left: 4, right: 8, top: 4, bottom: 4 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#27272a"
                                horizontal={false}
                              />
                              <XAxis
                                type="number"
                                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                stroke="#3f3f46"
                              />
                              <YAxis
                                type="category"
                                dataKey="label"
                                width={108}
                                tick={{ fill: '#a1a1aa', fontSize: 9 }}
                                stroke="#3f3f46"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#18181b',
                                  border: '1px solid #3f3f46',
                                  borderRadius: '8px',
                                }}
                              />
                              <Bar
                                dataKey="count"
                                fill="#34d399"
                                name="Respostas"
                                maxBarSize={28}
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 text-xs text-zinc-600">
                        Selecione a pergunta B
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-zinc-100">
                      Distribuição por pergunta
                    </h2>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Grelha responsiva — até três gráficos por linha em ecrãs largos.
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1 text-xs tabular-nums text-zinc-400">
                    {aggregates.questions.length} perguntas
                  </span>
                </div>
                {aggregates.questions.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nenhuma pergunta no quiz.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {aggregates.questions.map((q, i) => (
                      <Card
                        key={q.questionNodeId}
                        className={cn(
                          'group border-zinc-800/80 bg-zinc-950/50 transition-colors',
                          'hover:border-zinc-700/90 hover:bg-zinc-950/80',
                        )}
                      >
                        <CardHeader className="space-y-1 pb-2">
                          <CardTitle className="line-clamp-2 text-left text-sm font-medium leading-snug text-zinc-100">
                            {q.title}
                          </CardTitle>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                            {q.questionType}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {q.distribution.length === 0 ? (
                            <p className="py-8 text-center text-xs text-zinc-500">
                              Sem respostas nos filtros atuais.
                            </p>
                          ) : (
                            <div className="h-[240px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={q.distribution}
                                  layout="vertical"
                                  margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#27272a"
                                    horizontal={false}
                                  />
                                  <XAxis
                                    type="number"
                                    tick={{ fill: '#a1a1aa', fontSize: 9 }}
                                    stroke="#3f3f46"
                                  />
                                  <YAxis
                                    type="category"
                                    dataKey="label"
                                    width={100}
                                    tick={{ fill: '#a1a1aa', fontSize: 8 }}
                                    stroke="#3f3f46"
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#18181b',
                                      border: '1px solid #3f3f46',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                    }}
                                  />
                                  <Bar
                                    dataKey="count"
                                    fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                                    name="Respostas"
                                    maxBarSize={26}
                                    radius={[0, 3, 3, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
