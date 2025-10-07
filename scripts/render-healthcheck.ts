#!/usr/bin/env tsx

/**
 * Health check script for Render deployment
 * This script can be used as a health check endpoint or run manually
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function healthCheck() {
  try {
    console.log('🔍 Starting health check...')
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection: OK')
    
    // Test basic Prisma operations
    const userCount = await prisma.user.count()
    console.log(`✅ Database operations: OK (${userCount} users)`)
    
    // Test environment variables
    const requiredEnvVars = ['DATABASE_URL']
    const optionalEnvVars = ['OPENAI_API_KEY', 'HUBSPOT_API_KEY', 'NEXT_PUBLIC_POSTHOG_KEY']
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`)
      }
    }
    console.log('✅ Required environment variables: OK')
    
    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ Optional environment variable ${envVar}: OK`)
      } else {
        console.log(`⚠️  Optional environment variable ${envVar}: Not set`)
      }
    }
    
    console.log('🎉 Health check passed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Health check failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  healthCheck()
}

export { healthCheck }
