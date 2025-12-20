import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return createErrorResponse('Email, password, and name are required', 400);
    }

    if (password.length < 6) {
      return createErrorResponse('Password must be at least 6 characters', 400);
    }

    await connectDB();
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return createErrorResponse('User already exists', 400);
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = createSuccessResponse({
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    }, 201);

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
