export interface RecommendationInput {
  company: string;
  industry: string;
  scores: {
    inbound: number | null;
    outbound: number | null;
    content: number | null;
    paid: number | null;
    nurture: number | null;
    infra: number | null;
    attr: number | null;
    overall: number;
  };
  gaps: string[];
  stack: string[];
  structuredGaps: Array<{
    module: string;
    lever: string;
    present: boolean;
    maturity: number;
    weight: number;
    multiplier: number;
    computedImpact: number;
  }>;
  prerequisites: string[];
  confidence: 'low' | 'medium' | 'high';
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

export const recommendationPrompt = (input: RecommendationInput, calibration?: { monthlyLeads: string; meetingRate: string; salesCycle: string }): string => `
You are a B2B growth strategist for mid-market tech companies. Use ONLY the supplied inputs. Do NOT invent metrics, percentages, or tools. Tie each recommendation to a specific lever gap. If inputs are sparse, state that confidence is low.

Company: ${input.company}
Industry: ${input.industry}
Scores: ${JSON.stringify(input.scores)}
Gaps: ${input.gaps.join(", ")}
Stack: ${input.stack.join(", ")}
Confidence Level: ${input.confidence}
Prerequisites: ${input.prerequisites.join(", ")}

Top Gap Analysis (use only these computed values):
${input.structuredGaps.slice(0, 10).map(gap => 
  `${gap.module}.${gap.lever}: present=${gap.present}, maturity=${gap.maturity}, impact=${gap.computedImpact.toFixed(1)}`
).join('\n')}

${calibration ? `Calibration Data: Monthly Leads: ${calibration.monthlyLeads}, Meeting Rate: ${calibration.meetingRate}, Sales Cycle: ${calibration.salesCycle}` : 'No calibration data provided'}

Return ONLY valid JSON in this exact format:
{
  "summary": "string, 120–160 words, neutral tone",
  "outcome": "Foundation|Momentum|Optimization",
  "scorecard": {
    "overall": ${input.scores.overall},
    "modules": [
      {"name": "Inbound Marketing", "score": ${input.scores.inbound}},
      {"name": "Outbound Sales", "score": ${input.scores.outbound}},
      {"name": "Content Marketing", "score": ${input.scores.content}},
      {"name": "Paid Advertising", "score": ${input.scores.paid}},
      {"name": "Lead Nurturing", "score": ${input.scores.nurture}},
      {"name": "Marketing Infrastructure", "score": ${input.scores.infra}},
      {"name": "Attribution & Analytics", "score": ${input.scores.attr}}
    ]
  },
  "top_gaps": [
    {"lever": "string", "reason": "string", "impact_score": number}
  ],
  "quick_wins_30_days": ["string", "string", "string"],
  "60_90_day_priorities": ["string", "string", "string"],
  "risks_if_ignored": ["string", "string"],
  "confidence": "${input.confidence}"
}

CRITICAL GUARDRAILS:
- "Do not invent metrics or stack. Tie every recommendation to a specific lever gap or calibration answer."
- "If inputs are sparse, lower confidence and state that more data is needed."
- "If a module has no present levers, do not invent recommendations. Offer prerequisites only."
- "Prefer actions that measurably reduce CAC or shorten time to first meeting."
- "Tie every recommendation to the specific gaps detected."
- "No absolutes, no hand-wavy advice. Use verbs, owners, and simple measures."
- "Keep tone neutral and non-judgmental."
- "Focus on the 3 lowest-scoring areas, but balance critique with encouragement."
- "Use the tone of a strategic coach: clear, forward-looking, never negative or passive-aggressive."
- "Avoid jargon and judgmental phrasing. Replace 'lacks,' 'fails,' or 'missing' with 'could strengthen,' 'has room to refine,' or 'is ready to expand.'"
- "When possible, tie recommendations to best practices such as personalized content, marketing–sales alignment, and scalable automation."
- "Consider their current tech stack when making recommendations."
- "Be honest about their current maturity level: if overall score is 0-20, acknowledge they're starting from the beginning; if 20-40, they have some basics in place; if 40+, they have a solid foundation."
- "Don't claim they have a 'strong foundation' or 'promising maturity' if their overall score is below 30."
- "For very low scores (0-15), focus on foundational recommendations rather than advanced strategies."
- "Prioritize levers with highest ROI-to-effort ratio."
- "Consider interdependencies (e.g., content fuels both inbound and nurture)."
- "Flag if foundational infra is missing before recommending advanced tactics."
- "If overall < 20: Focus ONLY on foundational capabilities (CRM, basic content, one channel)."
- "If overall < 30: Add 'Start here: [foundational step]' before advanced recommendations."
- "If calibration data is missing, acknowledge limitations in recommendations."
`;

export const summaryPrompt = (input: RecommendationInput): string => `
You are a seasoned B2B marketing advisor who understands how tech startups and mid-market teams build momentum over time. 
Summarize this company's lead generation maturity in a way that feels confident, forward-looking, and encouraging.

Company: ${input.company}
Industry: ${input.industry}
Overall Score: ${input.scores.overall}/100
Top Gaps: ${input.gaps.slice(0, 3).join(", ")}

Write 2–3 sentences that:
1. Accurately reflect their current maturity level based on their actual score.
2. Point out where the biggest opportunity for growth lies—without judgment.
3. End with a positive outlook that suggests clear, achievable next steps.

Tone: Supportive, professional, and optimistic—never condescending or passive-aggressive. 
Use plain, conversational language that feels consultative and tailored to their situation.

- Keep the total summary under 60 words.
- When relevant, tie examples or recommendations to ${input.industry} practices or norms.
- Never include negative framing or language such as "weak," "bad," "poor," or "wrong."
- Be honest about their current state: if they scored 0-20, acknowledge they're just getting started; if 20-40, they have some basics; if 40+, they have a solid foundation.
- Don't claim they have a "strong foundation" if their overall score is below 30.
`;

export const ctaPrompt = (input: RecommendationInput, topLever: string): string => `
You are a growth consultant who motivates marketing teams to take the next confident step. 
Write a short, motivating call-to-action that feels personal and outcome-oriented.

Company: ${input.company}
Industry: ${input.industry}
Top Priority: ${topLever}
Current Score: ${input.scores.overall}/100

Write 1–2 sentences that:
1. Reference their opportunity clearly (not their gap).
2. Emphasize the value or transformation they can achieve.
3. Encourage action with warmth and confidence—no hard sell, just a natural next step.

Tone: Positive, constructive, and specific.
Example: "You've already built a strong foundation—let's turn ${topLever.toLowerCase()} into a growth engine. Book your free strategy session to see how."

- Keep to a maximum of 35 words.
- Where possible, connect the CTA to ${input.industry} growth patterns or customer expectations.
- Never use guilt, pressure, or negative framing (e.g., "don't miss out," "falling behind").
`;

export const industryBenchmarkPrompt = (input: RecommendationInput): string => `
You are a B2B marketing analyst with deep knowledge of ${input.industry} industry best practices.
Provide industry-specific context and competitive insights for this company's assessment.

Company: ${input.company}
Industry: ${input.industry}
Scores: ${JSON.stringify(input.scores)}
Current Stack: ${input.stack.join(", ")}

Return ONLY valid JSON in this exact format:
{
  "industryBenchmark": "Contextualize their score using these ranges: 0-20 (Early-stage), 21-40 (Developing), 41-60 (Maturing), 61-80 (Advanced), 81-100 (Best-in-class)",
  "competitiveAdvantage": "What they're doing well compared to industry peers",
  "marketOpportunity": "Specific ${input.industry} market trends they could leverage",
  "implementationTimeline": "Realistic timeline for implementing recommendations in ${input.industry} context"
}

Guidelines:
- Use the score ranges provided above to contextualize their performance
- Reference industry buying cycles and decision-making processes
- Include relevant market trends and opportunities
- Keep each field under 50 words
- Be encouraging but realistic about industry challenges
- Focus on maturity levels rather than exact benchmarks
`;
