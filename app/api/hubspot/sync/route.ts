import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { HubSpotService } from '@/lib/hubspot'

const prisma = new PrismaClient()

const syncSchema = z.object({
  assessmentId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // Check if HubSpot is configured
    if (!process.env.HUBSPOT_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'HubSpot integration not configured' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { assessmentId } = syncSchema.parse(body)

    // Get assessment with user data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { user: true },
    })

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Initialize HubSpot service
    const hubspot = new HubSpotService(process.env.HUBSPOT_API_KEY)

    // Prepare data for HubSpot sync
    const growthLevers = assessment.growthLevers as Array<{
      name: string;
      expectedImpact: string;
    }>

    const syncData = {
      email: assessment.user.email,
      company: assessment.user.company || undefined,
      industry: assessment.industry || undefined,
      companySize: assessment.companySize || undefined,
      overallScore: assessment.scoreOverall,
      topLevers: growthLevers,
      riskFlags: assessment.riskFlags as string[],
      pdfUrl: assessment.pdfUrl || undefined,
    }

    // Sync to HubSpot
    const result = await hubspot.syncAssessmentToHubSpot(syncData)

    return NextResponse.json({
      success: true,
      hubspot: {
        contactId: result.contactId,
        engagementId: result.engagementId,
        dealId: result.dealId,
      },
    })
  } catch (error) {
    console.error('HubSpot sync error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to sync to HubSpot' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
