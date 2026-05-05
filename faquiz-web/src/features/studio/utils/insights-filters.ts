import { endOfDay, startOfDay } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import type { InsightsFormState } from '@/features/studio/components/insights/insights-filter.types'
import type { ResponseFilters } from '@/shared/types/api'

export function rangeToIsoBounds(range: DateRange | undefined) {
  if (!range?.from) return undefined
  const from = startOfDay(range.from)
  const to = range.to != null ? endOfDay(range.to) : endOfDay(range.from)
  return { from: from.toISOString(), to: to.toISOString() }
}

export function formToFilters(form: InsightsFormState): ResponseFilters {
  const f: ResponseFilters = {}
  const name = form.respondentNameContains.trim()
  if (name) f.respondentNameContains = name
  const email = form.respondentEmailContains.trim()
  if (email) f.respondentEmailContains = email
  const phone = form.respondentPhoneContains.trim()
  if (phone) f.respondentPhoneContains = phone

  const status: string[] = []
  if (form.statusInProgress) status.push('in_progress')
  if (form.statusCompleted) status.push('completed')
  if (form.statusAbandoned) status.push('abandoned')
  if (status.length > 0 && status.length < 3) f.status = status

  const started = rangeToIsoBounds(form.startedRange)
  if (started) {
    f.startedAtFrom = started.from
    f.startedAtTo = started.to
  }
  const completed = rangeToIsoBounds(form.completedRange)
  if (completed) {
    f.completedAtFrom = completed.from
    f.completedAtTo = completed.to
  }

  const qf: ResponseFilters['questionFilters'] = []
  for (const [qid, values] of Object.entries(form.answerSelections)) {
    if (values.length > 0) {
      qf.push({ questionNodeId: qid, answerValues: values })
    }
  }
  if (qf.length > 0) f.questionFilters = qf

  return f
}
