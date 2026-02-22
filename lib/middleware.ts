import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { verifyAppToken } from './app-auth';

export async function authenticateUser(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}

export async function authenticateAppToken(request: NextRequest): Promise<{ apiKeyId: string; ownerId: string } | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAppToken(token, 'access');
  
  if (!payload || !payload.apiKeyId || !payload.ownerId) {
    return null;
  }

  return {
    apiKeyId: payload.apiKeyId,
    ownerId: payload.ownerId,
  };
}

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
