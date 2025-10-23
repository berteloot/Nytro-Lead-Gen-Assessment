// type Module = "inbound" | "outbound" | "content" | "paid" | "nurture" | "infra" | "attr";

// LeverValue type for individual lever responses
export type LeverValue = { present: boolean; applicable: boolean };

export interface AssessmentResponses {
  inbound: {
    seo?: LeverValue;
    leadMagnets?: LeverValue;
    webinars?: LeverValue;
  };
  outbound: {
    sequences?: LeverValue;
    linkedin?: LeverValue;
    phone?: LeverValue;
    deliverability?: LeverValue;
  };
  content: {
    blog?: LeverValue;
    caseStudies?: LeverValue;
    moFuAssets?: LeverValue;
    boFuAssets?: LeverValue;
    distribution?: LeverValue;
  };
  paid: {
    ppc?: LeverValue;
    socialAds?: LeverValue;
    retargeting?: LeverValue;
    abm?: LeverValue;
    linkedinLeadGen?: LeverValue;
  };
  nurture: {
    drip?: LeverValue;
    reactivation?: LeverValue;
    scoringTriggers?: LeverValue;
    intentSignals?: LeverValue;
  };
  infra: {
    crm?: LeverValue;
    marketingAutomation?: LeverValue;
    enrichment?: LeverValue;
    realtimeSync?: LeverValue;
  };
  attr: {
    multiTouch?: LeverValue;
    dashboards?: LeverValue;
    ctaTracking?: LeverValue;
  };
}

export interface AssessmentScores {
  inbound: number | null;
  outbound: number | null;
  content: number | null;
  paid: number | null;
  nurture: number | null;
  infra: number | null;
  attr: number | null;
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

  const moduleScore = (levers: {weight: number; present: boolean; applicable: boolean}[]) => {
    const applicableLevers = levers.filter(l => l.applicable);
    if (applicableLevers.length === 0) return null;
    
    const denom = applicableLevers.reduce((s,l) => s + l.weight, 0);
    const numer = applicableLevers.reduce((s,l) => s + l.weight * (l.present ? 1 : 0), 0);
    
    // Calculate percentage of applicable levers that are present
    const presentCount = applicableLevers.filter(l => l.present).length;
    const totalCount = applicableLevers.length;
    const coverageScore = Math.round((presentCount / totalCount) * 100);
    
    // Weighted score based on importance
    const weightedScore = denom ? Math.round((numer / denom) * 100) : 0;
    
    // Blend coverage and weighted scores for fairer assessment
    // 60% coverage (how many levers they have) + 40% weighted (importance)
    return Math.round((coverageScore * 0.6) + (weightedScore * 0.4));
  };

  // Score inbound marketing with pipeline impact weights
  const inbound = moduleScore([
    { weight: 3, present: responses.inbound?.seo?.present ?? false, applicable: responses.inbound?.seo?.applicable !== false },
    { weight: 4, present: responses.inbound?.leadMagnets?.present ?? false, applicable: responses.inbound?.leadMagnets?.applicable !== false },
    { weight: 3, present: responses.inbound?.webinars?.present ?? false, applicable: responses.inbound?.webinars?.applicable !== false }
  ]);

  const outbound = moduleScore([
    { weight: 5, present: responses.outbound?.sequences?.present ?? false, applicable: responses.outbound?.sequences?.applicable !== false },
    { weight: 6, present: responses.outbound?.deliverability?.present ?? false, applicable: responses.outbound?.deliverability?.applicable !== false },
    { weight: 4, present: responses.outbound?.linkedin?.present ?? false, applicable: responses.outbound?.linkedin?.applicable !== false },
    { weight: 2, present: responses.outbound?.phone?.present ?? false, applicable: responses.outbound?.phone?.applicable !== false }
  ]);

  // Score content with pipeline impact weights
  const content = moduleScore([
    { weight: 2, present: responses.content?.blog?.present ?? false, applicable: responses.content?.blog?.applicable !== false },
    { weight: 5, present: responses.content?.caseStudies?.present ?? false, applicable: responses.content?.caseStudies?.applicable !== false },
    { weight: 3, present: responses.content?.moFuAssets?.present ?? false, applicable: responses.content?.moFuAssets?.applicable !== false },
    { weight: 5, present: responses.content?.boFuAssets?.present ?? false, applicable: responses.content?.boFuAssets?.applicable !== false },
    { weight: 2, present: responses.content?.distribution?.present ?? false, applicable: responses.content?.distribution?.applicable !== false }
  ]);

  const paid = moduleScore([
    { weight: 4, present: responses.paid?.ppc?.present ?? false, applicable: responses.paid?.ppc?.applicable !== false },
    { weight: 5, present: responses.paid?.linkedinLeadGen?.present ?? false, applicable: responses.paid?.linkedinLeadGen?.applicable !== false },
    { weight: 4, present: responses.paid?.retargeting?.present ?? false, applicable: responses.paid?.retargeting?.applicable !== false },
    { weight: 2, present: responses.paid?.socialAds?.present ?? false, applicable: responses.paid?.socialAds?.applicable !== false },
    { weight: 3, present: responses.paid?.abm?.present ?? false, applicable: responses.paid?.abm?.applicable !== false }
  ]);

  const nurture = moduleScore([
    { weight: 5, present: responses.nurture?.drip?.present ?? false, applicable: responses.nurture?.drip?.applicable !== false },
    { weight: 6, present: responses.nurture?.scoringTriggers?.present ?? false, applicable: responses.nurture?.scoringTriggers?.applicable !== false },
    { weight: 4, present: responses.nurture?.intentSignals?.present ?? false, applicable: responses.nurture?.intentSignals?.applicable !== false },
    { weight: 3, present: responses.nurture?.reactivation?.present ?? false, applicable: responses.nurture?.reactivation?.applicable !== false }
  ]);

  const infra = moduleScore([
    { weight: 6, present: responses.infra?.crm?.present ?? false, applicable: responses.infra?.crm?.applicable !== false },
    { weight: 5, present: responses.infra?.marketingAutomation?.present ?? false, applicable: responses.infra?.marketingAutomation?.applicable !== false },
    { weight: 3, present: responses.infra?.enrichment?.present ?? false, applicable: responses.infra?.enrichment?.applicable !== false },
    { weight: 2, present: responses.infra?.realtimeSync?.present ?? false, applicable: responses.infra?.realtimeSync?.applicable !== false }
  ]);

  const attr = moduleScore([
    { weight: 6, present: responses.attr?.multiTouch?.present ?? false, applicable: responses.attr?.multiTouch?.applicable !== false },
    { weight: 4, present: responses.attr?.dashboards?.present ?? false, applicable: responses.attr?.dashboards?.applicable !== false },
    { weight: 3, present: responses.attr?.ctaTracking?.present ?? false, applicable: responses.attr?.ctaTracking?.applicable !== false }
  ]);

  // Calculate overall score as weighted average of applicable modules only
  const moduleScores = [
    { score: inbound, weight: weights.inbound },
    { score: outbound, weight: weights.outbound },
    { score: content, weight: weights.content },
    { score: paid, weight: weights.paid },
    { score: nurture, weight: weights.nurture },
    { score: infra, weight: weights.infra },
    { score: attr, weight: weights.attr }
  ].filter(m => m.score !== null);
  
  const totalWeight = moduleScores.reduce((sum, m) => sum + m.weight, 0);
  const overall = moduleScores.length > 0 ? Math.round(
    moduleScores.reduce((sum, m) => sum + ((m.score || 0) * m.weight), 0) / totalWeight
  ) : 0;

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
  if ((infra || 0) < 40) {
    prerequisites.push('Marketing infrastructure needs improvement before advanced tactics');
  }
  if (responses.outbound?.deliverability?.present) {
    prerequisites.push('Email deliverability needs improvement before scaling outbound');
  }
  if (responses.infra?.crm?.present) {
    prerequisites.push('CRM hygiene needs improvement before advanced automation');
  }
  if (responses.attr?.multiTouch?.present) {
    prerequisites.push('Attribution tracking needs improvement before scaling spend');
  }

  // Risk checks - simplified for binary present/absent
  if (responses.paid?.ppc?.present && !responses.content?.boFuAssets?.present) {
    risks.push('Paid traffic may leak without strong bottom-of-funnel content');
  }
  if (!responses.nurture?.scoringTriggers?.present && responses.nurture?.drip?.present) {
    risks.push('Lead scoring needs improvement to optimize nurture sequences');
  }
  if (responses.outbound?.sequences?.present && !responses.outbound?.deliverability?.present) {
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
    .sort((a, b) => (a.score || 0) - (b.score || 0))
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

  const gaps: Array<{ module: string; lever: string; impact: number; maturity: number }> = [];

  // Calculate gaps for each module
  Object.entries(leverWeights).forEach(([module, levers]) => {
    Object.entries(levers).forEach(([lever, weight]) => {
      const moduleResponses = responses[module as keyof AssessmentResponses];
      if (moduleResponses) {
        const response = (moduleResponses as Record<string, { present?: boolean; applicable?: boolean }>)[lever];
        if (response && response.applicable !== false) {
          const presentMultiplier = response.present ? 1 : 0;
          const impact = weight * (1 - presentMultiplier);
          if (impact > 0) {
            gaps.push({
              module,
              lever,
              impact,
              maturity: response.present ? 1 : 0
            });
          }
        }
      }
    });
  });

  return gaps.sort((a, b) => b.impact - a.impact);
}

export function checkPrerequisites(responses: AssessmentResponses): string[] {
  const risks: string[] = [];
  
  // Check for critical infrastructure prerequisites
  if (!responses.infra?.crm?.present) {
    risks.push('No CRM system in place - this is a prerequisite for most marketing activities');
  }
  
  if (!responses.outbound?.deliverability?.present) {
    risks.push('Email deliverability issues detected - outbound campaigns will have poor performance');
  }
  
  if (!responses.infra?.marketingAutomation?.present) {
    risks.push('No marketing automation platform - lead nurturing will be manual and inconsistent');
  }
  
  return risks;
}

export function computeStructuredGaps(responses: AssessmentResponses, _scores: AssessmentScores) {
  const leverWeights = {
    inbound: { seo: 3, leadMagnets: 4, webinars: 3 },
    outbound: { sequences: 5, deliverability: 6, linkedin: 4, phone: 2 },
    content: { blog: 2, caseStudies: 5, moFuAssets: 3, boFuAssets: 5, distribution: 2 },
    paid: { ppc: 4, linkedinLeadGen: 5, retargeting: 4, socialAds: 2, abm: 3 },
    nurture: { drip: 5, scoringTriggers: 6, intentSignals: 4, reactivation: 3 },
    infra: { crm: 6, marketingAutomation: 5, enrichment: 3, realtimeSync: 2 },
    attr: { multiTouch: 6, dashboards: 4, ctaTracking: 3 }
  };

  const structuredGaps: Array<{
    module: string;
    lever: string;
    present: boolean;
    maturity: number;
    weight: number;
    multiplier: number;
    computedImpact: number;
  }> = [];

  Object.entries(leverWeights).forEach(([module, levers]) => {
    Object.entries(levers).forEach(([lever, weight]) => {
      const moduleResponses = responses[module as keyof AssessmentResponses];
      if (moduleResponses) {
        const response = (moduleResponses as Record<string, { present?: boolean; applicable?: boolean }>)[lever];
        if (response && response.applicable !== false) {
          const present = response.present || false;
          const multiplier = present ? 1 : 0;
          // Impact = weight × (1 - presentMultiplier)
          const computedImpact = weight * (1 - multiplier);
          
          structuredGaps.push({
            module,
            lever,
            present,
            maturity: present ? 1 : 0,
            weight,
            multiplier,
            computedImpact
          });
        }
      }
    });
  });

  return structuredGaps.sort((a, b) => b.computedImpact - a.computedImpact);
}

export function computeConfidence(responses: AssessmentResponses, _calibration?: { monthlyLeads: string; meetingRate: string; salesCycle: string }) {
  let answeredLevers = 0;
  let modulesAnswered = 0;

  // Count answered levers (simplified for binary present/absent)
  Object.values(responses).forEach(module => {
    if (module) {
      let moduleHasAnswers = false;
      Object.values(module).forEach(lever => {
        if (lever && typeof lever === 'object' && 'present' in lever && 'applicable' in lever) {
          const typedLever = lever as { present: boolean; applicable: boolean };
          // Count as answered if: not applicable OR present is set (true or false)
          const isAnswered = typedLever.applicable === false || typedLever.present !== undefined;
          if (isAnswered) {
            answeredLevers++;
            moduleHasAnswers = true;
          }
        }
      });
      if (moduleHasAnswers) modulesAnswered++;
    }
  });

  // Check for critical levers with responses
  const hasInfraMaturity = responses.infra?.crm?.present || 
                          responses.infra?.marketingAutomation?.present;
  const hasAttrMaturity = responses.attr?.multiTouch?.present || 
                          responses.attr?.dashboards?.present;
  // const hasNurtureMaturity = responses.nurture?.drip?.maturity !== undefined || 
  //                            responses.nurture?.scoringTriggers?.maturity !== undefined;
  
  // Updated confidence rules
  if (answeredLevers >= 18 && modulesAnswered >= 5 && hasInfraMaturity && hasAttrMaturity) return 'high';
  if (answeredLevers >= 9 && answeredLevers < 18) return 'medium';
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
    ].sort((a, b) => (a.score || 0) - (b.score || 0));
    
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
