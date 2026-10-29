import type { UsersRepository } from './domain/users.ports.js';
import { UsersService } from './application/users.service.js';
import { InMemoryUsersRepository } from './infrastructure/users.repository.js';
import { createUsersRouter } from './http/users.router.js';

export type UsersModuleConfig = {
  secret: string;
  issuer: string;
  audience: string;
};

export function createUsersModule(
  config: UsersModuleConfig,
  repository: UsersRepository = new InMemoryUsersRepository(),
) {
  const service = new UsersService(repository);
  return createUsersRouter(service, config);
}

export type { User } from './domain/user.js';
export { InMemoryUsersRepository } from './infrastructure/users.repository.js';
