'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { calculateProgress, validateEmail } from '@/lib/utils'
import { type AssessmentResponses, type LeverValue } from '@/lib/scoring'
import type { Responses, ModuleKey } from '@/types/form'

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
    calibration: {
      monthlyLeads: '',
      meetingRate: '',
      salesCycle: ''
    }
  })
  const [emailError, setEmailError] = useState<string>('')

  const totalSteps = 4

  const updateFormData = (field: string, value: string) => {
    if (field.startsWith('calibration.')) {
      const calibrationField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        calibration: {
          ...prev.calibration,
          [calibrationField]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
    
    // Validate email in real-time
    if (field === 'email') {
      const validation = validateEmail(value)
      setEmailError(validation.isValid ? '' : validation.error || '')
    }
  }

  const updateResponses = (module: ModuleKey, lever: string, data: LeverValue) => {
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
        return true // Calibration metrics
      case 4:
        return formData.email && formData.company && formData.industry && !emailError // Email and company info at the end
      default:
        return false
    }
  }

  // No longer need to check for incomplete maturity since we removed the dropdown
  const hasIncomplete = false;

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
            <CalibrationStep 
              calibration={formData.calibration}
              updateFormData={updateFormData}
            />
          )}

          {currentStep === 4 && (
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
                disabled={!isStepValid() || hasIncomplete}
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
  onUpdate: (module: ModuleKey, lever: string, data: LeverValue) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">How do you currently generate leads?</h3>
        <p className="text-sm text-gray-600 mt-2">
          Check all that apply. We&apos;ll show you what you&apos;re missing.
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
              label="Email Deliverability"
              description="Tools and processes to ensure emails reach inboxes"
              value={responses.outbound?.deliverability}
              onChange={(data) => onUpdate('outbound', 'deliverability', data)}
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
          <h4 className="font-medium mb-3">Content Marketing</h4>
          <div className="space-y-3">
            <SimpleQuestion
              label="Blog & SEO Content"
              description="Regular blog posts optimized for search"
              value={responses.content?.blog}
              onChange={(data) => onUpdate('content', 'blog', data)}
            />
            <SimpleQuestion
              label="Case Studies & Success Stories"
              description="Customer success stories and ROI proof"
              value={responses.content?.caseStudies}
              onChange={(data) => onUpdate('content', 'caseStudies', data)}
            />
            <SimpleQuestion
              label="Sales Enablement Content"
              description="One-pagers, decks, comparison guides"
              value={responses.content?.boFuAssets}
              onChange={(data) => onUpdate('content', 'boFuAssets', data)}
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
              label="LinkedIn Lead Generation"
              description="LinkedIn Sponsored Content and Lead Gen Forms"
              value={responses.paid?.linkedinLeadGen}
              onChange={(data) => onUpdate('paid', 'linkedinLeadGen', data)}
            />
            <SimpleQuestion
              label="Social Media Ads"
              description="Facebook, Twitter, Instagram advertising"
              value={responses.paid?.socialAds}
              onChange={(data) => onUpdate('paid', 'socialAds', data)}
            />
            <SimpleQuestion
              label="Retargeting Campaigns"
              description="Ads to website visitors who didn't convert"
              value={responses.paid?.retargeting}
              onChange={(data) => onUpdate('paid', 'retargeting', data)}
            />
            <SimpleQuestion
              label="Account-Based Marketing"
              description="Targeted campaigns to specific accounts"
              value={responses.paid?.abm}
              onChange={(data) => onUpdate('paid', 'abm', data)}
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
  onUpdate: (module: ModuleKey, lever: string, data: LeverValue) => void 
}) {
  // Suppress unused parameter warnings for interface compliance
  void responses;
  void onUpdate;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">What&apos;s your current marketing setup?</h3>
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
              label="Marketing Automation"
              description="HubSpot, Marketo, Pardot, etc."
              value={responses.infra?.marketingAutomation}
              onChange={(data) => onUpdate('infra', 'marketingAutomation', data)}
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
              label="Lead Scoring"
              description="Automatically rank leads based on behavior and profile"
              value={responses.nurture?.scoringTriggers}
              onChange={(data) => onUpdate('nurture', 'scoringTriggers', data)}
            />
            <SimpleQuestion
              label="Intent Signals"
              description="Track website behavior and buying signals"
              value={responses.nurture?.intentSignals}
              onChange={(data) => onUpdate('nurture', 'intentSignals', data)}
            />
            <SimpleQuestion
              label="Lead Reactivation"
              description="Re-engage cold leads with targeted campaigns"
              value={responses.nurture?.reactivation}
              onChange={(data) => onUpdate('nurture', 'reactivation', data)}
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
            <SimpleQuestion
              label="CTA Tracking"
              description="Track which CTAs and content drive conversions"
              value={responses.attr?.ctaTracking}
              onChange={(data) => onUpdate('attr', 'ctaTracking', data)}
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

function CalibrationStep({ 
  calibration,
  updateFormData
}: { 
  calibration: {
    monthlyLeads: string;
    meetingRate: string;
    salesCycle: string;
  }
  updateFormData: (field: string, value: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Help us calibrate your current performance</h3>
        <p className="text-sm text-gray-600 mt-2">
          These metrics help us provide more accurate recommendations tailored to your situation.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Monthly Inbound Leads (last 90 days)</label>
          <select
            value={calibration.monthlyLeads}
            onChange={(e) => updateFormData('calibration.monthlyLeads', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select range</option>
            <option value="0-10">0-10 leads</option>
            <option value="11-25">11-25 leads</option>
            <option value="26-50">26-50 leads</option>
            <option value="51-100">51-100 leads</option>
            <option value="100+">100+ leads</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Meeting Rate (last 90 days)</label>
          <select
            value={calibration.meetingRate}
            onChange={(e) => updateFormData('calibration.meetingRate', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select rate</option>
            <option value="<10">Less than 10%</option>
            <option value="10-25">10-25%</option>
            <option value="25-40">25-40%</option>
            <option value="40+">40%+</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Typical Sales Cycle Length</label>
          <select
            value={calibration.salesCycle}
            onChange={(e) => updateFormData('calibration.salesCycle', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select cycle length</option>
            <option value="<30">Less than 30 days</option>
            <option value="30-90">30-90 days</option>
            <option value="90-180">90-180 days</option>
            <option value="180+">180+ days</option>
          </select>
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
  onUpdate: (module: ModuleKey, lever: string, data: LeverValue) => void
  formData: {
    email: string;
    company: string;
    industry: string;
    companySize: string;
    responses: AssessmentResponses;
  }
  updateFormData: (field: string, value: string) => void
  emailError: string
}) {
  // Suppress unused parameter warnings for interface compliance
  void responses;
  void onUpdate;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Almost done! Just a few quick details</h3>
        <p className="text-sm text-gray-600 mt-2">
          We&apos;ll personalize your report with this info.
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
            We&apos;ll send your personalized report here
          </p>
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SimpleQuestion({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value?: LeverValue;
  onChange: (data: LeverValue) => void;
}) {
  const handlePresentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const present = e.target.checked;
    onChange({ present, applicable: value?.applicable ?? true });
  };


  return (
    <div className="space-y-2">
      <label className="font-medium">{label}</label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!value?.present}
          onChange={handlePresentChange}
          className="rounded"
        />
        <span className="text-sm">We do this</span>

      </div>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={value?.applicable === false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value!, applicable: !e.target.checked, present: false })}
        />
        <span className="text-sm">Not applicable to us</span>
      </label>
    </div>
  );
}
