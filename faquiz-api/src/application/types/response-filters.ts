export interface QuestionAnswerFilterInput {
  questionNodeId: string;
  answerValues: string[];
}

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
