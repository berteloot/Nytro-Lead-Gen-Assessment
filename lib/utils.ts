import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Growing"
  return "Ready to Scale"
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50"
  if (score >= 60) return "text-orange-600 bg-orange-50"
  if (score >= 40) return "text-yellow-600 bg-yellow-50"
  return "text-red-600 bg-red-50"
}

export function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-orange-500"
  if (score >= 40) return "bg-yellow-500"
  return "bg-red-500"
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  const [localPart, domain] = email.toLowerCase().split('@')
  
  // Block generic email providers
  const blockedProviders = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'aol.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com',
    'tutanota.com', 'yandex.com', 'mail.ru', 'gmx.com', 'web.de',
    'zoho.com', 'fastmail.com', 'hey.com', 'temp-mail.org', '10minutemail.com',
    'guerrillamail.com', 'mailinator.com', 'throwaway.email', 'tempmail.net',
    'example.com', 'test.com', 'demo.com', 'sample.com', 'fake.com',
    'noreply.com', 'no-reply.com'
  ]

  if (blockedProviders.includes(domain)) {
    return { 
      isValid: false, 
      error: 'Please use your company email address instead of a personal email provider' 
    }
  }

  // Block obviously fake domains
  const fakePatterns = [
    /^test/, /^demo/, /^sample/, /^fake/, /^temp/, /^temporary/,
    /^example/, /^dummy/, /^placeholder/, /^your/, /^company/
  ]

  if (fakePatterns.some(pattern => pattern.test(domain))) {
    return { 
      isValid: false, 
      error: 'Please use a real company email address' 
    }
  }

  // Block generic local parts
  const genericLocalParts = [
    'test', 'demo', 'sample', 'fake', 'temp', 'temporary', 'example',
    'dummy', 'placeholder', 'your', 'company', 'business', 'admin',
    'info', 'contact', 'hello', 'hi', 'user', 'guest', 'visitor'
  ]

  if (genericLocalParts.includes(localPart)) {
    return { 
      isValid: false, 
      error: 'Please use your actual name or a professional email address' 
    }
  }

  // Block disposable email domains (common ones)
  const disposablePatterns = [
    /mailinator/, /guerrillamail/, /10minutemail/, /tempmail/, /throwaway/,
    /temp-mail/, /trashmail/, /sharklasers/, /grr.la/, /guerrillamailblock/
  ]

  if (disposablePatterns.some(pattern => pattern.test(domain))) {
    return { 
      isValid: false, 
      error: 'Please use a permanent email address, not a temporary one' 
    }
  }

  return { isValid: true }
}

export function generateAssessmentId(): string {
  return `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getIndustryOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'software-saas', label: 'Software/SaaS' },
    { value: 'cloud-infrastructure', label: 'Cloud Infrastructure & Data Platforms' },
    { value: 'financial-services', label: 'Financial Services & Fintech' },
    { value: 'marketing-sales-tech', label: 'Marketing & Sales Technology' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'other', label: 'Other' },
  ]
}

export function getCompanySizeOptions(): Array<{ value: string; label: string }> {
  return [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ]
}

export function getMaturityOptions(): Array<{ value: number; label: string }> {
  return [
    { value: 1, label: 'Not started' },
    { value: 2, label: 'Basic setup' },
    { value: 3, label: 'Some automation' },
    { value: 4, label: 'Well optimized' },
    { value: 5, label: 'Fully mature' },
  ]
}

export function calculateProgress(currentStep: number, totalSteps: number): number {
  return Math.round((currentStep / totalSteps) * 100)
}

export function getModuleDisplayName(module: string): string {
  const displayNames: Record<string, string> = {
    inbound: 'Inbound Marketing',
    outbound: 'Outbound Sales',
    content: 'Content Marketing',
    paid: 'Paid Advertising',
    nurture: 'Lead Nurturing',
    infra: 'Marketing Infrastructure',
    attr: 'Attribution & Analytics',
  }
  return displayNames[module] || module
}

export function getModuleDescription(module: string): string {
  const descriptions: Record<string, string> = {
    inbound: 'Organic traffic generation through SEO, content, and lead magnets',
    outbound: 'Proactive outreach through email sequences, LinkedIn, and phone',
    content: 'Educational content creation and distribution strategy',
    paid: 'Paid advertising across search, social, and display channels',
    nurture: 'Automated follow-up and lead qualification processes',
    infra: 'Marketing technology stack and data management',
    attr: 'Tracking and measuring marketing performance and ROI',
  }
  return descriptions[module] || ''
}
