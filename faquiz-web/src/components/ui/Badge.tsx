import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'default' | 'success' | 'warning' | 'muted'

const tones: Record<Tone, string> = {
  default: 'bg-brand-500/15 text-brand-100 border-brand-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  muted: 'bg-zinc-800 text-zinc-400 border-zinc-700',
}

export function Badge({
  className,
  tone = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
