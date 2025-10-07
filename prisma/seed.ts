import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed benchmark data
  const benchmarks = [
    // Technology industry benchmarks
    { industry: 'technology', dim: 'inbound', p25: 45, p50: 65, p75: 80 },
    { industry: 'technology', dim: 'outbound', p25: 30, p50: 50, p75: 70 },
    { industry: 'technology', dim: 'content', p25: 40, p50: 60, p75: 75 },
    { industry: 'technology', dim: 'paid', p25: 35, p50: 55, p75: 75 },
    { industry: 'technology', dim: 'nurture', p25: 25, p50: 45, p75: 65 },
    { industry: 'technology', dim: 'infra', p25: 30, p50: 50, p75: 70 },
    { industry: 'technology', dim: 'attr', p25: 20, p50: 40, p75: 60 },

    // SaaS industry benchmarks
    { industry: 'saas', dim: 'inbound', p25: 50, p50: 70, p75: 85 },
    { industry: 'saas', dim: 'outbound', p25: 35, p50: 55, p75: 75 },
    { industry: 'saas', dim: 'content', p25: 45, p50: 65, p75: 80 },
    { industry: 'saas', dim: 'paid', p25: 40, p50: 60, p75: 80 },
    { industry: 'saas', dim: 'nurture', p25: 30, p50: 50, p75: 70 },
    { industry: 'saas', dim: 'infra', p25: 35, p50: 55, p75: 75 },
    { industry: 'saas', dim: 'attr', p25: 25, p50: 45, p75: 65 },

    // Healthcare industry benchmarks
    { industry: 'healthcare', dim: 'inbound', p25: 30, p50: 50, p75: 70 },
    { industry: 'healthcare', dim: 'outbound', p25: 25, p50: 45, p75: 65 },
    { industry: 'healthcare', dim: 'content', p25: 35, p50: 55, p75: 75 },
    { industry: 'healthcare', dim: 'paid', p25: 20, p50: 40, p75: 60 },
    { industry: 'healthcare', dim: 'nurture', p25: 15, p50: 35, p75: 55 },
    { industry: 'healthcare', dim: 'infra', p25: 20, p50: 40, p75: 60 },
    { industry: 'healthcare', dim: 'attr', p25: 15, p50: 35, p75: 55 },

    // Finance industry benchmarks
    { industry: 'finance', dim: 'inbound', p25: 35, p50: 55, p75: 75 },
    { industry: 'finance', dim: 'outbound', p25: 30, p50: 50, p75: 70 },
    { industry: 'finance', dim: 'content', p25: 40, p50: 60, p75: 80 },
    { industry: 'finance', dim: 'paid', p25: 25, p50: 45, p75: 65 },
    { industry: 'finance', dim: 'nurture', p25: 20, p50: 40, p75: 60 },
    { industry: 'finance', dim: 'infra', p25: 25, p50: 45, p75: 65 },
    { industry: 'finance', dim: 'attr', p25: 20, p50: 40, p75: 60 },

    // E-commerce industry benchmarks
    { industry: 'ecommerce', dim: 'inbound', p25: 40, p50: 60, p75: 80 },
    { industry: 'ecommerce', dim: 'outbound', p25: 20, p50: 40, p75: 60 },
    { industry: 'ecommerce', dim: 'content', p25: 35, p50: 55, p75: 75 },
    { industry: 'ecommerce', dim: 'paid', p25: 45, p50: 65, p75: 85 },
    { industry: 'ecommerce', dim: 'nurture', p25: 25, p50: 45, p75: 65 },
    { industry: 'ecommerce', dim: 'infra', p25: 30, p50: 50, p75: 70 },
    { industry: 'ecommerce', dim: 'attr', p25: 25, p50: 45, p75: 65 },
  ]

  for (const benchmark of benchmarks) {
    await prisma.benchmark.upsert({
      where: {
        industry_dim: {
          industry: benchmark.industry,
          dim: benchmark.dim,
        },
      },
      update: benchmark,
      create: benchmark,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
