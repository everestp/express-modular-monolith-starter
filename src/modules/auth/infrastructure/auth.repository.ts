import type { AuthUser } from '../domain/auth-user.js';
import type { AuthUserRepository } from '../domain/auth.ports.js';

export class InMemoryAuthRepository implements AuthUserRepository {
  private readonly users = new Map<string, AuthUser>();

  async findByEmail(email: string): Promise<AuthUser | null> {
    const normalized = email.trim().toLowerCase();
    return this.users.get(normalized) ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    for (const user of this.users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }

  async save(user: AuthUser): Promise<AuthUser> {
    this.users.set(user.email.trim().toLowerCase(), user);
    return user;
  }

  list(): AuthUser[] {
    return Array.from(this.users.values());
  }
}
