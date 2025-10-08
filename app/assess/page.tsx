'use client'

import { useState } from 'react'
// import { useRouter } from 'next/navigation'
import { AssessmentForm } from '@/components/forms/assessment-form'
import { ResultsDashboard } from '@/components/results/results-dashboard'
import { type AssessmentResponses } from '@/lib/scoring'

interface AssessmentData {
  email: string
  company: string
  industry?: string
  companySize?: string
  responses: AssessmentResponses
}

interface AssessmentResult {
  assessmentId: string
  scores: {
    inbound: number
    outbound: number
    content: number
    paid: number
    nurture: number
    infra: number
    attr: number
    overall: number
  }
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

export default function AssessPage() {
  // const router = useRouter()
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form')
  const [result, setResult] = useState<AssessmentResult | null>(null)
  // const [isLoading, setIsLoading] = useState(false)

  const handleFormComplete = async (data: AssessmentData) => {
    // setIsLoading(true)
    setStep('loading')

    try {
      // Submit assessment
      const submitResponse = await fetch('/api/assess/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!submitResponse.ok) {
        throw new Error('Failed to submit assessment')
      }

      const { assessmentId } = await submitResponse.json()

      // Score assessment
      const scoreResponse = await fetch('/api/assess/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          assessmentId,
          company: data.company,
          industry: data.industry,
          responses: data.responses
        }),
      })

      if (!scoreResponse.ok) {
        const errText = await scoreResponse.text()
        console.error('Score API error:', errText)
        throw new Error('Failed to score assessment')
      }

      const assessmentResult = await scoreResponse.json()

      // Create HubSpot contact with assessment results
      try {
        await fetch('/api/hubspot/create-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            firstname: data.email.split('@')[0], // Use email prefix as first name if no name provided
            lastname: '', // Could be enhanced to extract from email or add name fields
            company: data.company,
            industry: data.industry,
            companySize: data.companySize,
            assessmentResults: {
              scores: assessmentResult.scores,
              summary: assessmentResult.recommendation.summary,
              growthLevers: assessmentResult.recommendation.levers,
              riskFlags: assessmentResult.recommendation.risks,
            }
          }),
        });
      } catch (hubspotError) {
        console.error('HubSpot contact creation failed:', hubspotError);
        // Don't fail the entire flow if HubSpot fails
      }
      setResult({
        assessmentId: assessmentId,
        scores: assessmentResult.scores,
        summary: assessmentResult.recommendation.summary,
        growthLevers: assessmentResult.recommendation.levers,
        riskFlags: assessmentResult.recommendation.risks,
        company: data.company,
        industry: data.industry,
        email: data.email
      })
      setStep('results')
    } catch (error) {
      console.error('Assessment error:', error)
      alert('Something went wrong. Please try again.')
      setStep('form')
    } finally {
      // setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!result) return

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
    }
  }

  const handleBookAudit = () => {
    // Open HubSpot meeting scheduler
    window.open('https://meetings.hubspot.com/stanislas-berteloot', '_blank')
  }

  const handleEmailReport = async () => {
    if (!result) return

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

      if (response.ok) {
        alert('Report sent successfully! Check your email for the PDF attachment.')
      } else {
        const errorData = await response.json()
        if (errorData.error?.includes('not configured')) {
          alert('Email service is currently unavailable. Please use the "Download PDF Report" button instead.')
        } else {
          alert(`Failed to send email: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Email error:', error)
      alert('Failed to send email. Please try again.')
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Analyzing Your Assessment</h2>
          <p className="text-gray-600">This may take a few moments...</p>
        </div>
      </div>
    )
  }

  if (step === 'results' && result) {
    return (
      <ResultsDashboard
        assessmentId={result.assessmentId}
        scores={result.scores}
        summary={result.summary}
        growthLevers={result.growthLevers}
        riskFlags={result.riskFlags}
        company={result.company || 'Your Company'}
        industry={result.industry}
        onDownloadPDF={handleDownloadPDF}
        onBookAudit={handleBookAudit}
        onEmailReport={handleEmailReport}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AssessmentForm onComplete={handleFormComplete} />
    </div>
  )
}
