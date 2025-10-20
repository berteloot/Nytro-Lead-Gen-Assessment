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
    if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
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

    // Create follow-up email HTML template
    const emailHtml = createFollowupEmailTemplate(
      assessment.user.company || 'Unknown Company', 
      assessment.scoreOverall,
      assessment.growthLevers as Array<{
        name: string;
        why: string;
        expectedImpact: string;
        confidence: string;
        firstStep: string;
      }>
    )

    // Send follow-up email
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'info@nytromarketing.com',
      subject: `Your Growth Score Explained - ${assessment.user.company}`,
      html: emailHtml,
    }

    await sgMail.send(msg)

    return NextResponse.json({ 
      success: true, 
      message: 'Follow-up email sent successfully' 
    })

  } catch (error) {
    console.error('Follow-up email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send follow-up email' },
      { status: 500 }
    )
  }
}

function createFollowupEmailTemplate(companyName: string, overallScore: number, growthLevers: Array<{
  name: string;
  why: string;
  expectedImpact: string;
  confidence: string;
  firstStep: string;
}>): string {
  const getScoreMessage = (score: number) => {
    if (score >= 80) {
      return {
        title: "You're in the top tier!",
        message: "Your marketing foundation is strong. These opportunities will help you scale even faster."
      }
    } else if (score >= 60) {
      return {
        title: "Great foundation, ready to scale!",
        message: "You have solid fundamentals. These targeted improvements will unlock significant growth."
      }
    } else {
      return {
        title: "Huge growth potential ahead!",
        message: "You're in a great position to implement high-impact changes that will transform your lead generation."
      }
    }
  }

  const scoreData = getScoreMessage(overallScore)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Growth Score Explained</title>
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
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .score-highlight {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-left: 4px solid #F86A0E;
            padding: 25px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
            text-align: center;
        }
        .score-number {
            font-size: 48px;
            font-weight: bold;
            color: #F86A0E;
            margin: 0;
            line-height: 1;
        }
        .score-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin: 10px 0 5px 0;
        }
        .score-message {
            color: #6b7280;
            margin: 0;
        }
        .insight-section {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .insight-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .insight-icon {
            margin-right: 8px;
            font-size: 18px;
        }
        .quick-wins {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .quick-wins h3 {
            color: #166534;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .quick-win-item {
            background-color: white;
            padding: 12px;
            margin: 8px 0;
            border-radius: 6px;
            border-left: 3px solid #22c55e;
            font-size: 14px;
        }
        .quick-win-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }
        .quick-win-impact {
            color: #059669;
            font-weight: 500;
        }
        .cta-section {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #F86A0E 0%, #e55a0a 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 15px 0;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NYTRO</div>
            <h1>Your Growth Score Explained</h1>
        </div>
        
        <div class="content">
            <h2>Hi ${companyName} team!</h2>
            
            <p>Thanks for completing your Growth Map Assessment! I wanted to follow up personally to explain what your score means and how you can use it to accelerate your lead generation.</p>
            
            <div class="score-highlight">
                <p class="score-number">${overallScore}/100</p>
                <p class="score-title">${scoreData.title}</p>
                <p class="score-message">${scoreData.message}</p>
            </div>

            <div class="insight-section">
                <div class="insight-title">
                    <span class="insight-icon">💡</span>
                    What This Score Means
                </div>
                <p>Your score reflects your current lead generation maturity across 7 key areas. The beauty is that even small improvements in your lowest-scoring areas can have massive impact on your pipeline.</p>
            </div>

            <div class="quick-wins">
                <h3>🚀 Your Top 3 Quick Wins</h3>
                ${growthLevers.slice(0, 3).map((lever, index) => `
                    <div class="quick-win-item">
                        <div class="quick-win-title">${index + 1}. ${lever.name}</div>
                        <div class="quick-win-impact">${lever.expectedImpact}</div>
                    </div>
                `).join('')}
            </div>

            <p><strong>The bottom line:</strong> You're not starting from zero. You have a foundation, and these targeted improvements will compound quickly.</p>

            <div class="cta-section">
                <h3 style="margin: 0 0 15px 0;">Ready to implement these insights?</h3>
                <p style="margin: 0 0 20px 0; opacity: 0.9;">Let's discuss your specific situation and create a custom implementation plan.</p>
                <a href="https://meetings.hubspot.com/stanislas-berteloot" class="cta-button">
                    Book Your Strategy Call
                </a>
                <p style="font-size: 12px; opacity: 0.8; margin: 15px 0 0 0;">
                    Free 15-minute consultation • No pitch, just insights
                </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Questions about your score or next steps? Just reply to this email - I read every one.
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
                Best regards,<br>
                <strong>Stanislas Berteloot</strong><br>
                Founder, Nytro Marketing
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Nytro Marketing</strong></p>
            <p><a href="https://www.nytromarketing.com">www.nytromarketing.com</a> • <a href="mailto:info@nytromarketing.com">info@nytromarketing.com</a></p>
        </div>
    </div>
</body>
</html>
  `
}
