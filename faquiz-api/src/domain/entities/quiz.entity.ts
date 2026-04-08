export type QuizPersistenceProps = {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  rootNodeId: string | null;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Quiz {
  private _title: string;
  private _description: string;
  private _isPublished: boolean;
  private readonly _collectName: boolean;
  private readonly _collectEmail: boolean;
  private readonly _collectPhone: boolean;
  private _rootNodeId: string | null;
  private _updatedAt: Date;

  constructor(
    public readonly id: string,
    title: string,
    description: string,
    isPublished: boolean,
    collectName: boolean,
    collectEmail: boolean,
    collectPhone: boolean,
    rootNodeId: string | null,
    public readonly adminId: string,
    public readonly createdAt: Date,
    updatedAt: Date,
  ) {
    this._title = title;
    this._description = description;
    this._isPublished = isPublished;
    this._collectName = collectName;
    this._collectEmail = collectEmail;
    this._collectPhone = collectPhone;
    this._rootNodeId = rootNodeId;
    this._updatedAt = updatedAt;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get isPublished(): boolean {
    return this._isPublished;
  }

  get collectName(): boolean {
    return this._collectName;
  }

  get collectEmail(): boolean {
    return this._collectEmail;
  }

  get collectPhone(): boolean {
    return this._collectPhone;
  }

  get rootNodeId(): string | null {
    return this._rootNodeId;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static createDraft(params: {
    title: string;
    description: string;
    adminId: string;
    collectName: boolean;
    collectEmail: boolean;
    collectPhone: boolean;
  }): Quiz {
    const now = new Date();
    return new Quiz(
      '',
      params.title,
      params.description,
      false,
      params.collectName,
      params.collectEmail,
      params.collectPhone,
      null,
      params.adminId,
      now,
      now,
    );
  }

  static fromPersistence(p: QuizPersistenceProps): Quiz {
    return new Quiz(
      p.id,
      p.title,
      p.description,
      p.isPublished,
      p.collectName,
      p.collectEmail,
      p.collectPhone,
      p.rootNodeId,
      p.adminId,
      p.createdAt,
      p.updatedAt,
    );
  }

  isNew(): boolean {
    return this.id === '';
  }

  update(patch: {
    title?: string;
    description?: string;
    isPublished?: boolean;
  }): void {
    if (patch.title !== undefined) this._title = patch.title;
    if (patch.description !== undefined) this._description = patch.description;
    if (patch.isPublished !== undefined) this._isPublished = patch.isPublished;
    this._updatedAt = new Date();
  }
}
