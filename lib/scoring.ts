// type Module = "inbound" | "outbound" | "content" | "paid" | "nurture" | "infra" | "attr";

// LeverValue type for individual lever responses
export type LeverValue = { present: boolean; maturity: number | null; applicable: boolean };

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

  const m: {[key: number]: number} = {0: 0, 1: 0.5, 2: 0.75, 3: 1};

  const moduleScore = (levers: {weight: number; maturity: number|null; applicable: boolean}[]) => {
    const denom = levers.filter(l => l.applicable).reduce((s,l) => s + l.weight, 0);
    const numer = levers
      .filter(l => l.applicable)
      .reduce((s,l) => s + l.weight * m[l.maturity ?? 0], 0);
    return denom ? Math.round(100 * numer / denom) : null;
  };

  // Score inbound marketing with pipeline impact weights
  const inbound = moduleScore([
    { weight: 3, maturity: responses.inbound?.seo?.maturity ?? 0, applicable: responses.inbound?.seo?.applicable !== false },
    { weight: 4, maturity: responses.inbound?.leadMagnets?.maturity ?? 0, applicable: responses.inbound?.leadMagnets?.applicable !== false },
    { weight: 3, maturity: responses.inbound?.webinars?.maturity ?? 0, applicable: responses.inbound?.webinars?.applicable !== false }
  ]);

  const outbound = moduleScore([
    { weight: 5, maturity: responses.outbound?.sequences?.maturity ?? 0, applicable: responses.outbound?.sequences?.applicable !== false },
    { weight: 6, maturity: responses.outbound?.deliverability?.maturity ?? 0, applicable: responses.outbound?.deliverability?.applicable !== false },
    { weight: 4, maturity: responses.outbound?.linkedin?.maturity ?? 0, applicable: responses.outbound?.linkedin?.applicable !== false },
    { weight: 2, maturity: responses.outbound?.phone?.maturity ?? 0, applicable: responses.outbound?.phone?.applicable !== false }
  ]);

  // Score content with pipeline impact weights
  const content = moduleScore([
    { weight: 2, maturity: responses.content?.blog?.maturity ?? 0, applicable: responses.content?.blog?.applicable !== false },
    { weight: 5, maturity: responses.content?.caseStudies?.maturity ?? 0, applicable: responses.content?.caseStudies?.applicable !== false },
    { weight: 3, maturity: responses.content?.moFuAssets?.maturity ?? 0, applicable: responses.content?.moFuAssets?.applicable !== false },
    { weight: 5, maturity: responses.content?.boFuAssets?.maturity ?? 0, applicable: responses.content?.boFuAssets?.applicable !== false },
    { weight: 2, maturity: responses.content?.distribution?.maturity ?? 0, applicable: responses.content?.distribution?.applicable !== false }
  ]);

  const paid = moduleScore([
    { weight: 4, maturity: responses.paid?.ppc?.maturity ?? 0, applicable: responses.paid?.ppc?.applicable !== false },
    { weight: 5, maturity: responses.paid?.linkedinLeadGen?.maturity ?? 0, applicable: responses.paid?.linkedinLeadGen?.applicable !== false },
    { weight: 4, maturity: responses.paid?.retargeting?.maturity ?? 0, applicable: responses.paid?.retargeting?.applicable !== false },
    { weight: 2, maturity: responses.paid?.socialAds?.maturity ?? 0, applicable: responses.paid?.socialAds?.applicable !== false },
    { weight: 3, maturity: responses.paid?.abm?.maturity ?? 0, applicable: responses.paid?.abm?.applicable !== false }
  ]);

  const nurture = moduleScore([
    { weight: 5, maturity: responses.nurture?.drip?.maturity ?? 0, applicable: responses.nurture?.drip?.applicable !== false },
    { weight: 6, maturity: responses.nurture?.scoringTriggers?.maturity ?? 0, applicable: responses.nurture?.scoringTriggers?.applicable !== false },
    { weight: 4, maturity: responses.nurture?.intentSignals?.maturity ?? 0, applicable: responses.nurture?.intentSignals?.applicable !== false },
    { weight: 3, maturity: responses.nurture?.reactivation?.maturity ?? 0, applicable: responses.nurture?.reactivation?.applicable !== false }
  ]);

  const infra = moduleScore([
    { weight: 6, maturity: responses.infra?.crm?.maturity ?? 0, applicable: responses.infra?.crm?.applicable !== false },
    { weight: 5, maturity: responses.infra?.marketingAutomation?.maturity ?? 0, applicable: responses.infra?.marketingAutomation?.applicable !== false },
    { weight: 3, maturity: responses.infra?.enrichment?.maturity ?? 0, applicable: responses.infra?.enrichment?.applicable !== false },
    { weight: 2, maturity: responses.infra?.realtimeSync?.maturity ?? 0, applicable: responses.infra?.realtimeSync?.applicable !== false }
  ]);

  const attr = moduleScore([
    { weight: 6, maturity: responses.attr?.multiTouch?.maturity ?? 0, applicable: responses.attr?.multiTouch?.applicable !== false },
    { weight: 4, maturity: responses.attr?.dashboards?.maturity ?? 0, applicable: responses.attr?.dashboards?.applicable !== false },
    { weight: 3, maturity: responses.attr?.ctaTracking?.maturity ?? 0, applicable: responses.attr?.ctaTracking?.applicable !== false }
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
  if (responses.outbound?.deliverability?.present && (responses.outbound.deliverability.maturity || 0) < 2) {
    prerequisites.push('Email deliverability needs improvement before scaling outbound');
  }
  if (responses.infra?.crm?.present && (responses.infra.crm.maturity || 0) < 2) {
    prerequisites.push('CRM hygiene needs improvement before advanced automation');
  }
  if (responses.attr?.multiTouch?.present && (responses.attr.multiTouch.maturity || 0) < 2) {
    prerequisites.push('Attribution tracking needs improvement before scaling spend');
  }

  // Risk checks
  if (responses.paid?.ppc?.present && (responses.paid.ppc.maturity || 0) >= 2 && 
      responses.content?.boFuAssets?.present && (responses.content.boFuAssets.maturity || 0) < 2) {
    risks.push('Paid traffic may leak without strong bottom-of-funnel content');
  }
  if (responses.nurture?.scoringTriggers?.present && (responses.nurture.scoringTriggers.maturity || 0) < 2 &&
      responses.nurture?.drip?.present && (responses.nurture.drip.maturity || 0) >= 2) {
    risks.push('Lead scoring needs improvement to optimize nurture sequences');
  }
  if (responses.outbound?.sequences?.present && (responses.outbound.sequences.maturity || 0) >= 2 &&
      responses.outbound?.deliverability?.present && (responses.outbound.deliverability.maturity || 0) < 2) {
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

  const maturityWeights = [0, 0.5, 0.75, 1.0];
  const gaps: Array<{ module: string; lever: string; impact: number; maturity: number }> = [];

  // Calculate gaps for each module
  Object.entries(leverWeights).forEach(([module, levers]) => {
    Object.entries(levers).forEach(([lever, weight]) => {
      const moduleResponses = responses[module as keyof AssessmentResponses];
      if (moduleResponses) {
        const response = (moduleResponses as Record<string, { present?: boolean; maturity?: number | null; applicable?: boolean }>)[lever];
        if (response && response.applicable !== false) {
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

export function checkPrerequisites(responses: AssessmentResponses): string[] {
  const risks: string[] = [];
  
  // Check for critical infrastructure prerequisites
  if (!responses.infra?.crm?.present || (responses.infra?.crm?.maturity || 0) < 1) {
    risks.push('No CRM system in place - this is a prerequisite for most marketing activities');
  }
  
  if (!responses.outbound?.deliverability?.present || (responses.outbound?.deliverability?.maturity || 0) < 1) {
    risks.push('Email deliverability issues detected - outbound campaigns will have poor performance');
  }
  
  if (!responses.infra?.marketingAutomation?.present || (responses.infra?.marketingAutomation?.maturity || 0) < 1) {
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

  const maturityWeights = [0, 0.5, 0.75, 1.0];
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
        const response = (moduleResponses as Record<string, { present?: boolean; maturity?: number | null; applicable?: boolean }>)[lever];
        if (response && response.applicable !== false) {
          const present = response.present || false;
          const maturity = response.maturity || 0;
          const multiplier = maturityWeights[Math.min(maturity, 3)] || 0;
          // Impact = weight × (1 - maturityMultiplier)
          const computedImpact = weight * (1 - multiplier);
          
          structuredGaps.push({
            module,
            lever,
            present,
            maturity,
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

  // Count answered levers (only if present=false OR (present=true AND maturity is set))
  Object.values(responses).forEach(module => {
    if (module) {
      let moduleHasAnswers = false;
      Object.values(module).forEach(lever => {
        if (lever && typeof lever === 'object' && 'present' in lever && 'maturity' in lever && 'applicable' in lever) {
          const typedLever = lever as { present: boolean; maturity: number | null; applicable: boolean };
          // Count as answered if: not applicable OR (present=false) OR (present=true AND maturity is set)
          const isAnswered = typedLever.applicable === false || 
                           !typedLever.present || 
                           (typedLever.present && typedLever.maturity !== null && typedLever.maturity > 0);
          if (isAnswered) {
            answeredLevers++;
            moduleHasAnswers = true;
          }
        }
      });
      if (moduleHasAnswers) modulesAnswered++;
    }
  });

  // Check for critical levers with maturity set
  const hasInfraMaturity = responses.infra?.crm?.maturity !== undefined || 
                          responses.infra?.marketingAutomation?.maturity !== undefined;
  const hasAttrMaturity = responses.attr?.multiTouch?.maturity !== undefined || 
                          responses.attr?.dashboards?.maturity !== undefined;
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
