import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params

    // Get assessment with user data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { user: true },
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Ensure arrays are always returned, never null/undefined
    const growthLevers = Array.isArray(assessment.growthLevers) ? assessment.growthLevers : []
    const riskFlags = Array.isArray(assessment.riskFlags) ? assessment.riskFlags : []

    // Return assessment data
    return NextResponse.json({
      assessmentId: assessment.id,
      scores: {
        inbound: assessment.scoreInbound,
        outbound: assessment.scoreOutbound,
        content: assessment.scoreContent,
        paid: assessment.scorePaid,
        nurture: assessment.scoreNurture,
        infra: assessment.scoreInfra,
        attr: assessment.scoreAttribution,
        overall: assessment.scoreOverall,
      },
      summary: 'Your lead generation assessment has been completed. Review your scores and recommendations below.',
      growthLevers,
      riskFlags,
      company: assessment.user.company || 'Unknown Company',
      industry: assessment.industry,
      email: assessment.user.email,
      createdAt: assessment.createdAt,
    })
  } catch (error) {
    console.error('Results fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
