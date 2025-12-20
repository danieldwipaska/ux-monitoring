import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateUser, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();
    const user = await User.findById(auth.userId).select('-password');

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
