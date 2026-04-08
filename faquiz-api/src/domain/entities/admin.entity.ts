export type AdminPersistenceProps = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Admin {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPersistence(p: AdminPersistenceProps): Admin {
    return new Admin(
      p.id,
      p.email,
      p.passwordHash,
      p.name,
      p.createdAt,
      p.updatedAt,
    );
  }
}
