import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { scoreAssessment, computeGaps, fallbackLeversFromGaps, extractStack, type AssessmentResponses } from '@/lib/scoring'
import OpenAI from 'openai'
import { recommendationPrompt, type RecommendationInput } from '@/lib/prompts'

const prisma = new PrismaClient()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function getAIRecommendation(input: RecommendationInput) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a B2B demand generation strategist. Return only valid JSON.',
      },
      {
        role: 'user',
        content: recommendationPrompt(input),
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

    let ai;
    try {
      ai = await getAIRecommendation({
        company: body.company ?? '',
        industry: body.industry ?? '',
        scores,
        gaps: computeGaps(scores),
        stack: extractStack(body.responses),
      });
    } catch (e) {
      console.error('OpenAI recommendation failed:', e);
      // deterministic fallback so the client still gets a usable result
      ai = {
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
        growthLevers: ai.levers,
        riskFlags: ai.risks
      }
    });

    return Response.json({ scores, recommendation: ai });
  } catch (err: any) {
    console.error('Score route error', err);
    return Response.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
