import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // For demonstration, accept any valid email/password combination
    // In a real application, you would verify against a database
    const mockUser = {
      id: Math.floor(Math.random() * 1000000),
      name: email.split('@')[0], // Use part of email as name
      email: email
    };

    // Generate JWT token
    const token = generateToken(mockUser);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      },
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Failed to login', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
