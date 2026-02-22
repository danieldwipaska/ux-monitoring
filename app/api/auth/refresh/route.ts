import { NextRequest } from 'next/server';
import { generateAppAccessToken, verifyAppToken } from '@/lib/app-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return createErrorResponse('Refresh token is required', 400);
    }

    const payload = verifyAppToken(refreshToken, 'refresh');

    if (!payload) {
      return createErrorResponse('Invalid or expired refresh token', 401);
    }

    const accessToken = generateAppAccessToken({
      apiKeyId: payload.apiKeyId,
      ownerId: payload.ownerId,
    });

    return createSuccessResponse({
      accessToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
