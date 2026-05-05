import { useCallback, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { faquizApi } from '@/app/api'
import type { ResponseFilters } from '@/shared/types/api'
import { Spinner } from '@/shared/ui/Spinner'
import { InsightsFilterPanel } from '@/features/studio/components/insights/InsightsFilterPanel'
import {
  emptyForm,
  type InsightsFormState,
} from '@/features/studio/components/insights/insights-filter.types'
import { InsightsOverviewCards } from '@/features/studio/components/insights/InsightsOverviewCards'
import { InsightsCompareSection } from '@/features/studio/components/insights/InsightsCompareSection'
import { QuestionDistributionGrid } from '@/features/studio/components/insights/QuestionDistributionGrid'
import { formToFilters } from '@/features/studio/utils/insights-filters'

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
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
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
