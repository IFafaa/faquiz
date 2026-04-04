export const QuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TEXT: 'text',
  RATING: 'rating',
} as const;

export type QuestionTypeValue =
  (typeof QuestionType)[keyof typeof QuestionType];
