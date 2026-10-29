export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type PublicUser = Pick<AuthUser, 'id' | 'email'>;
