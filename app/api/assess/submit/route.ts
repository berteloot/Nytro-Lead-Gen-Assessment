import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { validateEmail } from '@/lib/utils'

const prisma = new PrismaClient()

const submitSchema = z.object({
  email: z.string().email(),
  company: z.string().min(1),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  responses: z.record(z.string(), z.any()),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = submitSchema.parse(body)

    // Additional email validation to prevent generic emails
    const emailValidation = validateEmail(validatedData.email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error || 'Invalid email address' },
        { status: 400 }
      )
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: validatedData.email },
      update: {
        company: validatedData.company,
      },
      create: {
        email: validatedData.email,
        company: validatedData.company,
      },
    })

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        industry: validatedData.industry,
        companySize: validatedData.companySize,
        responses: validatedData.responses,
        growthLevers: [],
        riskFlags: [],
      },
    })

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      userId: user.id,
    })
  } catch (error) {
    console.error('Assessment submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
