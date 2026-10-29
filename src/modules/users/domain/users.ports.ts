import type { User } from './user.js';

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
}
