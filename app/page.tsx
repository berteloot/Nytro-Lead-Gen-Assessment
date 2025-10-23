import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section - Much Shorter */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Image
              src="/logo_Nytro_color.png"
              alt="Nytro Marketing Logo"
              width={200}
              height={80}
              className="mx-auto mb-4"
              priority
            />
            <span className="text-sm font-semibold text-[#F86A0E] uppercase tracking-wide">Powered by Nytro Marketing</span>
          </div>
          
          {/* NEW: Emotional + Logical Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#313C59] mb-4">
            📊 Show Me How My Lead Gen Stacks Up
          </h1>
          
          {/* NEW: 3-Bullet Value Promise */}
          <div className="bg-white rounded-lg p-6 mb-6 max-w-2xl mx-auto shadow-lg border border-[#F86A0E]/20">
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-[#F86A0E] text-xl">✓</span>
                <span className="text-sm font-medium">See how you compare to peers</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#F86A0E] text-xl">✓</span>
                <span className="text-sm font-medium">Find hidden pipeline gaps</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#F86A0E] text-xl">✓</span>
                <span className="text-sm font-medium">Get tailored tips—no consultant needed</span>
              </div>
            </div>
          </div>

          {/* NEW: Social Proof + Urgency */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800 font-medium">
              <strong>Used by 120+ marketers</strong> to spot pipeline leaks in Q3. Updated for 2025 benchmarks.
            </p>
          </div>
          
          <p className="text-lg text-[#313C59] mb-6 max-w-xl mx-auto">
            Get your personalized demand gen health check — with actionable insights for your team.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-4 mb-8 max-w-2xl mx-auto border border-[#F86A0E]/20">
            <p className="text-[#313C59] font-medium text-sm">
              ⏱️ Takes ~3 minutes • 📧 Get results instantly • 🎯 No login required
            </p>
          </div>

          {/* NEW: Better CTA */}
          <Link href="/assess">
            <Button size="lg" className="text-lg px-8 py-4 bg-[#F86A0E] hover:bg-[#e55a0a] text-white">
              Reveal My Blind Spots (3 min)
            </Button>
          </Link>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#313C59]">
                <div className="w-8 h-8 bg-[#F86A0E] rounded-lg flex items-center justify-center mr-3">
                  📊
                </div>
                Comprehensive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#313C59] mb-3">
                Get scored across 7 key areas: inbound, outbound, content, paid, 
                nurturing, infrastructure, and attribution.
              </p>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>Inbound Marketing:</strong> SEO, lead magnets, webinars, employee advocacy</p>
                <p className="mb-2"><strong>Outbound Sales:</strong> Email sequences, LinkedIn outreach, phone, deliverability</p>
                <p className="mb-2"><strong>Events & Conferences:</strong> Trade shows, conferences, virtual events, sponsorships</p>
                <p className="mb-2"><strong>Content & Paid:</strong> Blog, case studies, PPC, social ads, retargeting</p>
                <p className="mb-2"><strong>Lead Nurturing:</strong> Drip campaigns, lead scoring, intent signals</p>
                <p className="mb-2"><strong>Infrastructure:</strong> CRM, marketing automation, data enrichment</p>
                <p><strong>Attribution:</strong> Multi-touch attribution, analytics dashboards, CTA tracking</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#313C59]">
                <div className="w-8 h-8 bg-[#2E5CD5] rounded-lg flex items-center justify-center mr-3">
                  🎯
                </div>
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#313C59]">
                Receive personalized recommendations with expected impact estimates 
                and confidence levels for each opportunity.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#313C59]">
                <div className="w-8 h-8 bg-[#00C0B4] rounded-lg flex items-center justify-center mr-3">
                  📈
                </div>
                Actionable Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#313C59]">
                Download a detailed PDF report and book a free consultation to 
                discuss implementation strategies.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#313C59] mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#F86A0E] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2 text-[#313C59]">Answer Questions</h3>
              <p className="text-sm text-[#313C59]">
                Complete a 3-step assessment about your current marketing setup
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2E5CD5] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2 text-[#313C59]">Get Scored</h3>
              <p className="text-sm text-[#313C59]">
                Our algorithm analyzes your responses and calculates maturity scores
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00C0B4] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2 text-[#313C59]">AI Analysis</h3>
              <p className="text-sm text-[#313C59]">
                AI generates personalized recommendations and growth opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#F86A0E] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2 text-[#313C59]">Take Action</h3>
              <p className="text-sm text-[#313C59]">
                Download your report and book a free consultation to get started
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#313C59] mb-8">Here&apos;s What You&apos;ll Get</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#F86A0E]/20 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold text-[#313C59] mb-4">📊 Your Growth Map Includes:</h3>
                <ul className="space-y-3 text-[#313C59]">
                  <li className="flex items-start">
                    <span className="text-[#F86A0E] mr-2">✓</span>
                    <span>Personalized scores across 7 key marketing areas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F86A0E] mr-2">✓</span>
                    <span>Top 3 growth opportunities with expected impact</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F86A0E] mr-2">✓</span>
                    <span>Specific first steps for each opportunity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F86A0E] mr-2">✓</span>
                    <span>Downloadable PDF report for your team</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg p-6">
                <h4 className="font-semibold text-[#313C59] mb-3">Sample Insight:</h4>
                <p className="text-sm text-gray-700 italic">
                  &quot;Your content marketing scores 35/100. Adding case studies and ROI calculators could increase lead quality by 40% and reduce sales cycle by 2 weeks.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Social Proof + Opt-out Path */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-[#F86A0E]/20">
          <h2 className="text-xl font-bold text-[#313C59] mb-4">
            Join 200+ B2B Companies Who Found Their Growth Levers
          </h2>
          <p className="text-[#313C59] mb-6">
            &ldquo;Helped us realize why MQLs were stalling. Took 4 mins, changed our playbook.&rdquo; - Sarah M., VP Marketing
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/assess">
              <Button size="lg" className="text-lg px-8 py-4 bg-[#F86A0E] hover:bg-[#e55a0a] text-white">
                Get My Health Check (3 min)
              </Button>
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Not ready to answer?</p>
              <Link href="#" className="text-[#F86A0E] hover:text-[#e55a0a] font-medium text-sm underline">
                Download the 5 most common mistakes instead
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}