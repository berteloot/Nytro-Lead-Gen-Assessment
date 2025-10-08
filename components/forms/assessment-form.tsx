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

  const totalSteps = 7

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
        return true // Assessment questions
      case 2:
        return true // Assessment questions
      case 3:
        return true // Assessment questions
      case 4:
        return true // Assessment questions
      case 5:
        return formData.industry && formData.companySize // Company Details - Industry and Company Size required
      case 6:
        return true // Assessment questions
      case 7:
        return formData.email && formData.company && !emailError // Email and company at the end
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
            Lead Generation Assessment &amp; Opportunity Map
          </CardTitle>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#F86A0E] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps} — aim for 90 seconds. Select what you actually run; we’ll score maturity and surface the top 3 levers.
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <InboundOutboundStep 
              responses={formData.responses}
              onUpdate={updateResponses}
            />
          )}

          {currentStep === 2 && (
            <EventsStep 
              responses={formData.responses}
              onUpdate={updateResponses}
            />
          )}

          {currentStep === 3 && (
            <ContentPaidStep 
              responses={formData.responses}
              onUpdate={updateResponses}
            />
          )}

          {currentStep === 4 && (
            <NurtureInfraStep 
              responses={formData.responses}
              onUpdate={updateResponses}
            />
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Details</h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                >
                  <option value="">Select your industry</option>
                  {getIndustryOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Size <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.companySize}
                  onChange={(e) => updateFormData('companySize', e.target.value)}
                >
                  <option value="">Select company size</option>
                  {getCompanySizeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">🎯 Almost done!</h3>
                <p className="text-gray-600 text-lg">Get your personalized assessment report delivered instantly</p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>We'll email your detailed report</strong> with personalized recommendations, growth opportunities, and actionable insights to help you improve your lead generation.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  📧 Your Work Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="name@yourcompany.com"
                  required
                  className={emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  💡 Please use your work email to receive your comprehensive assessment report
                </p>
                {emailError && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {emailError}
                  </div>
                )}
                {formData.email && !emailError && (
                  <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                    <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Perfect! We'll send your report here
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  🏢 Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Your Company Name"
                  required
                  className="border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  We'll personalize your report with your company name
                </p>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ready to see your results?</h3>
              <p className="text-gray-600">Click below to complete your assessment and receive your personalized lead generation report.</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong> We&apos;ll analyze your responses and generate a comprehensive report with scores, recommendations, and actionable next steps for improving your lead generation.
                </p>
              </div>
            </div>
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
                {currentStep === 6 ? 'Get My Results' : 'Next'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
              >
                Complete Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Step components
function InboundOutboundStep({ 
  responses, 
  onUpdate 
}: { 
  responses: AssessmentResponses
  onUpdate: (module: string, lever: string, data: { present: boolean; maturity: number }) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Inbound & Outbound Marketing</h3>
        <p className="text-sm text-gray-600 mt-2">
          How you attract prospects to you vs. how you reach out to them directly
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Inbound Marketing</h4>
          <p className="text-sm text-gray-600">Content and strategies that draw prospects to your business</p>
        </div>
        <LeverQuestion
          label="SEO Strategy"
          description="Optimizing your website and content to rank higher in search results for relevant keywords"
          value={responses.inbound?.seo}
          onChange={(data) => onUpdate('inbound', 'seo', data)}
        />
        <LeverQuestion
          label="Lead Magnets"
          description="Free valuable resources (guides, templates, tools) that prospects exchange for their contact information"
          value={responses.inbound?.leadMagnets}
          onChange={(data) => onUpdate('inbound', 'leadMagnets', data)}
        />
        <LeverQuestion
          label="Webinars"
          description="Educational online events that showcase your expertise and generate qualified leads"
          value={responses.inbound?.webinars}
          onChange={(data) => onUpdate('inbound', 'webinars', data)}
        />
        <LeverQuestion
          label="Employee Advocacy (LinkedIn)"
          description="Employees actively share company or industry content on LinkedIn to extend reach and trust"
          value={responses.inbound?.employeeAdvocacy}
          onChange={(data) => onUpdate('inbound', 'employeeAdvocacy', data)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Outbound Sales</h4>
          <p className="text-sm text-gray-600">Proactive outreach to identify and engage potential customers</p>
        </div>
        <LeverQuestion
          label="Email Sequences"
          description="Automated, personalized email campaigns that nurture prospects through your sales funnel"
          value={responses.outbound?.sequences}
          onChange={(data) => onUpdate('outbound', 'sequences', data)}
        />
        <LeverQuestion
          label="LinkedIn Outreach"
          description="Professional networking and direct messaging to connect with decision-makers"
          value={responses.outbound?.linkedin}
          onChange={(data) => onUpdate('outbound', 'linkedin', data)}
        />
        <LeverQuestion
          label="Phone Outreach"
          description="Direct phone calls to prospects for qualification, demos, and relationship building"
          value={responses.outbound?.phone}
          onChange={(data) => onUpdate('outbound', 'phone', data)}
        />
        <LeverQuestion
          label="Deliverability & Domain Warmup"
          description="Infrastructure and practices to keep cold and warm email deliverability high (SPF/DKIM/DMARC, warmup, list hygiene)"
          value={responses.outbound?.deliverability}
          onChange={(data) => onUpdate('outbound', 'deliverability', data)}
        />
      </div>
    </div>
  )
}

function EventsStep({ 
  responses, 
  onUpdate 
}: { 
  responses: AssessmentResponses
  onUpdate: (module: string, lever: string, data: { present: boolean; maturity: number }) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Events & Conferences</h3>
        <p className="text-sm text-gray-600 mt-2">
          Trade shows, conferences, and events that drive high-value B2B connections and lead generation
        </p>
      </div>
      
      <div className="space-y-4">
        <LeverQuestion
          label="Trade Shows"
          description="Industry trade shows and exhibitions where you meet prospects face-to-face and generate qualified leads"
          value={responses.events?.tradeShows}
          onChange={(data) => onUpdate('events', 'tradeShows', data)}
        />
        <LeverQuestion
          label="Conferences"
          description="Speaking at or attending industry conferences to establish thought leadership and network with prospects"
          value={responses.events?.conferences}
          onChange={(data) => onUpdate('events', 'conferences', data)}
        />
        <LeverQuestion
          label="Event Sponsorships"
          description="Sponsoring industry events, webinars, or conferences to increase brand visibility and lead generation"
          value={responses.events?.sponsorships}
          onChange={(data) => onUpdate('events', 'sponsorships', data)}
        />
        <LeverQuestion
          label="Badge Scanning / Lead Capture"
          description="Systematic on-site lead capture (badge scanning, notes, qualifiers) synced to CRM"
          value={responses.events?.leadCapture}
          onChange={(data) => onUpdate('events', 'leadCapture', data)}
        />
        <LeverQuestion
          label="Pre-booked Meetings at Events"
          description="Scheduling meetings with target accounts before the event (VIP lounges, exec briefings)"
          value={responses.events?.preBookedMeetings}
          onChange={(data) => onUpdate('events', 'preBookedMeetings', data)}
        />
        <LeverQuestion
          label="Automated Event Follow-up"
          description="Automated post-event workflows segmented by attendance/engagement (recordings, resources, CTAs)"
          value={responses.events?.followup}
          onChange={(data) => onUpdate('events', 'followup', data)}
        />
      </div>
    </div>
  )
}

function ContentPaidStep({ 
  responses, 
  onUpdate 
}: { 
  responses: AssessmentResponses
  onUpdate: (module: string, lever: string, data: { present: boolean; maturity: number }) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Content & Paid Marketing</h3>
        <p className="text-sm text-gray-600 mt-2">
          Creating valuable content and amplifying it through paid channels to reach your audience
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Content Marketing</h4>
          <p className="text-sm text-gray-600">Educational and engaging content that builds trust and drives conversions</p>
        </div>
        <LeverQuestion
          label="Blog Content"
          description="Regular, valuable articles that establish thought leadership and drive organic traffic"
          value={responses.content?.blog}
          onChange={(data) => onUpdate('content', 'blog', data)}
        />
        <LeverQuestion
          label="Case Studies"
          description="Success stories and customer testimonials that demonstrate your product's value"
          value={responses.content?.caseStudies}
          onChange={(data) => onUpdate('content', 'caseStudies', data)}
        />
        <LeverQuestion
          label="Middle-of-Funnel Assets"
          description="Content for prospects who are considering your solution (comparisons, demos, ROI calculators)"
          value={responses.content?.moFuAssets}
          onChange={(data) => onUpdate('content', 'moFuAssets', data)}
        />
        <LeverQuestion
          label="Bottom-of-Funnel Assets"
          description="Decision-stage content (ROI calculators, security docs, buyer’s guides, comparisons)"
          value={responses.content?.boFuAssets}
          onChange={(data) => onUpdate('content', 'boFuAssets', data)}
        />
        <LeverQuestion
          label="Content Distribution"
          description="Planned distribution (email, LinkedIn, partners, community, PR) vs. ‘publish and pray’"
          value={responses.content?.distribution}
          onChange={(data) => onUpdate('content', 'distribution', data)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Paid Advertising</h4>
          <p className="text-sm text-gray-600">Targeted ads that accelerate lead generation and brand visibility</p>
        </div>
        <LeverQuestion
          label="PPC Campaigns"
          description="Pay-per-click ads on Google and Bing that target high-intent search keywords"
          value={responses.paid?.ppc}
          onChange={(data) => onUpdate('paid', 'ppc', data)}
        />
        <LeverQuestion
          label="Social Media Ads"
          description="Sponsored content on LinkedIn, Facebook, and other platforms to reach your target audience"
          value={responses.paid?.socialAds}
          onChange={(data) => onUpdate('paid', 'socialAds', data)}
        />
        <LeverQuestion
          label="Retargeting"
          description="Ads shown to visitors who left your website to bring them back and convert"
          value={responses.paid?.retargeting}
          onChange={(data) => onUpdate('paid', 'retargeting', data)}
        />
        <LeverQuestion
          label="ABM Campaigns"
          description="Account-based plays with tailored ads/landing pages for named accounts"
          value={responses.paid?.abm}
          onChange={(data) => onUpdate('paid', 'abm', data)}
        />
        <LeverQuestion
          label="LinkedIn Lead Gen Forms"
          description="Native Lead Gen Forms to reduce friction and improve conversion rate"
          value={responses.paid?.linkedinLeadGen}
          onChange={(data) => onUpdate('paid', 'linkedinLeadGen', data)}
        />
      </div>
    </div>
  )
}

function NurtureInfraStep({ 
  responses, 
  onUpdate 
}: { 
  responses: AssessmentResponses
  onUpdate: (module: string, lever: string, data: { present: boolean; maturity: number }) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Nurturing, Infrastructure &amp; Measurement</h3>
        <p className="text-sm text-gray-600 mt-2">
          Systems and processes that convert leads into customers and measure performance
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Lead Nurturing</h4>
          <p className="text-sm text-gray-600">Automated systems that guide prospects through your sales funnel</p>
        </div>
        <LeverQuestion
          label="Email Drip Campaigns"
          description="Automated email sequences that educate and nurture leads over time based on their behavior"
          value={responses.nurture?.drip}
          onChange={(data) => onUpdate('nurture', 'drip', data)}
        />
        <LeverQuestion
          label="Lead Scoring"
          description="System that ranks leads based on engagement and profile data to prioritize sales efforts"
          value={responses.nurture?.scoringTriggers}
          onChange={(data) => onUpdate('nurture', 'scoringTriggers', data)}
        />
        <LeverQuestion
          label="Intent Signals"
          description="Tracking prospect behavior (website visits, content downloads) to identify sales-ready leads"
          value={responses.nurture?.intentSignals}
          onChange={(data) => onUpdate('nurture', 'intentSignals', data)}
        />
        <LeverQuestion
          label="Reactivation Campaigns"
          description="Automations to revive stalled or aging leads with fresh offers or content"
          value={responses.nurture?.reactivation}
          onChange={(data) => onUpdate('nurture', 'reactivation', data)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Marketing Infrastructure</h4>
          <p className="text-sm text-gray-600">Technology stack that powers and optimizes your marketing operations</p>
        </div>
        <LeverQuestion
          label="CRM System"
          description="Centralized database that tracks all prospect and customer interactions and sales activities"
          value={responses.infra?.crm}
          onChange={(data) => onUpdate('infra', 'crm', data)}
        />
        <LeverQuestion
          label="Marketing Automation"
          description="Platform that automates repetitive marketing tasks like email campaigns and lead routing"
          value={responses.infra?.marketingAutomation}
          onChange={(data) => onUpdate('infra', 'marketingAutomation', data)}
        />
        <LeverQuestion
          label="Data Enrichment"
          description="Tools that enhance prospect profiles with additional company and contact information"
          value={responses.infra?.enrichment}
          onChange={(data) => onUpdate('infra', 'enrichment', data)}
        />
        <LeverQuestion
          label="Real-time Data Sync"
          description="Bidirectional, near real-time sync between CRM, MAP (Marketing Automation Platform), and data warehouse"
          value={responses.infra?.realtimeSync}
          onChange={(data) => onUpdate('infra', 'realtimeSync', data)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Attribution & Analytics</h4>
          <p className="text-sm text-gray-600">Measuring and understanding which marketing activities drive results. Prioritize multi-touch attribution and actionable dashboards tied to pipeline.</p>
        </div>
        <LeverQuestion
          label="Multi-touch Attribution"
          description="System that tracks all touchpoints in a customer's journey to understand what drives conversions"
          value={responses.attr?.multiTouch}
          onChange={(data) => onUpdate('attr', 'multiTouch', data)}
        />
        <LeverQuestion
          label="Analytics Dashboards"
          description="Visual reports that track key metrics like lead volume, conversion rates, and ROI"
          value={responses.attr?.dashboards}
          onChange={(data) => onUpdate('attr', 'dashboards', data)}
        />
        <LeverQuestion
          label="CTA Tracking"
          description="Monitoring which calls-to-action and content pieces generate the most qualified leads"
          value={responses.attr?.ctaTracking}
          onChange={(data) => onUpdate('attr', 'ctaTracking', data)}
        />
      </div>
    </div>
  )
}

function LeverQuestion({ 
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
  const maturityOptions = getMaturityOptions()

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
              maturity: value?.maturity || 1
            })}
            className="rounded"
          />
          <span className="text-sm">We have this</span>
        </label>
      </div>

      {value?.present && (
        <div>
          <label className="block text-sm font-medium mb-2">Maturity Level</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({
                  present: true,
                  maturity: level
                })}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                  (value?.maturity || 1) >= level
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:border-blue-300'
                }`}
              >
                {level}
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {maturityOptions.find(opt => opt.value === (value?.maturity || 1))?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
