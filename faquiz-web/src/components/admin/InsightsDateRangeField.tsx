import { useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/cn'

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from) return 'Selecionar período'
  const fromStr = format(range.from, 'dd/MM/yyyy', { locale: ptBR })
  if (!range.to) return `De ${fromStr}…`
  const toStr = format(range.to, 'dd/MM/yyyy', { locale: ptBR })
  if (range.from.getTime() === range.to.getTime()) return fromStr
  return `${fromStr} – ${toStr}`
}

type Props = {
  label: string
  range: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

export function InsightsDateRangeField({ label, range, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <span className="block text-sm text-zinc-400">{label}</span>
      <button
        type="button"
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-100 hover:border-zinc-600"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={cn(!range?.from && 'text-zinc-500')}>
          {formatRangeLabel(range)}
        </span>
        <span className="text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fechar calendário"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-zinc-700 bg-zinc-950 p-3 shadow-xl sm:left-auto sm:right-auto sm:min-w-[min(100%,320px)]">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={onChange}
              locale={ptBR}
              numberOfMonths={1}
              className="insights-day-picker"
            />
            <div className="mt-2 flex justify-end gap-3 border-t border-zinc-800 pt-2">
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-zinc-300"
                onClick={() => {
                  onChange(undefined)
                  setOpen(false)
                }}
              >
                Limpar
              </button>
              <button
                type="button"
                className="text-xs text-brand-400 hover:text-brand-300"
                onClick={() => setOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
