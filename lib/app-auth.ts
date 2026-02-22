import jwt from 'jsonwebtoken';

const APP_JWT_SECRET = process.env.APP_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AppJWTPayload {
  apiKeyId: string;
  ownerId: string;
  type: 'access' | 'refresh';
}

export function generateAppAccessToken(payload: Omit<AppJWTPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, APP_JWT_SECRET, { expiresIn: '15m' });
}

export function generateAppRefreshToken(payload: Omit<AppJWTPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, APP_JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAppToken(token: string, expectedType?: 'access' | 'refresh'): AppJWTPayload | null {
  try {
    const decoded = jwt.verify(token, APP_JWT_SECRET) as AppJWTPayload;
    if (expectedType && decoded.type !== expectedType) {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}
