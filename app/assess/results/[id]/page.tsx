'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ResultsDashboard } from '@/components/results/results-dashboard'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { type AssessmentScores } from '@/lib/scoring'
import { z } from 'zod'

// Runtime validation schema
const AssessmentResultSchema = z.object({
  assessmentId: z.string(),
  scores: z.object({
    inbound: z.number(),
    outbound: z.number(),
    content: z.number(),
    paid: z.number(),
    nurture: z.number(),
    infra: z.number(),
    attr: z.number(),
    overall: z.number(),
    outcome: z.enum(['Foundation', 'Momentum', 'Optimization']).default('Foundation'),
    prerequisites: z.array(z.string()).default([]),
    risks: z.array(z.string()).default([]),
  }),
  summary: z.string(),
  growthLevers: z.array(z.object({
    name: z.string(),
    why: z.string(),
    expectedImpact: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
    firstStep: z.string(),
  })).default([]),
  riskFlags: z.array(z.string()).default([]),
  company: z.string(),
  industry: z.string().optional(),
  email: z.string(),
})

interface AssessmentResult {
  assessmentId: string
  scores: AssessmentScores
  summary: string
  growthLevers: Array<{
    name: string
    why: string
    expectedImpact: string
    confidence: 'low' | 'medium' | 'high'
    firstStep: string
  }>
  riskFlags: string[]
  company: string
  industry?: string
  email: string
}

export default function ResultsPage() {
  const params = useParams()
  const assessmentId = params.id as string
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [isEmailingReport, setIsEmailingReport] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/assess/results/${assessmentId}`)
        if (!response.ok) {
          throw new Error('Assessment not found')
        }
        const rawData = await response.json()
        
        // Runtime validation with zod - this will provide safe defaults
        const validatedData = AssessmentResultSchema.parse(rawData)
        setResult(validatedData)
      } catch (err) {
        console.error('Results fetch error:', err)
        if (err instanceof z.ZodError) {
          console.error('Data validation failed:', err.issues)
          setError('Invalid assessment data format')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load results')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (assessmentId) {
      fetchResults()
    }
  }, [assessmentId])

  const handleDownloadPDF = async () => {
    if (!result) return

    setIsDownloadingPDF(true)
    try {
      const response = await fetch(`/api/pdf/${result.assessmentId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leadgen-assessment-${result.assessmentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('PDF download error:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const handleBookAudit = () => {
    // Open HubSpot meeting scheduler
    window.open('https://meetings.hubspot.com/stanislas-berteloot', '_blank')
  }

  const handleEmailReport = async () => {
    if (!result) {
      console.error('No result data available for email report')
      return
    }

    console.log('Starting email report generation...', {
      assessmentId: result.assessmentId,
      email: result.email
    })

    setIsEmailingReport(true)
    try {
      const response = await fetch('/api/email/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId: result.assessmentId,
          email: result.email,
        }),
      })

      console.log('Email report response:', response.status, response.statusText)

      if (response.ok) {
        const responseData = await response.json()
        console.log('Email report success:', responseData)
        alert('Report sent successfully! Check your email for your comprehensive assessment report.')
      } else {
        const errorData = await response.json()
        console.error('Email report error:', errorData)
        if (errorData.error?.includes('not configured')) {
          alert('Email service is currently unavailable. Please use the "Download PDF Report" button instead.')
        } else {
          alert(`Failed to send email: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Email error:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setIsEmailingReport(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Your Results</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The assessment you\'re looking for doesn\'t exist or has expired.'}
          </p>
          <a 
            href="/assess" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start New Assessment
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ErrorBoundary>
        <ResultsDashboard
          assessmentId={result.assessmentId}
          scores={result.scores}
          summary={result.summary}
          growthLevers={result.growthLevers}
          riskFlags={result.riskFlags}
          company={result.company}
          industry={result.industry}
          onDownloadPDF={handleDownloadPDF}
          onBookAudit={handleBookAudit}
          onEmailReport={handleEmailReport}
          isDownloadingPDF={isDownloadingPDF}
          isEmailingReport={isEmailingReport}
        />
      </ErrorBoundary>
    </div>
  )
}
