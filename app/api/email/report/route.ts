import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sgMail from '@sendgrid/mail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Check if SendGrid is configured
    console.log('=== Email Report Configuration Check ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('SendGrid API Key exists:', !!process.env.SENDGRID_API_KEY);
    console.log('SendGrid API Key length:', process.env.SENDGRID_API_KEY?.length || 0);
    console.log('From Email:', process.env.FROM_EMAIL);
    console.log('Assessment ID:', assessmentId);
    console.log('Email:', email);
    
    // Check for missing environment variables
    const missingVars = [];
    if (!process.env.SENDGRID_API_KEY) {
      missingVars.push('SENDGRID_API_KEY');
    }
    if (!process.env.FROM_EMAIL) {
      missingVars.push('FROM_EMAIL');
    }
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      console.error('Please configure these variables in your Render dashboard:');
      missingVars.forEach(varName => {
        console.error(`- ${varName}`);
      });
      
      return NextResponse.json(
        { 
          error: 'Email service is not configured. Missing environment variables.',
          missing: missingVars,
          instructions: 'Please configure SENDGRID_API_KEY and FROM_EMAIL in your Render dashboard.'
        },
        { status: 500 }
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

    // Prepare data for email template
    const assessmentData: AssessmentData = {
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

    // Create comprehensive email HTML template with full report
    const emailHtml = createFullReportEmailTemplate(assessment.user.company || 'Unknown Company', assessment.scoreOverall, assessmentData)

    // Send comprehensive HTML email report
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'info@nytromarketing.com',
      subject: `Your Lead Generation Assessment Report - ${assessment.user.company}`,
      html: emailHtml,
    }

    console.log('Sending comprehensive HTML email report...');
    console.log('Email message:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      htmlLength: msg.html?.length
    });

    try {
      await sgMail.send(msg)
      console.log('Email sent successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Report sent successfully' 
      })
    } catch (sendGridError: unknown) {
      console.error('SendGrid API error:', sendGridError);
      const errorMessage = sendGridError instanceof Error ? sendGridError.message : 'Unknown error'
      const errorCode = (sendGridError as { code?: string })?.code || 'unknown'
      const errorResponse = (sendGridError as { response?: { body?: unknown } })?.response?.body || null
      
      console.error('SendGrid error details:', {
        message: errorMessage,
        code: errorCode,
        response: errorResponse
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to send email via SendGrid',
          details: errorMessage,
          code: errorCode
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email sending error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Check if it's a SendGrid specific error
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as { response?: { body?: unknown } };
      console.error('SendGrid error response:', sgError.response?.body);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

interface AssessmentData {
  user: {
    company: string;
    email: string;
  };
  industry?: string;
  scoreInbound: number;
  scoreOutbound: number;
  scoreContent: number;
  scorePaid: number;
  scoreNurture: number;
  scoreInfra: number;
  scoreAttribution: number;
  scoreOverall: number;
  growthLevers: Array<{
    name: string;
    why: string;
    expectedImpact: string;
    confidence: string;
    firstStep: string;
  }>;
  riskFlags: string[];
  createdAt: string;
}

function createFullReportEmailTemplate(companyName: string, overallScore: number, assessmentData: AssessmentData): string {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'; // green
    if (score >= 60) return '#d97706'; // orange
    return '#dc2626'; // red
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent! You have a strong foundation.';
    if (score >= 60) return 'Good progress! There are opportunities to optimize.';
    return 'Significant opportunities for improvement identified.';
  };

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
            max-width: 700px;
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
        .section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #F86A0E;
            padding-bottom: 5px;
        }
        .score-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 8px 0;
        }
        .score-bar {
            width: 150px;
            height: 8px;
            background-color: #e5e7eb;
            border-radius: 4px;
            margin-left: 15px;
        }
        .score-fill {
            height: 8px;
            border-radius: 4px;
        }
        .lever-item {
            background-color: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 3px solid #F86A0E;
        }
        .lever-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .lever-description {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .lever-impact {
            font-size: 14px;
            font-weight: 500;
            color: #059669;
        }
        .risk-item {
            font-size: 14px;
            color: #dc2626;
            margin: 5px 0;
            padding-left: 15px;
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
            
            <p>Thank you for completing our Lead Generation Assessment. Your comprehensive report is below, providing detailed insights into your current lead generation maturity and actionable recommendations for growth.</p>
            
            <div class="score-highlight">
                <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Overall Lead Generation Score:</p>
                <p class="score-number">${overallScore}/100</p>
                <p style="margin: 10px 0 0 0; color: #6b7280;">${getScoreText(overallScore)}</p>
            </div>

            <!-- Score Breakdown -->
            <div class="section">
                <div class="section-title">Score Breakdown</div>
                <div class="score-row">
                    <span>Inbound Marketing</span>
                    <span>${assessmentData.scoreInbound}/100</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.scoreInbound}%; background-color: ${getScoreColor(assessmentData.scoreInbound)};"></div>
                    </div>
                </div>
                <div class="score-row">
                    <span>Outbound Sales</span>
                    <span>${assessmentData.scoreOutbound}/100</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.scoreOutbound}%; background-color: ${getScoreColor(assessmentData.scoreOutbound)};"></div>
                    </div>
                </div>
                <div class="score-row">
                    <span>Content Marketing</span>
                    <span>${assessmentData.scoreContent}/100</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.scoreContent}%; background-color: ${getScoreColor(assessmentData.scoreContent)};"></div>
                    </div>
                </div>
                <div class="score-row">
                    <span>Paid Advertising</span>
                    <span>${assessmentData.scorePaid}/100</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.scorePaid}%; background-color: ${getScoreColor(assessmentData.scorePaid)};"></div>
                    </div>
                </div>
                <div class="score-row">
                    <span>Lead Nurturing</span>
                    <span>${assessmentData.scoreNurture}/100</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.scoreNurture}%; background-color: ${getScoreColor(assessmentData.scoreNurture)};"></div>
                    </div>
                </div>
                <div class="score-row">
                    <span>Marketing Infrastructure</span>
                    <span>${assessmentData.scoreInfra}/100</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.scoreInfra}%; background-color: ${getScoreColor(assessmentData.scoreInfra)};"></div>
                    </div>
                </div>
                <div class="score-row">
                    <span>Attribution & Analytics</span>
                    <span>${assessmentData.scoreAttribution}/100</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.scoreAttribution}%; background-color: ${getScoreColor(assessmentData.scoreAttribution)};"></div>
                    </div>
                </div>
            </div>

            <!-- Growth Opportunities -->
            <div class="section">
                <div class="section-title">Top Growth Opportunities</div>
                ${assessmentData.growthLevers.map((lever, index: number) => `
                    <div class="lever-item">
                        <div class="lever-title">${index + 1}. ${lever.name}</div>
                        <div class="lever-description">${lever.why}</div>
                        <div class="lever-impact">Expected Impact: ${lever.expectedImpact} (Confidence: ${lever.confidence})</div>
                    </div>
                `).join('')}
            </div>

            <!-- Risk Areas -->
            ${assessmentData.riskFlags && assessmentData.riskFlags.length > 0 ? `
            <div class="section">
                <div class="section-title">Risk Areas</div>
                ${assessmentData.riskFlags.map((risk: string) => `
                    <div class="risk-item">• ${risk}</div>
                `).join('')}
            </div>
            ` : ''}
            
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
