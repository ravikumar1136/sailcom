import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export interface UserData {
  id: number;
  name: string;
  email: string;
}

// Generate JWT token
export function generateToken(user: UserData): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): UserData | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserData;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Middleware to verify authentication
export async function isAuthenticated(
  req: NextRequest
): Promise<{ authenticated: boolean; user?: UserData }> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false };
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    return { authenticated: false };
  }

  return { authenticated: true, user };
}
