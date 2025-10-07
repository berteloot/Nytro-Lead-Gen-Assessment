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
}

export function ResultsDashboard({
  // assessmentId,
  scores,
  summary,
  growthLevers,
  riskFlags,
  company,
  industry,
  onDownloadPDF,
  onBookAudit,
  onEmailReport,
}: ResultsDashboardProps) {
  // const [isLoading, setIsLoading] = useState(false)

  const moduleScores = [
    { key: 'inbound', score: scores.inbound },
    { key: 'outbound', score: scores.outbound },
    { key: 'content', score: scores.content },
    { key: 'paid', score: scores.paid },
    { key: 'nurture', score: scores.nurture },
    { key: 'infra', score: scores.infra },
    { key: 'attr', score: scores.attr },
  ]

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
          <CardTitle className="text-2xl text-[#313C59] text-center">Assessment Results</CardTitle>
          <div className="text-sm text-[#313C59] text-center">
            {company} {industry && `• ${industry}`}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getScoreColor(scores.overall)}`}>
              Overall Score: {scores.overall}/100
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formatScore(scores.overall)}
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

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moduleScores.map(({ key, score }) => (
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
            ))}
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
            {growthLevers.map((lever, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">
                    {index + 1}. {lever.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(lever.confidence)}`}>
                    {lever.confidence} confidence
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{lever.why}</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-green-800">
                    Expected Impact: {lever.expectedImpact}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">
                    First Step: {lever.firstStep}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Flags */}
      {riskFlags && riskFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Areas</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={onDownloadPDF}
              className="w-full"
            >
              Download PDF Report
            </Button>
            <Button
              onClick={onBookAudit}
              variant="outline"
              className="w-full"
            >
              Book Free Audit
            </Button>
            <Button
              onClick={onEmailReport}
              variant="outline"
              className="w-full"
            >
              Email Me Report
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
