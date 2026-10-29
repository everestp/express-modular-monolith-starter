export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`User already exists for ${email}`, 409, 'user_already_exists');
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials', 401, 'invalid_credentials');
  }
}

export class UserNotFoundError extends AuthError {
  constructor(userId: string) {
    super(`User ${userId} not found`, 404, 'user_not_found');
  }
}
