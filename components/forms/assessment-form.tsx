'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getIndustryOptions, getCompanySizeOptions, getMaturityOptions, calculateProgress, validateEmail } from '@/lib/utils'
import { type AssessmentResponses } from '@/lib/scoring'

interface AssessmentFormProps {
  onComplete: (data: {
    email: string
    company: string
    industry: string
    companySize: string
    responses: AssessmentResponses
  }) => void
}

export function AssessmentForm({ onComplete }: AssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    industry: '',
    companySize: '',
    responses: {} as AssessmentResponses,
  })
  const [emailError, setEmailError] = useState<string>('')

  const totalSteps = 3

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // Validate email in real-time
    if (field === 'email') {
      const validation = validateEmail(value)
      setEmailError(validation.isValid ? '' : validation.error || '')
    }
  }

  const updateResponses = (module: string, lever: string, data: { present: boolean; maturity: number }) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [module]: {
          ...prev.responses[module as keyof AssessmentResponses],
          [lever]: data,
        },
      },
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onComplete(formData)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true // Lead generation questions
      case 2:
        return true // Infrastructure questions
      case 3:
        return formData.email && formData.company && formData.industry && !emailError // Email and company info at the end
      default:
        return false
    }
  }

  const progress = calculateProgress(currentStep, totalSteps)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
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
          <CardTitle className="text-[#313C59] text-center">
            Your Demand Gen Health Check
          </CardTitle>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-[#F86A0E] h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#313C59]">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              Takes under 3 minutes
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Get your personalized demand gen health check — with insights you can take to your CEO.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-green-800 font-medium">
              🎯 We&apos;re already analyzing your responses to find your top 3 growth levers!
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <LeadGenStep 
              responses={formData.responses}
              onUpdate={updateResponses}
            />
          )}

          {currentStep === 2 && (
            <InfrastructureStep 
              responses={formData.responses}
              onUpdate={updateResponses}
            />
          )}

          {currentStep === 3 && (
            <CompanyStep 
              responses={formData.responses}
              onUpdate={updateResponses}
              formData={formData}
              updateFormData={updateFormData}
              emailError={emailError}
            />
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="bg-[#F86A0E] hover:bg-[#e55a0a] text-white"
              >
                Get My Health Check
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Step components
function LeadGenStep({ 
  responses, 
  onUpdate 
}: { 
  responses: AssessmentResponses
  onUpdate: (module: string, lever: string, data: { present: boolean; maturity: number }) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">How do you currently generate leads?</h3>
        <p className="text-sm text-gray-600 mt-2">
          Check all that apply. We'll show you what you're missing.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Inbound Marketing</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="SEO & Content Marketing"
              description="Blog posts, SEO, lead magnets, webinars"
              value={responses.inbound?.seo}
              onChange={(data) => onUpdate('inbound', 'seo', data)}
            />
            <SimpleQuestion
              label="Lead Magnets"
              description="Free resources like guides, templates, tools"
              value={responses.inbound?.leadMagnets}
              onChange={(data) => onUpdate('inbound', 'leadMagnets', data)}
            />
            <SimpleQuestion
              label="Webinars & Events"
              description="Educational online events and virtual conferences"
              value={responses.inbound?.webinars}
              onChange={(data) => onUpdate('inbound', 'webinars', data)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Outbound Sales</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="Cold Email Campaigns"
              description="Automated email sequences to prospects"
              value={responses.outbound?.sequences}
              onChange={(data) => onUpdate('outbound', 'sequences', data)}
            />
            <SimpleQuestion
              label="LinkedIn Outreach"
              description="Direct messaging and connection requests"
              value={responses.outbound?.linkedin}
              onChange={(data) => onUpdate('outbound', 'linkedin', data)}
            />
            <SimpleQuestion
              label="Phone Outreach"
              description="Direct phone calls to prospects"
              value={responses.outbound?.phone}
              onChange={(data) => onUpdate('outbound', 'phone', data)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Paid Advertising</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="Google & Bing Ads"
              description="PPC campaigns on search engines"
              value={responses.paid?.ppc}
              onChange={(data) => onUpdate('paid', 'ppc', data)}
            />
            <SimpleQuestion
              label="Social Media Ads"
              description="LinkedIn, Facebook, Twitter advertising"
              value={responses.paid?.socialAds}
              onChange={(data) => onUpdate('paid', 'socialAds', data)}
            />
            <SimpleQuestion
              label="Retargeting Campaigns"
              description="Ads to website visitors who didn't convert"
              value={responses.paid?.retargeting}
              onChange={(data) => onUpdate('paid', 'retargeting', data)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfrastructureStep({ 
  responses, 
  onUpdate 
}: { 
  responses: AssessmentResponses
  onUpdate: (module: string, lever: string, data: { present: boolean; maturity: number }) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">What's your current marketing setup?</h3>
        <p className="text-sm text-gray-600 mt-2">
          Help us understand your tools and processes to give you better recommendations.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Customer Management</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="CRM System"
              description="Salesforce, HubSpot, Pipedrive, etc."
              value={responses.infra?.crm}
              onChange={(data) => onUpdate('infra', 'crm', data)}
            />
            <SimpleQuestion
              label="Lead Scoring"
              description="Automatically rank leads based on behavior and profile"
              value={responses.nurture?.scoringTriggers}
              onChange={(data) => onUpdate('nurture', 'scoringTriggers', data)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Marketing Automation</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="Email Sequences"
              description="Automated drip campaigns and nurture flows"
              value={responses.nurture?.drip}
              onChange={(data) => onUpdate('nurture', 'drip', data)}
            />
            <SimpleQuestion
              label="Lead Nurturing"
              description="Automated follow-up based on behavior and interests"
              value={responses.nurture?.intentSignals}
              onChange={(data) => onUpdate('nurture', 'intentSignals', data)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Analytics & Attribution</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="Analytics Dashboard"
              description="Google Analytics, conversion tracking, ROI measurement"
              value={responses.attr?.dashboards}
              onChange={(data) => onUpdate('attr', 'dashboards', data)}
            />
            <SimpleQuestion
              label="Multi-touch Attribution"
              description="Track all touchpoints in customer journey"
              value={responses.attr?.multiTouch}
              onChange={(data) => onUpdate('attr', 'multiTouch', data)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Data & Integration</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="Data Enrichment"
              description="Tools to enhance prospect profiles with additional info"
              value={responses.infra?.enrichment}
              onChange={(data) => onUpdate('infra', 'enrichment', data)}
            />
            <SimpleQuestion
              label="Real-time Data Sync"
              description="CRM, marketing automation, and analytics all connected"
              value={responses.infra?.realtimeSync}
              onChange={(data) => onUpdate('infra', 'realtimeSync', data)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CompanyStep({ 
  responses, 
  onUpdate,
  formData,
  updateFormData,
  emailError
}: { 
  responses: AssessmentResponses
  onUpdate: (module: string, lever: string, data: { present: boolean; maturity: number }) => void
  formData: any
  updateFormData: (field: string, value: string) => void
  emailError: string
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Almost done! Just a few quick details</h3>
        <p className="text-sm text-gray-600 mt-2">
          We'll personalize your report with this info.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Company Name</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => updateFormData('company', e.target.value)}
            placeholder="Your Company"
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Industry</label>
          <select
            value={formData.industry}
            onChange={(e) => updateFormData('industry', e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select your industry</option>
            <option value="technology">Technology</option>
            <option value="saas">SaaS</option>
            <option value="consulting">Consulting</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="healthcare">Healthcare</option>
            <option value="financial">Financial Services</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="your@company.com"
            className={`w-full p-3 border rounded-lg ${emailError ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll send your personalized report here
          </p>
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Simplified question component (no maturity scoring)
function SimpleQuestion({ 
  label, 
  description,
  value, 
  onChange 
}: { 
  label: string
  description?: string
  value?: { present: boolean; maturity: number }
  onChange: (data: { present: boolean; maturity: number }) => void 
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <label className="block font-medium">{label}</label>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value?.present || false}
            onChange={(e) => onChange({
              present: e.target.checked,
              maturity: 3 // Default to medium maturity
            })}
            className="rounded"
          />
          <span className="text-sm">We do this</span>
        </label>
      </div>
    </div>
  )
}
