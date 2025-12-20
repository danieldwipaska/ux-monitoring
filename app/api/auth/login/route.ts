import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';
import { authRateLimiter } from '@/lib/rate-limiter';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting
    const rateLimitResult = authRateLimiter(ip);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many login attempts. Please try again later.', 429);
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return createErrorResponse('Invalid credentials', 401);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return createErrorResponse('Invalid credentials', 401);
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = createSuccessResponse({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
