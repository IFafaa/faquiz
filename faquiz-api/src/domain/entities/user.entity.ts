export type UserPersistenceProps = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPersistence(p: UserPersistenceProps): User {
    return new User(
      p.id,
      p.email,
      p.passwordHash,
      p.name,
      p.createdAt,
      p.updatedAt,
    );
  }

  static createNew(params: {
    email: string;
    passwordHash: string;
    name: string;
  }): User {
    const now = new Date();
    return new User(
      crypto.randomUUID(),
      params.email,
      params.passwordHash,
      params.name,
      now,
      now,
    );
  }
}
