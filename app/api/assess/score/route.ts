import { PrismaClient } from '@prisma/client'
import { scoreAssessment, computeGaps, fallbackLeversFromGaps, extractStack } from '@/lib/scoring'
import OpenAI from 'openai'
import { recommendationPrompt, type RecommendationInput } from '@/lib/prompts'

// Prevent prerendering and force Node runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const prisma = new PrismaClient()

async function getAIRecommendation(client: OpenAI, input: RecommendationInput) {
  const prompt = recommendationPrompt(input);
  
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a B2B demand generation strategist. Return only valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const aiResponse = completion.choices[0]?.message?.content
  if (aiResponse) {
    return JSON.parse(aiResponse)
  }
  throw new Error('No AI response received')
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // basic guard so 400s are explicit
    if (!body?.responses) {
      return Response.json({ error: 'Invalid payload: responses missing' }, { status: 400 });
    }

    const scores = scoreAssessment(body.responses);

    // Lazy construct client only if a key exists at REQUEST time
    const apiKey = process.env.OPENAI_API_KEY;
    let recommendation: { summary: string; levers: Array<{ name: string; why: string; expectedImpact: string; confidence: string; firstStep: string }>; risks: string[] };

    if (apiKey) {
      try {
        const client = new OpenAI({ apiKey });
        recommendation = await getAIRecommendation(client, {
          company: body.company ?? '',
          industry: body.industry ?? '',
          scores,
          gaps: computeGaps(scores),
          stack: extractStack(body.responses),
        });
      } catch (e) {
        console.error('OpenAI recommendation failed:', e);
        recommendation = {
          summary: 'Assessment completed successfully. Here are your key growth opportunities.',
          levers: fallbackLeversFromGaps(scores),
          risks: [],
        };
      }
    } else {
      // No key at runtime. Use deterministic fallback.
      recommendation = {
        summary: 'Assessment completed successfully. Here are your key growth opportunities.',
        levers: fallbackLeversFromGaps(scores),
        risks: [],
      };
    }

    // persist and respond
    await prisma.assessment.update({
      where: { id: body.assessmentId },
      data: { 
        scoreInbound: scores.inbound,
        scoreOutbound: scores.outbound,
        scoreContent: scores.content,
        scorePaid: scores.paid,
        scoreNurture: scores.nurture,
        scoreInfra: scores.infra,
        scoreAttribution: scores.attr,
        scoreOverall: scores.overall,
        growthLevers: recommendation.levers,
        riskFlags: recommendation.risks
      }
    });

    return Response.json({ scores, recommendation });
  } catch (err: unknown) {
    console.error('Score route error', err);
    return Response.json({ error: (err as Error)?.message ?? 'Unexpected error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
