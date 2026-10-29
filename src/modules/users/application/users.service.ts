import type { User } from '../domain/user.js';
import { UserProfileNotFoundError } from '../domain/users.errors.js';
import type { UsersRepository } from '../domain/users.ports.js';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfileById(userId: string): Promise<User> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserProfileNotFoundError(userId);
    }

    return user;
  }
}
