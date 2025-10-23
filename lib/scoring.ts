// type Module = "inbound" | "outbound" | "content" | "paid" | "nurture" | "infra" | "attr";

export interface AssessmentResponses {
  inbound: {
    seo?: { present: boolean; maturity: number };
    leadMagnets?: { present: boolean; maturity: number };
    webinars?: { present: boolean; maturity: number };
    retargetedContent?: { present: boolean; maturity: number };
    employeeAdvocacy?: { present: boolean; maturity: number };
  };
  events: {
    tradeShows?: { present: boolean; maturity: number };
    conferences?: { present: boolean; maturity: number };
    sponsorships?: { present: boolean; maturity: number };
    leadCapture?: { present: boolean; maturity: number };
    preBookedMeetings?: { present: boolean; maturity: number };
    followup?: { present: boolean; maturity: number };
  };
  outbound: {
    sequences?: { present: boolean; maturity: number };
    linkedin?: { present: boolean; maturity: number };
    phone?: { present: boolean; maturity: number };
    deliverability?: { present: boolean; maturity: number };
  };
  content: {
    blog?: { present: boolean; maturity: number };
    caseStudies?: { present: boolean; maturity: number };
    moFuAssets?: { present: boolean; maturity: number };
    boFuAssets?: { present: boolean; maturity: number };
    distribution?: { present: boolean; maturity: number };
  };
  paid: {
    ppc?: { present: boolean; maturity: number };
    socialAds?: { present: boolean; maturity: number };
    retargeting?: { present: boolean; maturity: number };
    abm?: { present: boolean; maturity: number };
    linkedinLeadGen?: { present: boolean; maturity: number };
  };
  nurture: {
    drip?: { present: boolean; maturity: number };
    reactivation?: { present: boolean; maturity: number };
    scoringTriggers?: { present: boolean; maturity: number };
    intentSignals?: { present: boolean; maturity: number };
  };
  infra: {
    crm?: { present: boolean; maturity: number };
    marketingAutomation?: { present: boolean; maturity: number };
    enrichment?: { present: boolean; maturity: number };
    realtimeSync?: { present: boolean; maturity: number };
  };
  attr: {
    multiTouch?: { present: boolean; maturity: number };
    dashboards?: { present: boolean; maturity: number };
    ctaTracking?: { present: boolean; maturity: number };
  };
}

export interface AssessmentScores {
  inbound: number;
  outbound: number;
  content: number;
  paid: number;
  nurture: number;
  infra: number;
  attr: number;
  overall: number;
}

export function scoreAssessment(responses: AssessmentResponses): AssessmentScores {
  // Debug logging
  console.log('Scoring responses:', JSON.stringify(responses, null, 2));
  
  // Maturity Scale Definitions:
  // 0: Not present/planned
  // 1: Ad-hoc/inconsistent
  // 2: Defined process, inconsistent execution
  // 3: Consistent execution, some optimization
  // 4: Well-optimized, data-driven
  // 5: Best-in-class, continuously improving
  
  const weights = { 
    inbound: 25,      // Includes events + SEO + lead gen
    outbound: 20,     // Critical for competitive markets
    paid: 20,         // Paid acquisition is essential
    nurture: 20,      // Conversion optimization
    infra: 8,         // Foundation but not weighted as heavily
    attr: 7           // Important for optimization
  };

  const moduleScore = (answers: Record<string, { present?: boolean; maturity?: number }> = {}, leverWeights: Record<string, number>, moduleName: string) => {
    console.log(`Scoring ${moduleName}:`, answers);
    let s = 0, max = 0;
    for (const k of Object.keys(leverWeights)) {
      const w = leverWeights[k] ?? 0;
      const present = answers?.[k]?.present ? 1 : 0;
      const maturityRaw = answers?.[k]?.maturity;
      const maturity = typeof maturityRaw === 'number' ? maturityRaw : 0; // 0..5
      
      // Validation: warn if present=true but maturity=0
      if (present && maturity === 0) {
        console.warn(`${moduleName}.${k}: marked present but maturity is 0`);
      }
      
      const score = present * (Math.min(Math.max(maturity, 0), 5) / 5) * w;
      s += score;
      max += w;
      console.log(`  ${k}: present=${present}, maturity=${maturity}, weight=${w}, score=${score}`);
    }
    const finalScore = Math.round((s / Math.max(max, 1)) * 100);
    console.log(`${moduleName} final score: ${finalScore}`);
    return finalScore;
  };

  // Include events in inbound scoring
  const inbound = moduleScore({
    ...responses.inbound,
    ...responses.events
  }, { 
    seo: 4,           // SEO & Content Marketing
    leadMagnets: 3,   // Lead Magnets
    webinars: 3,      // Webinars & Events
    tradeShows: 2,    // Events & Trade Shows
    conferences: 2,   // Conference Marketing
    sponsorships: 2   // Event Sponsorships
  }, 'inbound');

  const outbound = moduleScore(responses.outbound, { 
    sequences: 5,     // Core outbound capability
    deliverability: 4, // Critical for sequences to work
    linkedin: 3,      // Primary B2B channel
    phone: 2          // Lower importance in 2025
  }, 'outbound');

  // Score content independently using actual content responses
  const content = moduleScore(responses.content, {
    blog: 3,          // Content foundation
    caseStudies: 4,   // High-value content
    moFuAssets: 3,    // Middle-of-funnel content
    boFuAssets: 3,    // Bottom-of-funnel content
    distribution: 2   // Content distribution
  }, 'content');

  const paid = moduleScore(responses.paid, { 
    ppc: 4,           // High-intent traffic
    linkedinLeadGen: 4, // Critical for B2B
    retargeting: 3,   // High ROI channel
    socialAds: 2,     // Brand awareness + lead gen
    abm: 2           // Account-based marketing
  }, 'paid');

  const nurture = moduleScore(responses.nurture, { 
    drip: 4,          // Essential for lead conversion
    scoringTriggers: 4, // Critical for lead qualification
    intentSignals: 3,  // Buying signals are gold
    reactivation: 2   // Re-engaging cold leads
  }, 'nurture');

  const infra = moduleScore(responses.infra, { 
    crm: 4,           // Single source of truth
    marketingAutomation: 4, // Essential for scaling
    enrichment: 3,    // Better data = better targeting
    realtimeSync: 2   // Nice to have
  }, 'infra');

  const attr = moduleScore(responses.attr, { 
    multiTouch: 4,    // Critical for understanding customer journey
    dashboards: 3,    // Data visibility
    ctaTracking: 2    // Conversion optimization
  }, 'attr');

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const overall = Math.round(
    (inbound * weights.inbound + 
     outbound * weights.outbound + 
     paid * weights.paid + 
     nurture * weights.nurture + 
     infra * weights.infra + 
     attr * weights.attr) / totalWeight
  );

  return {
    inbound,
    outbound,
    content, // Keep for display but not in overall calculation
    paid,
    nurture,
    infra,
    attr,
    overall
  };
}

export function getTopGrowthLevers(scores: AssessmentScores): string[] {
  const moduleScores = [
    { name: 'inbound', score: scores.inbound },
    { name: 'outbound', score: scores.outbound },
    { name: 'content', score: scores.content },
    { name: 'paid', score: scores.paid },
    { name: 'nurture', score: scores.nurture },
    { name: 'infra', score: scores.infra },
    { name: 'attr', score: scores.attr }
  ];

  // Sort by score (ascending) and return the 3 lowest scoring modules
  return moduleScores
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(module => module.name);
}

export function computeGaps(scores: AssessmentScores): string[] {
  return getTopGrowthLevers(scores);
}

export function fallbackLeversFromGaps(scores: AssessmentScores) {
  const gaps = computeGaps(scores);
  return gaps.map(gap => ({
    name: getModuleDisplayName(gap),
    why: `This area shows room for improvement and could significantly impact your overall lead generation performance.`,
    expectedImpact: '15-25% improvement in lead quality and conversion rates',
    confidence: 'medium' as const,
    firstStep: `Review your current ${getModuleDisplayName(gap).toLowerCase()} processes and identify quick wins.`
  }));
}

function getModuleDisplayName(module: string): string {
  const names: Record<string, string> = {
    inbound: 'Inbound Marketing',
    outbound: 'Outbound Sales',
    content: 'Content Marketing',
    paid: 'Paid Advertising',
    nurture: 'Lead Nurturing',
    infra: 'Marketing Infrastructure',
    attr: 'Attribution & Analytics'
  };
  return names[module] || module;
}

export function extractStack(responses: AssessmentResponses): string[] {
  const stack: string[] = [];
  
  // Extract CRM and marketing automation tools from infra
  if (responses.infra?.crm?.present) stack.push('CRM');
  if (responses.infra?.marketingAutomation?.present) stack.push('Marketing Automation');
  if (responses.infra?.enrichment?.present) stack.push('Data Enrichment');
  if (responses.infra?.realtimeSync?.present) stack.push('Real-time Sync');
  
  return stack;
}
