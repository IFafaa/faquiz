export interface QuestionAnswerFilterInput {
  questionNodeId: string;
  answerValues: string[];
}

/** Entrada de filtros para sessões (agregações / export). */
export interface ResponseFiltersInput {
  respondentNameContains?: string;
  respondentEmailContains?: string;
  respondentPhoneContains?: string;
  status?: string[];
  startedAtFrom?: string;
  startedAtTo?: string;
  completedAtFrom?: string;
  completedAtTo?: string;
  questionFilters?: QuestionAnswerFilterInput[];
}
