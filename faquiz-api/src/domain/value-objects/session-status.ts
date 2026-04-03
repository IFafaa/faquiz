export const SessionStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export type SessionStatusValue = (typeof SessionStatus)[keyof typeof SessionStatus];
