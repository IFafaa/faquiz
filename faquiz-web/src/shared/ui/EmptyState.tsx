import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface EmptyStateProps {
  children: ReactNode
  className?: string
}

export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 px-6 py-14 text-center text-sm text-zinc-500',
        className,
      )}
    >
      {children}
    </div>
  )
}
