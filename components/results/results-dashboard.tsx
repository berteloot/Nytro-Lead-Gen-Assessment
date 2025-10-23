'use client'

// import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  getScoreColor, 
  getScoreBarColor, 
  formatScore, 
  getModuleDisplayName,
  getModuleDescription 
} from '@/lib/utils'
import { type AssessmentScores } from '@/lib/scoring'

interface Lever {
  name: string
  why: string
  expectedImpact: string
  confidence: 'low' | 'medium' | 'high'
  firstStep: string
}

interface ResultsDashboardProps {
  assessmentId: string
  scores: AssessmentScores
  summary: string
  growthLevers: Lever[]
  riskFlags: string[]
  company: string
  industry?: string
  onDownloadPDF: () => void
  onBookAudit: () => void
  onEmailReport: () => void
  isDownloadingPDF?: boolean
  isEmailingReport?: boolean
}

export function ResultsDashboard({
  // assessmentId,
  scores,
  summary,
  growthLevers = [],
  riskFlags = [],
  company,
  industry,
  onDownloadPDF,
  onBookAudit,
  onEmailReport,
  isDownloadingPDF = false,
  isEmailingReport = false,
}: ResultsDashboardProps) {
  // const [isLoading, setIsLoading] = useState(false)

  // Add debugging and error handling
  console.log('ResultsDashboard props:', {
    scores,
    summary,
    growthLevers,
    riskFlags,
    company,
    industry
  })

  // Validate required props
  if (!scores) {
    console.error('ResultsDashboard: scores prop is missing')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Loading Error</h2>
          <p className="text-gray-600">Assessment data is not available. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  const moduleScores = scores ? [
    { key: 'inbound', score: scores.inbound || 0 },
    { key: 'outbound', score: scores.outbound || 0 },
    { key: 'content', score: scores.content || 0 },
    { key: 'paid', score: scores.paid || 0 },
    { key: 'nurture', score: scores.nurture || 0 },
    { key: 'infra', score: scores.infra || 0 },
    { key: 'attr', score: scores.attr || 0 },
  ] : []

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="mb-4">
            <Image
              src="/logo_Nytro_color.png"
              alt="Nytro Marketing Logo"
              width={150}
              height={60}
              className="mx-auto mb-2"
            />
            <span className="text-sm font-semibold text-[#F86A0E] uppercase tracking-wide block text-center">Powered by Nytro Marketing</span>
          </div>
          <CardTitle className="text-2xl text-[#313C59] text-center">Your Growth Map</CardTitle>
          <div className="text-sm text-[#313C59] text-center">
            {company} {industry && `• ${industry}`}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold ${getScoreColor(scores.overall)}`}>
              Your Growth Potential: {scores.overall}/100
            </div>
            <p className="text-lg text-gray-700 mt-3 font-medium">
              {formatScore(scores.overall)} — Here&apos;s where to focus next
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      {industry && (
        <Card>
          <CardHeader>
            <CardTitle>How You Compare to {industry} Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`border-l-4 p-4 rounded-r-lg ${
              scores.overall < 20 ? 'bg-red-50 border-red-500' : 
              scores.overall < 40 ? 'bg-orange-50 border-orange-500' : 
              scores.overall < 60 ? 'bg-yellow-50 border-yellow-500' : 
              'bg-green-50 border-green-500'
            }`}>
              <p className={`font-medium ${
                scores.overall < 20 ? 'text-red-800' : 
                scores.overall < 40 ? 'text-orange-800' : 
                scores.overall < 60 ? 'text-yellow-800' : 
                'text-green-800'
              }`}>
                Your overall score of {scores.overall}/100 indicates {
                  scores.overall < 20 ? 'you\'re just getting started with lead generation' :
                  scores.overall < 40 ? 'you have some basic systems in place' :
                  scores.overall < 60 ? 'you have a solid foundation' :
                  'you have an advanced lead generation setup'
                } compared to {industry} industry standards.
              </p>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Your Strengths</h4>
                <p className="text-sm text-green-700">
                  {scores.overall < 20 ? 'You\'re taking the first step by completing this assessment' : 
                   scores.overall < 40 ? 'You have some basic systems in place' :
                   scores.paid > scores.overall ? 'Strong paid advertising capabilities' : ''}
                  {scores.nurture > scores.overall ? 'Effective lead nurturing processes' : ''}
                  {scores.attr > scores.overall ? 'Good attribution and analytics setup' : ''}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Growth Opportunities</h4>
                <p className="text-sm text-orange-700">
                  {scores.overall < 20 ? 'Focus on building foundational lead generation systems' :
                   scores.overall < 40 ? 'Strengthen your existing processes and add new channels' :
                   scores.inbound < 30 ? 'Inbound marketing could drive organic growth' : ''}
                  {scores.outbound < 30 ? 'Outbound sales can expand market reach' : ''}
                  {scores.content < 30 ? 'Content strategy needs strengthening' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Your Marketing Maturity Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moduleScores.length > 0 ? moduleScores.map(({ key, score }) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{getModuleDisplayName(key)}</h4>
                    <p className="text-sm text-gray-600">{getModuleDescription(key)}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                      {score}/100
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No scores available at this time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Growth Levers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Growth Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {growthLevers.length > 0 ? growthLevers.map((lever, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">
                    {index + 1}. {lever.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(lever.confidence)}`}>
                      {lever.confidence} confidence
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {index === 0 ? 'Start this week' : index === 1 ? 'Next 2 weeks' : 'Next month'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{lever.why}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">Expected Impact</p>
                    <p className="text-sm text-green-700">{lever.expectedImpact}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">First Step</p>
                    <p className="text-sm text-blue-700">{lever.firstStep}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No prioritized growth levers yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <Card>
        <CardHeader>
          <CardTitle>Areas to Focus On</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskFlags.map((risk, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{risk}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          {/* Primary CTA - Book Free Audit */}
          <div className="mb-6">
            <Button
              onClick={onBookAudit}
              className="w-full text-lg px-8 py-4 bg-[#F86A0E] hover:bg-[#e55a0a] text-white"
            >
              Book Free Audit
            </Button>
          </div>
          
          {/* Secondary CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={onDownloadPDF}
              variant="outline"
              className="w-full"
              disabled={isDownloadingPDF}
            >
              {isDownloadingPDF ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </span>
              ) : (
                'View My Growth Map'
              )}
            </Button>
            <Button
              onClick={onEmailReport}
              variant="outline"
              className="w-full"
              disabled={isEmailingReport}
            >
              {isEmailingReport ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Email...
                </span>
              ) : (
                'Email Me Report'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium">Review Your Results</h4>
                <p className="text-sm text-gray-600">
                  Download your detailed PDF report and share it with your team.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium">Book a Free Audit</h4>
                <p className="text-sm text-gray-600">
                  Get a 15-minute consultation to discuss your top growth opportunities.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium">Start Implementation</h4>
                <p className="text-sm text-gray-600">
                  Begin with the first step of your highest-impact lever.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
