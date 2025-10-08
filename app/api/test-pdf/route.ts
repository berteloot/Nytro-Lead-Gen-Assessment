import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { AssessmentPdf } from '@/lib/pdf'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Get the latest assessment for testing
    const assessment = await prisma.assessment.findFirst({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!assessment) {
      return NextResponse.json({ error: 'No assessment found' }, { status: 404 })
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

    console.log('Testing PDF generation...')
    const pdfElement = React.createElement(AssessmentPdf, { assessment: pdfData })
    const pdfDoc = await pdf(pdfElement as any)
    const pdfStream = await pdfDoc.toBuffer()
    
    // Handle the stream properly - convert to Buffer
    let pdfBuffer: Buffer;
    if (Buffer.isBuffer(pdfStream)) {
      pdfBuffer = pdfStream;
    } else {
      // If it's a stream, convert it to Buffer
      const chunks: Buffer[] = [];
      const reader = pdfStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
      }
      pdfBuffer = Buffer.concat(chunks);
    }
    
    console.log('PDF buffer size:', pdfBuffer.length)
    console.log('PDF buffer first 20 bytes:', Array.from(pdfBuffer.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '))

    // Return the PDF directly to test if it's valid
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-report.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF test error:', error)
    return NextResponse.json(
      { error: 'PDF generation failed', details: String(error) },
      { status: 500 }
    )
  }
}
