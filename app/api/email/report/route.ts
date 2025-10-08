import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sgMail from '@sendgrid/mail'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { AssessmentPdf } from '@/lib/pdf'

const prisma = new PrismaClient()

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, email } = await request.json()

    if (!assessmentId || !email) {
      return NextResponse.json(
        { error: 'Assessment ID and email are required' },
        { status: 400 }
      )
    }

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

    // Create email HTML template
    const emailHtml = createEmailTemplate(assessment.user.company || 'Unknown Company', assessment.scoreOverall)

    // Send email with PDF attachment
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'info@nytromarketing.com',
      subject: `Your Lead Generation Assessment Report - ${assessment.user.company}`,
      html: emailHtml,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `leadgen-assessment-${assessmentId}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    }

    await sgMail.send(msg)

    return NextResponse.json({ 
      success: true, 
      message: 'Report sent successfully' 
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

function createEmailTemplate(companyName: string, overallScore: number): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Lead Generation Assessment Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #F86A0E 0%, #e55a0a 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .score-highlight {
            background-color: #f0f9ff;
            border-left: 4px solid #F86A0E;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .score-number {
            font-size: 36px;
            font-weight: bold;
            color: #F86A0E;
            margin: 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #F86A0E 0%, #e55a0a 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #313C59;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .footer a {
            color: #F86A0E;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .contact-info {
            margin-top: 15px;
            font-size: 12px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NYTRO</div>
            <h1>Your Lead Generation Assessment Report</h1>
        </div>
        
        <div class="content">
            <h2>Hi ${companyName} team!</h2>
            
            <p>Thank you for completing our Lead Generation Assessment. Your comprehensive report is attached to this email, providing detailed insights into your current lead generation maturity and actionable recommendations for growth.</p>
            
            <div class="score-highlight">
                <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Overall Lead Generation Score:</p>
                <p class="score-number">${overallScore}/100</p>
                <p style="margin: 10px 0 0 0; color: #6b7280;">
                    ${overallScore >= 80 ? 'Excellent! You have a strong foundation.' : 
                      overallScore >= 60 ? 'Good progress! There are opportunities to optimize.' : 
                      'Significant opportunities for improvement identified.'}
                </p>
            </div>
            
            <p>Your report includes:</p>
            <ul>
                <li><strong>Detailed score breakdown</strong> across 7 key areas</li>
                <li><strong>Top growth opportunities</strong> with expected impact</li>
                <li><strong>Risk areas</strong> that need immediate attention</li>
                <li><strong>Actionable recommendations</strong> to improve your lead generation</li>
            </ul>
            
            <p>Ready to implement these recommendations? Let's discuss how Nytro can help accelerate your lead generation results.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://meetings.hubspot.com/stanislas-berteloot" class="cta-button">
                    Book Your Free Audit
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Questions about your report? Reply to this email or contact us at <a href="mailto:info@nytromarketing.com">info@nytromarketing.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Nytro Marketing</strong></p>
            <div class="contact-info">
                <p><a href="https://www.nytromarketing.com">www.nytromarketing.com</a></p>
                <p><a href="mailto:info@nytromarketing.com">info@nytromarketing.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
  `
}
