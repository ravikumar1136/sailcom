import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()
    console.log('Received password update request')

    // Validate input
    if (!currentPassword || !newPassword) {
      console.log('Missing required fields')
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Get user ID from token
    const token = cookies().get('auth-token')?.value
    if (!token) {
      console.log('No auth token found')
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    console.log('Verifying token...')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    console.log('Token verified, userId:', decoded.userId)

    // Get user from database
    console.log('Finding user in database...')
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    console.log('Verifying current password...')
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      console.log('Current password is incorrect')
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    console.log('Hashing new password...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    console.log('Updating password in database...')
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    console.log('Password updated successfully')
    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password update error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: 'Invalid authentication token' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { message: 'An error occurred while updating password' },
      { status: 500 }
    )
  }
} 