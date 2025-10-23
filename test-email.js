#!/usr/bin/env node

// Test script to send email report to stan@sharemymeals.org
const https = require('https');
const http = require('http');

// Get the base URL from environment or use localhost
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const testEmail = 'stan@sharemymeals.org';

console.log('🧪 Testing Email Report API');
console.log('Base URL:', baseUrl);
console.log('Test Email:', testEmail);
console.log('');

// First, let's create a test assessment
async function createTestAssessment() {
  console.log('📝 Creating test assessment...');
  
  const assessmentData = {
    email: testEmail,
    company: 'Test Company',
    industry: 'technology',
    companySize: '10-50',
    responses: {
      inbound: {
        seo: { present: true, maturity: 3 },
        leadMagnets: { present: true, maturity: 2 },
        webinars: { present: false, maturity: 0 }
      },
      outbound: {
        sequences: { present: true, maturity: 3 },
        deliverability: { present: true, maturity: 2 },
        linkedin: { present: false, maturity: 0 },
        phone: { present: false, maturity: 0 }
      },
      content: {
        blog: { present: true, maturity: 2 },
        caseStudies: { present: false, maturity: 0 },
        boFuAssets: { present: false, maturity: 0 }
      },
      paid: {
        ppc: { present: true, maturity: 3 },
        linkedinLeadGen: { present: false, maturity: 0 },
        socialAds: { present: false, maturity: 0 },
        retargeting: { present: false, maturity: 0 },
        abm: { present: false, maturity: 0 }
      },
      nurture: {
        drip: { present: true, maturity: 2 },
        scoringTriggers: { present: false, maturity: 0 },
        intentSignals: { present: false, maturity: 0 },
        reactivation: { present: false, maturity: 0 }
      },
      infra: {
        crm: { present: true, maturity: 3 },
        marketingAutomation: { present: false, maturity: 0 },
        enrichment: { present: false, maturity: 0 },
        realtimeSync: { present: false, maturity: 0 }
      },
      attr: {
        multiTouch: { present: false, maturity: 0 },
        dashboards: { present: true, maturity: 2 },
        ctaTracking: { present: false, maturity: 0 }
      }
    }
  };

  try {
    const response = await fetch(`${baseUrl}/api/assess/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Assessment created successfully');
    console.log('Assessment ID:', result.assessmentId);
    console.log('');
    return result.assessmentId;
  } catch (error) {
    console.error('❌ Failed to create assessment:', error.message);
    throw error;
  }
}

// Test the email report API
async function testEmailReport(assessmentId) {
  console.log('📧 Testing email report...');
  
  try {
    const response = await fetch(`${baseUrl}/api/email/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessmentId: assessmentId,
        email: testEmail,
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email report sent successfully!');
      console.log('Response:', result);
    } else {
      console.error('❌ Email report failed');
      console.error('Status:', response.status);
      console.error('Response:', result);
    }
    
    return { success: response.ok, response: result };
  } catch (error) {
    console.error('❌ Failed to send email report:', error.message);
    throw error;
  }
}

// Main test function
async function runTest() {
  try {
    console.log('🚀 Starting email report test...');
    console.log('');
    
    // Create test assessment
    const assessmentId = await createTestAssessment();
    
    // Test email report
    const emailResult = await testEmailReport(assessmentId);
    
    console.log('');
    console.log('📊 Test Results:');
    console.log('- Assessment created:', assessmentId ? '✅' : '❌');
    console.log('- Email sent:', emailResult.success ? '✅' : '❌');
    
    if (emailResult.success) {
      console.log('');
      console.log('🎉 Test completed successfully!');
      console.log(`Check ${testEmail} for the email report.`);
    } else {
      console.log('');
      console.log('🔍 Check the logs above for error details.');
    }
    
  } catch (error) {
    console.error('');
    console.error('💥 Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
