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
      growthLevers: assessment.growthLevers as Array<{
        name: string;
        why: string;
        expectedImpact: string;
        confidence: 'low' | 'medium' | 'high';
        firstStep: string;
      }>,
      riskFlags: assessment.riskFlags as string[],
      company: assessment.user.company || 'Unknown Company',
      industry: assessment.industry,
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
