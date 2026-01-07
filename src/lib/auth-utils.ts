// src/lib/auth-utils.ts
import { jwtVerify, SignJWT } from 'jose';
import type { Role } from '@/config/permissions';

export type TokenPayload = {
  sub: string; // user ID
  email: string;
  roles: Role[];
  iat?: number;
  exp?: number;
};

/**
 * Verify JWT token and extract user info
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const { payload } = await jwtVerify(token, secret);

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      roles: (payload.roles as Role[]) || [],
      iat: payload.iat,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Create JWT token (for reference, actual token creation should be on backend)
 */
export async function createToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>
): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(secret);

  return token;
}

/**
 * Decode token without verification (use carefully)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
