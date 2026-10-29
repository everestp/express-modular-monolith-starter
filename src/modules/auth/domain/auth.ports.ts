import type { AuthUser } from './auth-user.js';

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  save(user: AuthUser): Promise<AuthUser>;
}
