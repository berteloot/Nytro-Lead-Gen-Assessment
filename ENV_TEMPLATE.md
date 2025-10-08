# Environment Variables Template

Copy this template to create your `.env.local` file for local development or configure these variables in your hosting platform for production.

```env
# =============================================================================
# DATABASE (Required)
# =============================================================================
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://username:password@localhost:5432/leadgen_assessment"

# =============================================================================
# OPENAI (Required for AI Recommendations)
# =============================================================================
# OpenAI API key for AI-powered recommendations
# Get from: https://platform.openai.com/api-keys
# Security: Server-side only, never exposed to client
OPENAI_API_KEY="sk-..."

# =============================================================================
# APPLICATION (Required)
# =============================================================================
# Base URL of your application
# Development: http://localhost:3000
# Production: https://yourdomain.com
BASE_URL="http://localhost:3000"

# =============================================================================
# HUBSPOT (Optional - for CRM Integration)
# =============================================================================
# HubSpot private app token (recommended) or API key
# Get from: HubSpot Settings → Integrations → Private Apps
# Security: Server-side only, never exposed to client
HUBSPOT_API_KEY="pat-..."

# Source identifier for HubSpot records
HUBSPOT_SOURCE="leadgen-assessment"

# =============================================================================
# ANALYTICS (Optional)
# =============================================================================
# PostHog analytics key
# Get from: https://posthog.com
# Security: Client-safe public key (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."

# =============================================================================
# ENVIRONMENT
# =============================================================================
# Node environment
# Options: development, production, test
NODE_ENV="development"
```

## Quick Setup

### Local Development

1. **Create local environment file:**
   ```bash
   touch .env
   ```

2. **Copy the template above** into `.env`

3. **Replace placeholder values** with your actual credentials

4. **Verify `.env` is gitignored:**
   ```bash
   grep "\.env" .gitignore
   # Should show: .env*
   ```

### Production (Render)

For production deployment on Render:

1. Go to your Render dashboard
2. Navigate to your web service
3. Click on "Environment" in the sidebar
4. Add each environment variable from the template above
5. Click "Save Changes"

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Security Notes

- **Never commit** `.env` files to version control
- **Server-side only** variables: DATABASE_URL, OPENAI_API_KEY, HUBSPOT_API_KEY
- **Client-safe** variables: NEXT_PUBLIC_POSTHOG_KEY (public analytics key)
- **Use different keys** for development and production
- **Rotate keys regularly** for security

For detailed security documentation, see [SECURITY.md](./SECURITY.md)

