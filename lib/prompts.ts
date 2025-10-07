export interface RecommendationInput {
  company: string;
  industry: string;
  scores: {
    inbound: number;
    outbound: number;
    content: number;
    paid: number;
    nurture: number;
    infra: number;
    attr: number;
    overall: number;
  };
  gaps: string[];
  stack: string[];
}

export interface Lever {
  name: string;
  why: string;
  expectedImpact: string;
  confidence: "low" | "medium" | "high";
  firstStep: string;
}

export interface AIRecommendation {
  summary: string;
  levers: Lever[];
  risks: string[];
}

export const recommendationPrompt = (input: RecommendationInput): string => `
You are an experienced B2B demand generation strategist specializing in tech startups and mid-market companies. 
Analyze the assessment data below and create a concise, *uplifting* set of insights. Your goal is to help the user see clear next steps and potential gains, not to dwell on gaps.

Company: ${input.company}
Industry: ${input.industry}
Scores: ${JSON.stringify(input.scores)}
Gaps: ${input.gaps.join(", ")}
Stack: ${input.stack.join(", ")}

Return ONLY valid JSON in this exact format:
{
  "summary": "2–3 sentences that highlight their current maturity with an optimistic tone, pointing to what's working and where the biggest upside lies.",
  "levers": [
    {
      "name": "Specific lever name (e.g., 'Lifecycle Nurture Sequences')",
      "why": "Brief, confident explanation of why this lever could move results forward, ideally referencing buyer journey or conversion optimization.",
      "expectedImpact": "Quantified or directional benefit (e.g., '15–25% lift in qualified pipeline' or 'improved MQL-to-SQL velocity').",
      "confidence": "low|medium|high",
      "firstStep": "Concrete, realistic first action they can take within a week—positive and achievable."
    }
  ],
  "risks": [
    "List 1–3 gentle cautionary notes framed as opportunities for improvement (e.g., 'Leads may stall without consistent follow-up cadence')."
  ]
}

Guidelines:
- Focus on the 3 lowest-scoring areas, but balance critique with encouragement.
- Use the tone of a strategic coach: clear, forward-looking, never negative or passive-aggressive.
- Avoid jargon and judgmental phrasing. Replace "lacks," "fails," or "missing" with "could strengthen," "has room to refine," or "is ready to expand."
- When possible, tie recommendations to best practices such as personalized content, marketing–sales alignment, and scalable automation.
`;

export const summaryPrompt = (input: RecommendationInput): string => `
You are a B2B demand generation expert. Write a brief, professional summary of this company's lead generation maturity.

Company: ${input.company}
Industry: ${input.industry}
Overall Score: ${input.scores.overall}/100
Top Gaps: ${input.gaps.slice(0, 3).join(", ")}

Write 2-3 sentences that:
1. Acknowledge their current state
2. Highlight their biggest opportunity
3. Set expectations for improvement

Tone: Professional, encouraging, specific to their industry.
`;

export const ctaPrompt = (input: RecommendationInput, topLever: string): string => `
You are a B2B demand generation consultant. Write compelling copy for a call-to-action.

Company: ${input.company}
Industry: ${input.industry}
Top Priority: ${topLever}
Current Score: ${input.scores.overall}/100

Write 1-2 sentences that:
1. Reference their specific situation
2. Promise a clear outcome
3. Create urgency

Tone: Direct, benefit-focused, professional.
Example: "Ready to implement ${topLever} and boost your lead conversion by 20%? Book a free 15-minute audit to get started."
`;
