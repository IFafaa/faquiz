import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

interface StatCardProps {
  label: string
  value: ReactNode
  detail?: ReactNode
  className?: string
}

export function StatCard({ label, value, detail, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="font-display text-3xl font-bold text-zinc-50">{value}</p>
        {detail ? (
          <p className="mt-1 text-xs text-zinc-500">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
