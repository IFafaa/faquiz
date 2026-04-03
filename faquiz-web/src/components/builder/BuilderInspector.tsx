import type { QuestionType } from '@/types/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { QuestionNodeData } from './types'

interface Props {
  data: QuestionNodeData
  onChange: (next: QuestionNodeData) => void
  onAddOption: () => void
  onRemoveOption: (optionId: string) => void
}

const TYPES: QuestionType[] = ['multiple_choice', 'text', 'rating']

export function BuilderInspector({
  data,
  onChange,
  onAddOption,
  onRemoveOption,
}: Props) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Título
        </label>
        <input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Descrição
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Tipo
        </label>
        <select
          value={data.questionType}
          onChange={(e) =>
            onChange({
              ...data,
              questionType: e.target.value as QuestionType,
            })
          }
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Opções</span>
          <Button type="button" size="sm" variant="secondary" onClick={onAddOption}>
            + Opção
          </Button>
        </div>
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {data.answerOptions
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((opt) => (
              <li
                key={opt.id}
                className="flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2"
              >
                <Input
                  label="Rótulo"
                  value={opt.label}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      answerOptions: data.answerOptions.map((o) =>
                        o.id === opt.id ? { ...o, label: e.target.value } : o,
                      ),
                    })
                  }
                  className="!py-1.5 text-xs"
                />
                <Input
                  label="Valor"
                  value={opt.value}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      answerOptions: data.answerOptions.map((o) =>
                        o.id === opt.id ? { ...o, value: e.target.value } : o,
                      ),
                    })
                  }
                  className="!py-1.5 text-xs"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="self-end"
                  onClick={() => onRemoveOption(opt.id)}
                >
                  Remover
                </Button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
