import { SignJWT, jwtVerify } from 'jose';

export type AccessTokenPayload = {
  userId: string;
  email?: string;
  sub?: string;
};

export async function createAccessToken(input: {
  userId: string;
  email?: string;
  secret: string;
  issuer: string;
  audience: string;
  ttlMs: number;
}) {
  return new SignJWT({ userId: input.userId, email: input.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(input.userId)
    .setIssuer(input.issuer)
    .setAudience(input.audience)
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + input.ttlMs) / 1000))
    .sign(new TextEncoder().encode(input.secret));
}

export async function verifyAccessToken(
  token: string,
  secret: string,
  issuer: string,
  audience: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    issuer,
    audience,
  });

  return {
    userId: String(payload.userId ?? payload.sub ?? ''),
    email: typeof payload.email === 'string' ? payload.email : undefined,
    sub: typeof payload.sub === 'string' ? payload.sub : undefined,
  };
}
