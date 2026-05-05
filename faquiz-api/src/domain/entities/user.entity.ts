export type UserPersistenceProps = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerifiedAt: Date | null;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly emailVerifiedAt: Date | null,
    public readonly emailVerificationToken: string | null,
    public readonly emailVerificationExpires: Date | null,
    public readonly passwordResetToken: string | null,
    public readonly passwordResetExpires: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPersistence(p: UserPersistenceProps): User {
    return new User(
      p.id,
      p.email,
      p.passwordHash,
      p.name,
      p.emailVerifiedAt,
      p.emailVerificationToken,
      p.emailVerificationExpires,
      p.passwordResetToken,
      p.passwordResetExpires,
      p.createdAt,
      p.updatedAt,
    );
  }

  toPersistenceProps(): UserPersistenceProps {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      name: this.name,
      emailVerifiedAt: this.emailVerifiedAt,
      emailVerificationToken: this.emailVerificationToken,
      emailVerificationExpires: this.emailVerificationExpires,
      passwordResetToken: this.passwordResetToken,
      passwordResetExpires: this.passwordResetExpires,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /** Novo cadastro: e-mail ainda não verificado; tokens de verificação definidos pelo caso de uso. */
  static createPendingEmailVerification(params: {
    email: string;
    passwordHash: string;
    name: string;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
  }): User {
    const now = new Date();
    return new User(
      crypto.randomUUID(),
      params.email,
      params.passwordHash,
      params.name,
      null,
      params.emailVerificationToken,
      params.emailVerificationExpires,
      null,
      null,
      now,
      now,
    );
  }
}
