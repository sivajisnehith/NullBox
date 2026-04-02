import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

type RegisterBody = {
  username?: string
  email?: string
  registrationNumber?: string
  password?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody
    const username = body.username?.trim()
    const email = body.email?.trim().toLowerCase()
    const registrationNumber = body.registrationNumber?.trim()
    const password = body.password

    if (!username || !email || !registrationNumber || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username,
        email,
        registrationNumber,
        password: hashedPassword,
        role: 'user'
      }
    })

    return NextResponse.json(
      { success: true, message: 'Registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
