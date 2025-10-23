import { NextResponse } from 'next/server'

export async function GET() {
  // This endpoint helps debug email configuration in production
  // It only shows whether variables exist, not their values (for security)
  
  const config = {
    environment: process.env.NODE_ENV,
    sendgridConfigured: !!process.env.SENDGRID_API_KEY,
    fromEmailConfigured: !!process.env.FROM_EMAIL,
    sendgridKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
    fromEmail: process.env.FROM_EMAIL ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  }

  console.log('Email configuration check:', config)

  return NextResponse.json(config)
}
