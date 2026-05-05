import {
  SessionStatus,
  type SessionStatusValue,
} from '../value-objects/session-status.js';

export type QuizSessionPersistenceProps = {
  id: string;
  quizId: string;
  respondentName: string;
  respondentEmail: string;
  respondentPhone: string;
  status: SessionStatusValue;
  pathTaken: string;
  startedAt: Date;
  completedAt: Date | null;
};

export class QuizSession {
  private _status: SessionStatusValue;
  private _pathTaken: string;
  private _completedAt: Date | null;

  constructor(
    public readonly id: string,
    public readonly quizId: string,
    public readonly respondentName: string,
    public readonly respondentEmail: string,
    public readonly respondentPhone: string,
    status: SessionStatusValue,
    pathTaken: string,
    public readonly startedAt: Date,
    completedAt: Date | null,
  ) {
    this._status = status;
    this._pathTaken = pathTaken;
    this._completedAt = completedAt;
  }

  get status(): SessionStatusValue {
    return this._status;
  }

  get pathTaken(): string {
    return this._pathTaken;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  static createDraft(params: {
    quizId: string;
    respondentName: string;
    respondentEmail: string;
    respondentPhone: string;
  }): QuizSession {
    const now = new Date();
    return new QuizSession(
      '',
      params.quizId,
      params.respondentName,
      params.respondentEmail,
      params.respondentPhone,
      SessionStatus.IN_PROGRESS,
      '[]',
      now,
      null,
    );
  }

  static fromPersistence(p: QuizSessionPersistenceProps): QuizSession {
    return new QuizSession(
      p.id,
      p.quizId,
      p.respondentName,
      p.respondentEmail,
      p.respondentPhone,
      p.status,
      p.pathTaken,
      p.startedAt,
      p.completedAt,
    );
  }

  isNew(): boolean {
    return this.id === '';
  }

  updateProgress(next: {
    pathTaken: string;
    status: SessionStatusValue;
    completedAt: Date | null;
  }): void {
    this._pathTaken = next.pathTaken;
    this._status = next.status;
    this._completedAt = next.completedAt;
  }
}
