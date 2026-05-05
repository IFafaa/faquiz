import type { QuestionType } from '@/shared/types/api'

export interface BuilderAnswerOption {
  id: string
  label: string
  value: string
  order: number
  nextQuestionNodeId: string | null
}

export interface QuestionNodeData extends Record<string, unknown> {
  title: string
  description: string
  questionType: QuestionType
  answerOptions: BuilderAnswerOption[]
}
