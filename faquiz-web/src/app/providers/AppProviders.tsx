import { type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/shared/utils/query-client'

const queryClient = createQueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
