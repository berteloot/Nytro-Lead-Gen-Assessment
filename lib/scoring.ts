// type Module = "inbound" | "outbound" | "content" | "paid" | "nurture" | "infra" | "attr";

export interface AssessmentResponses {
  inbound: {
    seo?: { present: boolean; maturity: number };
    leadMagnets?: { present: boolean; maturity: number };
    webinars?: { present: boolean; maturity: number };
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
  outcome: 'Foundation' | 'Momentum' | 'Optimization';
  prerequisites: string[];
  risks: string[];
}

export function scoreAssessment(responses: AssessmentResponses): AssessmentScores {
  // Debug logging
  console.log('Scoring responses:', JSON.stringify(responses, null, 2));
  console.log('Response structure check:');
  console.log('- inbound:', responses.inbound);
  console.log('- outbound:', responses.outbound);
  console.log('- content:', responses.content);
  console.log('- paid:', responses.paid);
  console.log('- nurture:', responses.nurture);
  console.log('- infra:', responses.infra);
  console.log('- attr:', responses.attr);
  
  // Maturity Scale Definitions:
  // 0: Not present/planned
  // 1: Ad-hoc/inconsistent
  // 2: Defined process, inconsistent execution
  // 3: Consistent execution, some optimization
  // 4: Well-optimized, data-driven
  // 5: Best-in-class, continuously improving
  
  const weights = { 
    inbound: 20,      // Includes events + SEO + lead gen
    outbound: 18,     // Critical for competitive markets
    content: 15,      // Content marketing is foundational
    paid: 18,         // Paid acquisition is essential
    nurture: 18,      // Conversion optimization
    infra: 6,         // Foundation but not weighted as heavily
    attr: 5           // Important for optimization
  };

  // Maturity weight multipliers: 0=not in place, 1=basic, 2=consistent, 3=advanced
  const maturityWeights = [0, 0.5, 0.75, 1.0];
  
  const moduleScore = (answers: Record<string, { present?: boolean; maturity?: number }> = {}, leverWeights: Record<string, number>, moduleName: string) => {
    console.log(`Scoring ${moduleName}:`, answers);
    let s = 0, max = 0;
    for (const k of Object.keys(leverWeights)) {
      const w = leverWeights[k] ?? 0;
      const present = answers?.[k]?.present ? 1 : 0;
      const maturityRaw = answers?.[k]?.maturity;
      const maturity = typeof maturityRaw === 'number' ? maturityRaw : 0; // 0..3
      
      // Validation: warn if present=true but maturity=0
      if (present && maturity === 0) {
        console.warn(`${moduleName}.${k}: marked present but maturity is 0`);
      }
      
      // Use maturity weight multiplier instead of linear scaling
      const maturityMultiplier = maturityWeights[Math.min(maturity, 3)] || 0;
      const score = present * maturityMultiplier * w;
      s += score;
      max += w;
      console.log(`  ${k}: present=${present}, maturity=${maturity}, multiplier=${maturityMultiplier}, weight=${w}, score=${score}`);
    }
    const finalScore = Math.round((s / Math.max(max, 1)) * 100);
    console.log(`${moduleName} final score: ${finalScore}`);
    return finalScore;
  };

  // Score inbound marketing with pipeline impact weights
  const inbound = moduleScore(responses.inbound, { 
    seo: 3,           // SEO & Content Marketing (medium impact)
    leadMagnets: 4,   // Lead capture (high impact)
    webinars: 3       // Webinars & Events (medium impact)
  }, 'inbound');

  const outbound = moduleScore(responses.outbound, { 
    sequences: 5,     // Core outbound capability (high impact)
    deliverability: 6, // Critical prerequisite (highest impact)
    linkedin: 4,      // Primary B2B channel (high impact)
    phone: 2          // Lower importance in 2025 (low impact)
  }, 'outbound');

  // Score content with pipeline impact weights
  const content = moduleScore(responses.content, {
    blog: 2,          // Content foundation (low impact)
    caseStudies: 5,   // BOFU content (high impact)
    moFuAssets: 3,    // Middle-of-funnel content (medium impact)
    boFuAssets: 5,    // Bottom-of-funnel content (high impact)
    distribution: 2   // Content distribution (low impact)
  }, 'content');

  const paid = moduleScore(responses.paid, { 
    ppc: 4,           // High-intent traffic (high impact)
    linkedinLeadGen: 5, // Critical for B2B (high impact)
    retargeting: 4,   // High ROI channel (high impact)
    socialAds: 2,     // Brand awareness (low impact)
    abm: 3           // Account-based marketing (medium impact)
  }, 'paid');

  const nurture = moduleScore(responses.nurture, { 
    drip: 5,          // Essential for lead conversion (high impact)
    scoringTriggers: 6, // Critical for lead qualification (highest impact)
    intentSignals: 4,  // Buying signals (high impact)
    reactivation: 3   // Re-engaging cold leads (medium impact)
  }, 'nurture');

  const infra = moduleScore(responses.infra, { 
    crm: 6,           // Single source of truth (highest impact)
    marketingAutomation: 5, // Essential for scaling (high impact)
    enrichment: 3,    // Better data (medium impact)
    realtimeSync: 2   // Nice to have (low impact)
  }, 'infra');

  const attr = moduleScore(responses.attr, { 
    multiTouch: 6,    // Critical for understanding customer journey (highest impact)
    dashboards: 4,    // Data visibility (high impact)
    ctaTracking: 3    // Conversion optimization (medium impact)
  }, 'attr');

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const overall = Math.round(
    (inbound * weights.inbound + 
     outbound * weights.outbound + 
     content * weights.content +
     paid * weights.paid + 
     nurture * weights.nurture + 
     infra * weights.infra + 
     attr * weights.attr) / totalWeight
  );

  // Determine outcome band - tightened ranges
  let outcome: 'Foundation' | 'Momentum' | 'Optimization';
  if (overall < 50) {
    outcome = 'Foundation';
  } else if (overall < 75) {
    outcome = 'Momentum';
  } else {
    outcome = 'Optimization';
  }

  // Sanity checks for prerequisites and risks
  const prerequisites: string[] = [];
  const risks: string[] = [];

  // Hard prerequisite checks
  if (infra < 40) {
    prerequisites.push('Marketing infrastructure needs improvement before advanced tactics');
  }
  if (responses.outbound?.deliverability?.present && responses.outbound.deliverability.maturity < 2) {
    prerequisites.push('Email deliverability needs improvement before scaling outbound');
  }
  if (responses.infra?.crm?.present && responses.infra.crm.maturity < 2) {
    prerequisites.push('CRM hygiene needs improvement before advanced automation');
  }
  if (responses.attr?.multiTouch?.present && responses.attr.multiTouch.maturity < 2) {
    prerequisites.push('Attribution tracking needs improvement before scaling spend');
  }

  // Risk checks
  if (responses.paid?.ppc?.present && responses.paid.ppc.maturity >= 2 && 
      responses.content?.boFuAssets?.present && responses.content.boFuAssets.maturity < 2) {
    risks.push('Paid traffic may leak without strong bottom-of-funnel content');
  }
  if (responses.nurture?.scoringTriggers?.present && responses.nurture.scoringTriggers.maturity < 2 &&
      responses.nurture?.drip?.present && responses.nurture.drip.maturity >= 2) {
    risks.push('Lead scoring needs improvement to optimize nurture sequences');
  }
  if (responses.outbound?.sequences?.present && responses.outbound.sequences.maturity >= 2 &&
      responses.outbound?.deliverability?.present && responses.outbound.deliverability.maturity < 2) {
    risks.push('Outbound sequences may underperform without proper deliverability');
  }

  return {
    inbound,
    outbound,
    content,
    paid,
    nurture,
    infra,
    attr,
    overall,
    outcome,
    prerequisites,
    risks
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function computeGapImpact(responses: AssessmentResponses, _scores: AssessmentScores) {
  const leverWeights = {
    inbound: { seo: 3, leadMagnets: 4, webinars: 3 },
    outbound: { sequences: 5, deliverability: 6, linkedin: 4, phone: 2 },
    content: { blog: 2, caseStudies: 5, moFuAssets: 3, boFuAssets: 5, distribution: 2 },
    paid: { ppc: 4, linkedinLeadGen: 5, retargeting: 4, socialAds: 2, abm: 3 },
    nurture: { drip: 5, scoringTriggers: 6, intentSignals: 4, reactivation: 3 },
    infra: { crm: 6, marketingAutomation: 5, enrichment: 3, realtimeSync: 2 },
    attr: { multiTouch: 6, dashboards: 4, ctaTracking: 3 }
  };

  const maturityWeights = [0, 0.5, 0.75, 1.0];
  const gaps: Array<{ module: string; lever: string; impact: number; maturity: number }> = [];

  // Calculate gaps for each module
  Object.entries(leverWeights).forEach(([module, levers]) => {
    Object.entries(levers).forEach(([lever, weight]) => {
      const moduleResponses = responses[module as keyof AssessmentResponses];
      if (moduleResponses) {
        const response = (moduleResponses as Record<string, { maturity?: number }>)[lever];
        if (response) {
          const maturityMultiplier = maturityWeights[Math.min(response.maturity || 0, 3)] || 0;
          const impact = weight * (1 - maturityMultiplier);
          if (impact > 0) {
            gaps.push({
              module,
              lever,
              impact,
              maturity: response.maturity || 0
            });
          }
        }
      }
    });
  });

  return gaps.sort((a, b) => b.impact - a.impact);
}

export function computeConfidence(responses: AssessmentResponses, calibration?: { monthlyLeads: string; meetingRate: string; salesCycle: string }) {
  let answeredLevers = 0;
  let totalLevers = 0;

  // Count answered levers
  Object.values(responses).forEach(module => {
    if (module) {
      Object.values(module).forEach(lever => {
        totalLevers++;
        if (lever && typeof lever === 'object' && 'present' in lever && lever.present) {
          answeredLevers++;
        }
      });
    }
  });

  const responseDensity = answeredLevers / Math.max(totalLevers, 1);
  const hasCalibration = calibration && (calibration.monthlyLeads || calibration.meetingRate || calibration.salesCycle);
  
  if (responseDensity >= 0.7 && hasCalibration) return 'high';
  if (responseDensity >= 0.5 || hasCalibration) return 'medium';
  return 'low';
}

export function fallbackLeversFromGaps(scores: AssessmentScores, responses: AssessmentResponses, calibration?: { monthlyLeads: string; meetingRate: string; salesCycle: string }) {
  const gaps = computeGapImpact(responses, scores);
  const confidence = computeConfidence(responses, calibration);
  
  console.log('Computing growth levers from gaps:', gaps.length, 'gaps found');
  
  // If no gaps found, return default recommendations based on lowest scores
  if (gaps.length === 0) {
    console.log('No gaps found, using default recommendations based on scores');
    const sortedModules = [
      { module: 'inbound', score: scores.inbound },
      { module: 'outbound', score: scores.outbound },
      { module: 'content', score: scores.content },
      { module: 'paid', score: scores.paid },
      { module: 'nurture', score: scores.nurture },
      { module: 'infra', score: scores.infra },
      { module: 'attr', score: scores.attr }
    ].sort((a, b) => a.score - b.score);
    
    return sortedModules.slice(0, 3).map(item => ({
      name: getModuleDisplayName(item.module),
      why: `Your current score in this area (${item.score}/100) indicates significant room for improvement.`,
      expectedImpact: 'High - Building foundational capabilities will create compound growth',
      confidence: confidence as 'low' | 'medium' | 'high',
      firstStep: `Start by implementing basic ${getModuleDisplayName(item.module).toLowerCase()} processes.`
    }));
  }
  
  return gaps.slice(0, 3).map(gap => {
    const impactPercent = Math.round((gap.impact / 6) * 100); // Normalize to percentage
    return {
      name: getLeverDisplayName(gap.module, gap.lever),
      why: `This ${getLeverDisplayName(gap.module, gap.lever).toLowerCase()} shows significant room for improvement based on your current maturity level.`,
      expectedImpact: `${impactPercent}% improvement in lead quality and conversion rates`,
      confidence: confidence as 'low' | 'medium' | 'high',
      firstStep: `Review your current ${getLeverDisplayName(gap.module, gap.lever).toLowerCase()} processes and identify quick wins.`
    };
  });
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

function getLeverDisplayName(module: string, lever: string): string {
  const leverNames: Record<string, Record<string, string>> = {
    inbound: {
      seo: 'SEO & Content Marketing',
      leadMagnets: 'Lead Magnets',
      webinars: 'Webinars & Events'
    },
    outbound: {
      sequences: 'Cold Email Campaigns',
      deliverability: 'Email Deliverability',
      linkedin: 'LinkedIn Outreach',
      phone: 'Phone Outreach'
    },
    content: {
      blog: 'Blog & SEO Content',
      caseStudies: 'Case Studies & Success Stories',
      moFuAssets: 'Middle-of-Funnel Content',
      boFuAssets: 'Bottom-of-Funnel Content',
      distribution: 'Content Distribution'
    },
    paid: {
      ppc: 'Google & Bing Ads',
      linkedinLeadGen: 'LinkedIn Lead Generation',
      retargeting: 'Retargeting Campaigns',
      socialAds: 'Social Media Ads',
      abm: 'Account-Based Marketing'
    },
    nurture: {
      drip: 'Email Sequences',
      scoringTriggers: 'Lead Scoring',
      intentSignals: 'Intent Signals',
      reactivation: 'Lead Reactivation'
    },
    infra: {
      crm: 'CRM System',
      marketingAutomation: 'Marketing Automation',
      enrichment: 'Data Enrichment',
      realtimeSync: 'Real-time Data Sync'
    },
    attr: {
      multiTouch: 'Multi-touch Attribution',
      dashboards: 'Analytics Dashboard',
      ctaTracking: 'CTA Tracking'
    }
  };
  
  return leverNames[module]?.[lever] || `${module} - ${lever}`;
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
