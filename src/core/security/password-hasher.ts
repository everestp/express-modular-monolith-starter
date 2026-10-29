import argon2 from 'argon2';

export const passwordHasher = {
  hash: async (password: string) => argon2.hash(password),
  verify: async (hash: string, password: string) => argon2.verify(hash, password),
};
