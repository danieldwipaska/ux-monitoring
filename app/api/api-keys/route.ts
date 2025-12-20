import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import { generateApiKey } from '@/lib/auth';
import { authenticateUser, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const apiKeys = await ApiKey.find({ userId: auth.userId })
      .select('-__v')
      .sort({ createdAt: -1 });

    return createSuccessResponse({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST create a new API key
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { name } = await request.json();

    if (!name) {
      return createErrorResponse('API key name is required', 400);
    }

    await connectDB();
    
    const key = generateApiKey();
    
    const apiKey = await ApiKey.create({
      name,
      key,
      userId: auth.userId,
      isActive: true,
    });

    return createSuccessResponse({
      message: 'API key created successfully',
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
    }, 201);
  } catch (error) {
    console.error('Create API key error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
