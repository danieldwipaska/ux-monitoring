import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import connectDB from './mongodb';
import ApiKey from '@/models/ApiKey';

export async function authenticateUser(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}

export async function authenticateApiKey(request: NextRequest): Promise<{ apiKeyId: string; userId: string } | null> {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return null;
  }

  try {
    await connectDB();
    const apiKeyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
    
    if (!apiKeyDoc) {
      return null;
    }

    // Update last used timestamp
    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    return {
      apiKeyId: apiKeyDoc._id.toString(),
      userId: apiKeyDoc.userId.toString(),
    };
  } catch (error) {
    console.error('API Key authentication error:', error);
    return null;
  }
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
