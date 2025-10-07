import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { AssessmentPdf } from '@/lib/pdf'
import { pdf } from '@react-pdf/renderer'

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

    // Prepare data for PDF
    const pdfData = {
      user: {
        company: assessment.user.company || 'Unknown Company',
        email: assessment.user.email,
      },
      industry: assessment.industry || undefined,
      scoreInbound: assessment.scoreInbound,
      scoreOutbound: assessment.scoreOutbound,
      scoreContent: assessment.scoreContent,
      scorePaid: assessment.scorePaid,
      scoreNurture: assessment.scoreNurture,
      scoreInfra: assessment.scoreInfra,
      scoreAttribution: assessment.scoreAttribution,
      scoreOverall: assessment.scoreOverall,
      growthLevers: assessment.growthLevers as Array<{
        name: string;
        why: string;
        expectedImpact: string;
        confidence: string;
        firstStep: string;
      }>,
      riskFlags: assessment.riskFlags as string[],
      createdAt: assessment.createdAt.toISOString(),
    }

    // Generate PDF
    const pdfElement = React.createElement(AssessmentPdf, { assessment: pdfData })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = await pdf(pdfElement as any)
    const pdfBuffer = await pdfDoc.toBuffer()

    // Update assessment with PDF URL (optional - could be stored in cloud storage)
    const pdfUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/pdf/${assessmentId}`
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { pdfUrl },
    })

    // Return PDF using the stream directly
    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="leadgen-assessment-${assessmentId}.pdf"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
