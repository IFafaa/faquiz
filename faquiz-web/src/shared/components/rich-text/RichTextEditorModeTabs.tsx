import clsx from 'clsx'
import type { RichTextEditMode } from './types'

interface Props {
  mode: RichTextEditMode
  onVisual: () => void
  onHtml: () => void
}

export function RichTextEditorModeTabs({ mode, onVisual, onHtml }: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-950/50 px-2 py-1.5"
      role="tablist"
      aria-label="Modo de edição"
    >
      <div className="flex rounded-lg border border-zinc-700/80 p-0.5">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'visual'}
          className={clsx(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            mode === 'visual'
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
          onClick={() => {
            if (mode === 'html') onVisual()
          }}
        >
          Visual
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'html'}
          className={clsx(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            mode === 'html'
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
          onClick={() => {
            if (mode === 'visual') onHtml()
          }}
        >
          Código HTML
        </button>
      </div>
      <p className="hidden text-[11px] text-zinc-500 sm:block">
        No modo visual, &lt;p&gt; é texto. Use &quot;Código HTML&quot; para marcas.
      </p>
    </div>
  )
}
