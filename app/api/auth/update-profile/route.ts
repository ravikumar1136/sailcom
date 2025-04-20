import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user ID from token
    const token = cookies().get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: decoded.userId
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already taken' },
        { status: 400 }
      )
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name || undefined,
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: 'Invalid authentication token' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { message: 'An error occurred while updating profile' },
      { status: 500 }
    )
  }
} 