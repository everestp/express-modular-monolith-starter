import type { User } from '../domain/user.js';
import type { UsersRepository } from '../domain/users.ports.js';

export class InMemoryUsersRepository implements UsersRepository {
  private readonly users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  save(user: User): void {
    this.users.set(user.id, user);
  }
}
