import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/cn'
import type { QuestionNodeData } from './types'

export function QuestionFlowNode({
  data,
  selected,
}: NodeProps<Node<QuestionNodeData>>) {
  const opts = [...(data.answerOptions ?? [])].sort((a, b) => a.order - b.order)

  return (
    <div
      className={cn(
        'min-w-[220px] max-w-[260px] rounded-xl border bg-zinc-900/95 px-3 py-2 shadow-lg backdrop-blur-sm',
        selected ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-zinc-600',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-brand-400"
      />
      <div className="flex items-start justify-between gap-2 border-b border-zinc-700/80 pb-2">
        <span className="line-clamp-2 text-xs font-semibold text-zinc-100">
          {data.title || 'Sem título'}
        </span>
        <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] uppercase text-zinc-400">
          {data.questionType.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-2 space-y-0">
        {opts.length === 0 ? (
          <p className="py-2 text-center text-[10px] text-zinc-500">
            Sem opções — adicione no inspetor
          </p>
        ) : (
          opts.map((opt) => (
            <div
              key={opt.id}
              className="relative flex h-7 items-center justify-between gap-1 border-t border-zinc-800/80 first:border-t-0"
            >
              <span className="truncate pl-1 text-[10px] text-zinc-400">
                {opt.label}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={`opt-${opt.id}`}
                className="!static !h-2.5 !w-2.5 !translate-y-0 !border-2 !border-zinc-900 !bg-emerald-400"
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
