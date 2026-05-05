import clsx from 'clsx'
import type { Node } from '@xyflow/react'
import { Card } from '@/shared/ui/Card'
import { BuilderInspector } from './BuilderInspector'
import type { QuestionNodeData } from './types'
import {
  useSidebarResize,
  SIDEBAR_CHEVRON_THRESHOLD,
} from '@/features/studio/hooks/useSidebarResize'
import { useMinWidthMd } from '@/features/studio/hooks/useMinWidthMd'

interface Props {
  quizTitle: string | undefined
  rootNodeId: string | null
  onRootNodeChange: (id: string | null) => void
  nodes: Node<QuestionNodeData>[]
  selectedNode: Node<QuestionNodeData> | undefined
  onUpdateData: (data: QuestionNodeData) => void
  onAddOption: () => void
  onRemoveOption: (optionId: string) => void
}

export function BuilderSidebar({
  quizTitle,
  rootNodeId,
  onRootNodeChange,
  nodes,
  selectedNode,
  onUpdateData,
  onAddOption,
  onRemoveOption,
}: Props) {
  const isMd = useMinWidthMd()
  const { sidebarWidth, isResizing, onResizePointerDown, SIDEBAR_W_MIN, sidebarMaxWidth } =
    useSidebarResize()
  const sidebarExpanded = sidebarWidth > SIDEBAR_CHEVRON_THRESHOLD

  return (
    <div className="flex w-full flex-col md:w-auto md:flex-row md:items-stretch">
      <ResizeHandle
        isResizing={isResizing}
        sidebarExpanded={sidebarExpanded}
        onPointerDown={isMd ? onResizePointerDown : undefined}
        min={SIDEBAR_W_MIN}
        max={sidebarMaxWidth}
        current={Math.round(sidebarWidth)}
      />
      <Card
        className="w-full min-w-0 shrink-0 space-y-4 overflow-hidden p-4 md:rounded-l-none md:border-l-0"
        style={isMd ? { width: sidebarWidth } : undefined}
      >
        <div>
          <p className="text-xs text-zinc-500">Quiz</p>
          <p className="font-medium text-zinc-200">{quizTitle}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Nó raiz (início do quiz)
          </label>
          <select
            value={rootNodeId ?? ''}
            onChange={(e) => onRootNodeChange(e.target.value || null)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">— selecione —</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {(n.data as QuestionNodeData).title || n.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <p className="mb-2 text-xs font-semibold text-zinc-400">Inspetor</p>
          {selectedNode ? (
            <BuilderInspector
              key={selectedNode.id}
              data={selectedNode.data}
              onChange={onUpdateData}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption}
            />
          ) : (
            <p className="text-xs text-zinc-500">
              Selecione um nó para editar. Arraste das saídas (à direita) até
              outro nó para definir o fluxo.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

function ResizeHandle({
  isResizing,
  sidebarExpanded,
  onPointerDown,
  min,
  max,
  current,
}: {
  isResizing: boolean
  sidebarExpanded: boolean
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void
  min: number
  max: number
  current: number
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-label="Redimensionar painel lateral"
      onPointerDown={onPointerDown}
      className={clsx(
        'group hidden w-3 shrink-0 cursor-col-resize touch-none select-none flex-col items-center justify-center rounded-l border border-r-0 border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 md:flex',
        isResizing && 'bg-brand-900/40',
      )}
    >
      <span
        className="pointer-events-none text-zinc-500 group-hover:text-zinc-300"
        aria-hidden
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidebarExpanded ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
          />
        </svg>
      </span>
    </div>
  )
}
