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
  const weights = { 
    inbound: 20,      // Increased - includes events and inbound activities
    outbound: 18,     // Increased - more important in competitive markets
    content: 18,      // Increased - content marketing is foundational
    paid: 18,         // Increased - paid acquisition is more critical
    nurture: 20,      // Increased - conversion is where money is made
    infra: 8,         // Important but not as weighted
    attr: 8           // Important but not as weighted
  };

  const moduleScore = (answers: Record<string, { present?: boolean; maturity?: number }> = {}, leverWeights: Record<string, number>) => {
    let s = 0, max = 0;
    for (const k of Object.keys(leverWeights)) {
      const w = leverWeights[k] ?? 0;
      const present = answers?.[k]?.present ? 1 : 0;
      const maturityRaw = answers?.[k]?.maturity;
      const maturity = typeof maturityRaw === 'number' ? maturityRaw : 0; // 0..5
      s += present * (Math.min(Math.max(maturity, 0), 5) / 5) * w;
      max += w;
    }
    return Math.round((s / Math.max(max, 1)) * 100);
  };

  const inbound = moduleScore(responses.inbound, { 
    seo: 3,           // Critical for organic growth
    leadMagnets: 3,   // Essential for lead capture
    webinars: 2,      // High-value content marketing
    retargetedContent: 2,
    employeeAdvocacy: 2 // Extends organic reach
  });

  // Include events data in inbound scoring
  const eventsData = responses.events || {};
  const eventsScore = moduleScore(eventsData, { 
    tradeShows: 3,    // Major B2B lead generation channel
    conferences: 3,   // Thought leadership and networking
    sponsorships: 1,  // More brand than lead gen
    leadCapture: 3,   // Critical - systematic lead capture
    preBookedMeetings: 2, // High value - pre-qualified meetings
    followup: 2       // Important - post-event nurture
  });

  // Combine inbound and events scores
  const combinedInbound = Math.round((inbound + eventsScore) / 2);

  const outbound = moduleScore(responses.outbound, { 
    sequences: 4,     // Increased - core outbound capability
    linkedin: 3,      // Increased - primary B2B channel
    phone: 2,         // Increased - still valuable for enterprise
    deliverability: 3 // Increased - critical for email success
  });

  const content = moduleScore(responses.content, { 
    blog: 3,          // Increased - thought leadership
    caseStudies: 4,   // Increased - social proof is crucial
    moFuAssets: 3,    // Increased - mid-funnel conversion
    boFuAssets: 2,    // Decreased - less critical than MoFu
    distribution: 3   // Increased - content without distribution is wasted
  });

  const paid = moduleScore(responses.paid, { 
    ppc: 4,           // Increased - high-intent traffic
    socialAds: 3,     // Increased - brand awareness + lead gen
    retargeting: 3,   // Increased - high ROI channel
    abm: 4,           // Increased - critical for enterprise
    linkedinLeadGen: 3 // New - native LinkedIn lead gen forms
  });

  const nurture = moduleScore(responses.nurture, { 
    drip: 4,          // Increased - essential for lead conversion
    reactivation: 3,  // Increased - reactivating cold leads
    scoringTriggers: 3, 
    intentSignals: 3  // Increased - buying signals are gold
  });

  const infra = moduleScore(responses.infra, { 
    crm: 3,           // Increased - single source of truth
    marketingAutomation: 4, // Increased - efficiency multiplier
    enrichment: 3,    // Increased - better data = better targeting
    realtimeSync: 3 
  });

  const attr = moduleScore(responses.attr, { 
    multiTouch: 4,    // Critical for understanding customer journey
    dashboards: 3, 
    ctaTracking: 3 
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const overall = Math.round(
    (combinedInbound * weights.inbound + 
     outbound * weights.outbound + 
     content * weights.content +
     paid * weights.paid + 
     nurture * weights.nurture + 
     infra * weights.infra + 
     attr * weights.attr) / totalWeight
  );

  return {
    inbound: combinedInbound,
    outbound,
    content,
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
