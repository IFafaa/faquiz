import { useCallback, useState } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import type { ResponseFilters } from '@/shared/types/api'
import { Spinner } from '@/shared/ui/Spinner'
import { InsightsFilterPanel } from '@/features/admin/components/insights/InsightsFilterPanel'
import {
  emptyForm,
  type InsightsFormState,
} from '@/features/admin/components/insights/insights-filter.types'
import { InsightsOverviewCards } from '@/features/admin/components/insights/InsightsOverviewCards'
import { InsightsCompareSection } from '@/features/admin/components/insights/InsightsCompareSection'
import { QuestionDistributionGrid } from '@/features/admin/components/insights/QuestionDistributionGrid'
import type { DateRange } from 'react-day-picker'

function rangeToIsoBounds(range: DateRange | undefined) {
  if (!range?.from) return undefined
  const from = startOfDay(range.from)
  const to = range.to != null ? endOfDay(range.to) : endOfDay(range.from)
  return { from: from.toISOString(), to: to.toISOString() }
}

function formToFilters(form: InsightsFormState): ResponseFilters {
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
  const [form, setForm] = useState<InsightsFormState>(emptyForm)
  const [appliedFilters, setAppliedFilters] = useState<ResponseFilters>({})

  const { data: tree, isLoading: loadingTree } = useQuery({
    queryKey: ['quiz-tree', id],
    queryFn: () => faquizApi.getQuizTree(id),
    enabled: !!id,
  })

  const {
    data: aggregates,
    isLoading: loadingAgg,
    isFetching: fetchingAgg,
  } = useQuery({
    queryKey: ['quiz-aggregates', id, appliedFilters],
    queryFn: () =>
      faquizApi.postQuizAggregates(id, {
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
      const blob = await faquizApi.exportQuizResponses(id, { filters })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faquiz-${id.slice(0, 8)}-respostas.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    },
  })

  const nodes = tree?.nodes ?? []
  const loading = loadingTree
  const aggLoading = loadingAgg || fetchingAgg

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">
          Insights
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {loading
            ? 'Carregando…'
            : 'Filtre sessões, compare perguntas e veja distribuições. Exporte respostas em Excel quando precisar.'}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <InsightsFilterPanel
            form={form}
            onFormChange={setForm}
            collectName={tree?.quiz.collectName ?? false}
            collectEmail={tree?.quiz.collectEmail ?? false}
            collectPhone={tree?.quiz.collectPhone ?? false}
            nodes={nodes}
            onApply={applyFilters}
            onClear={() => {
              setForm(emptyForm())
              setAppliedFilters({})
            }}
            onExport={() => exportMutation.mutate()}
            exportPending={exportMutation.isPending}
          />

          {aggLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Spinner />
            </div>
          ) : aggregates ? (
            <>
              <InsightsOverviewCards aggregates={aggregates} />
              <InsightsCompareSection questions={aggregates.questions} />
              <QuestionDistributionGrid questions={aggregates.questions} />
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
