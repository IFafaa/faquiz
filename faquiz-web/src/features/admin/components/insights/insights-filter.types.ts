import type { DateRange } from 'react-day-picker'

export type InsightsFormState = {
  respondentNameContains: string
  respondentEmailContains: string
  respondentPhoneContains: string
  statusInProgress: boolean
  statusCompleted: boolean
  statusAbandoned: boolean
  startedRange: DateRange | undefined
  completedRange: DateRange | undefined
  answerSelections: Record<string, string[]>
}

export const emptyForm = (): InsightsFormState => ({
  respondentNameContains: '',
  respondentEmailContains: '',
  respondentPhoneContains: '',
  statusInProgress: true,
  statusCompleted: true,
  statusAbandoned: false,
  startedRange: undefined,
  completedRange: undefined,
  answerSelections: {},
})
