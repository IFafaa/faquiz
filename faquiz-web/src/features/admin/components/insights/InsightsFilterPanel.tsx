import type { InsightsFormState } from './insights-filter.types'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { cn } from '@/shared/utils/cn'
import { InsightsDateRangeField } from '@/features/admin/components/InsightsDateRangeField'

interface QuestionNode {
  id: string
  title: string
  questionType: string
  answerOptions?: Array<{ id: string; label: string; value: string }>
}

interface Props {
  form: InsightsFormState
  onFormChange: (next: InsightsFormState) => void
  collectName: boolean
  collectEmail: boolean
  collectPhone: boolean
  nodes: QuestionNode[]
  onApply: () => void
  onClear: () => void
  onExport: () => void
  exportPending: boolean
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-zinc-600 bg-zinc-900 text-brand-500 focus:ring-brand-500"
      />
      {label}
    </label>
  )
}

export function InsightsFilterPanel({
  form,
  onFormChange,
  collectName,
  collectEmail,
  collectPhone,
  nodes,
  onApply,
  onClear,
  onExport,
  exportPending,
}: Props) {
  const set = <K extends keyof InsightsFormState>(
    key: K,
    value: InsightsFormState[K],
  ) => onFormChange({ ...form, [key]: value })

  const toggleAnswer = (questionId: string, value: string) => {
    const prev = form.answerSelections[questionId] ?? []
    const next = prev.includes(value)
      ? prev.filter((v) => v !== value)
      : [...prev, value]
    onFormChange({
      ...form,
      answerSelections: { ...form.answerSelections, [questionId]: next },
    })
  }

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-zinc-100">
            Filtros
          </h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onClear}>
              Limpar
            </Button>
            <Button size="sm" variant="secondary" onClick={onApply}>
              Aplicar filtros
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onExport}
              disabled={exportPending}
            >
              {exportPending ? 'Exportando…' : 'Exportar Excel'}
            </Button>
          </div>
        </div>

        {(collectName || collectEmail || collectPhone) && (
          <div className="grid gap-3 sm:grid-cols-3">
            {collectName && (
              <div>
                <span className="block text-sm text-zinc-400">Nome contém</span>
                <input
                  value={form.respondentNameContains}
                  onChange={(e) => set('respondentNameContains', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  placeholder="Buscar por nome"
                />
              </div>
            )}
            {collectEmail && (
              <div>
                <span className="block text-sm text-zinc-400">E-mail contém</span>
                <input
                  value={form.respondentEmailContains}
                  onChange={(e) => set('respondentEmailContains', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  placeholder="Buscar por e-mail"
                />
              </div>
            )}
            {collectPhone && (
              <div>
                <span className="block text-sm text-zinc-400">Telefone contém</span>
                <input
                  value={form.respondentPhoneContains}
                  onChange={(e) => set('respondentPhoneContains', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  placeholder="Buscar por telefone"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Checkbox
            checked={form.statusInProgress}
            onChange={(v) => set('statusInProgress', v)}
            label="Em andamento"
          />
          <Checkbox
            checked={form.statusCompleted}
            onChange={(v) => set('statusCompleted', v)}
            label="Concluídas"
          />
          <Checkbox
            checked={form.statusAbandoned}
            onChange={(v) => set('statusAbandoned', v)}
            label="Abandonadas"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InsightsDateRangeField
            label="Período de início"
            range={form.startedRange}
            onChange={(r) => set('startedRange', r)}
          />
          <InsightsDateRangeField
            label="Período de conclusão"
            range={form.completedRange}
            onChange={(r) => set('completedRange', r)}
          />
        </div>

        {nodes.filter((n) => n.questionType === 'multiple_choice').length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-400">
              Filtrar por respostas
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nodes
                .filter((n) => n.questionType === 'multiple_choice')
                .map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'rounded-lg border border-zinc-800 bg-zinc-950/50 p-3',
                    )}
                  >
                    <p className="mb-2 text-xs font-medium text-zinc-300 line-clamp-1">
                      {n.title}
                    </p>
                    <div className="space-y-1">
                      {(n.answerOptions ?? []).map((opt) => {
                        const selected = (
                          form.answerSelections[n.id] ?? []
                        ).includes(opt.value)
                        return (
                          <label
                            key={opt.id}
                            className="flex items-center gap-2 text-xs text-zinc-400"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleAnswer(n.id, opt.value)}
                              className="rounded border-zinc-600 bg-zinc-900 text-brand-500 focus:ring-brand-500"
                            />
                            {opt.label}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
