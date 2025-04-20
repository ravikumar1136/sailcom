import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Signup request received');
    const { name, email, password } = await request.json();
    console.log('Signup data:', { name, email, passwordLength: password?.length });

    // Validate input
    if (!name || !email || !password) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if password is strong enough
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Generate a mock user ID
    const mockUserId = Math.floor(Math.random() * 1000000);

    // Create a mock user object
    const user = {
      id: mockUserId,
      name,
      email
    };

    // Generate JWT token
    const token = generateToken(user);

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to register user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
