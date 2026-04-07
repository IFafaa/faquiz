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
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public isPublished: boolean,
    public collectName: boolean,
    public collectEmail: boolean,
    public collectPhone: boolean,
    public rootNodeId: string | null,
    public readonly adminId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

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
    if (patch.title !== undefined) this.title = patch.title;
    if (patch.description !== undefined) this.description = patch.description;
    if (patch.isPublished !== undefined) this.isPublished = patch.isPublished;
    this.updatedAt = new Date();
  }
}
