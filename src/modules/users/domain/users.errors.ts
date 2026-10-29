export class UsersError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'UsersError';
  }
}

export class UserProfileNotFoundError extends UsersError {
  constructor(userId: string) {
    super(`User profile ${userId} not found`, 404, 'user_profile_not_found');
  }
}
