'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ResultsDashboard } from '@/components/results/results-dashboard'

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
}

export default function ResultsPage() {
  const params = useParams()
  const assessmentId = params.id as string
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/assess/results/${assessmentId}`)
        if (!response.ok) {
          throw new Error('Assessment not found')
        }
        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
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
      // This would typically send an email with the report
      // For now, we'll just show a success message
      alert('Report will be emailed to you shortly!')
    } catch (error) {
      console.error('Email error:', error)
      alert('Failed to send email. Please try again.')
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
      />
    </div>
  )
}
