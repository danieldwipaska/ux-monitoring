import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import { authenticateUser, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// DELETE an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    await connectDB();
    
    const apiKey = await ApiKey.findOne({ _id: id, userId: auth.userId });
    
    if (!apiKey) {
      return createErrorResponse('API key not found', 404);
    }

    await ApiKey.deleteOne({ _id: id });

    return createSuccessResponse({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PATCH toggle API key active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const { isActive } = await request.json();

    await connectDB();
    
    const apiKey = await ApiKey.findOne({ _id: id, userId: auth.userId });
    
    if (!apiKey) {
      return createErrorResponse('API key not found', 404);
    }

    apiKey.isActive = isActive;
    await apiKey.save();

    return createSuccessResponse({
      message: 'API key updated successfully',
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        isActive: apiKey.isActive,
      },
    });
  } catch (error) {
    console.error('Update API key error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
