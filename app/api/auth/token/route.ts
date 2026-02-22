import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import { generateAppAccessToken, generateAppRefreshToken } from '@/lib/app-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    let apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      try {
        const body = await request.json();
        apiKey = body.apiKey;
      } catch (e) {
        // Body might be empty or invalid json
      }
    }

    if (!apiKey) {
      return createErrorResponse('API key is required. Provide it in the x-api-key header or request body.', 400);
    }

    await connectDB();
    
    const apiKeyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
    
    if (!apiKeyDoc) {
      return createErrorResponse('Invalid or inactive API key', 401);
    }

    // Update last used timestamp
    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    const payload = {
      apiKeyId: apiKeyDoc._id.toString(),
      ownerId: apiKeyDoc.userId.toString(),
    };

    const accessToken = generateAppAccessToken(payload);
    const refreshToken = generateAppRefreshToken(payload);

    return createSuccessResponse({
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
