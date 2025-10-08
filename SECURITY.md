# Security Documentation

## Environment Variables

This application uses environment variables to securely manage API keys and sensitive configuration. **Never commit `.env` files or hardcode API keys in your code.**

### Required Environment Variables

| Variable | Description | Example | Where Used |
|----------|-------------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Database connection |
| `OPENAI_API_KEY` | OpenAI API key for AI recommendations | `sk-...` | AI scoring endpoint |
| `BASE_URL` | Application base URL | `https://yourdomain.com` | PDF generation, links |

### Optional Environment Variables

| Variable | Description | Example | Where Used |
|----------|-------------|---------|------------|
| `HUBSPOT_API_KEY` | HubSpot private app token | `pat-...` | CRM integration |
| `HUBSPOT_SOURCE` | Source identifier for HubSpot | `leadgen-assessment` | HubSpot metadata |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key | `phc_...` | Client-side analytics |

### Setup Instructions

#### Local Development

1. **Create a local environment file:**
   ```bash
   touch .env
   ```

2. **Add your environment variables** (see [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) for full template):
   ```env
   # Database (Required)
   DATABASE_URL="postgresql://username:password@localhost:5432/leadgen_assessment"
   
   # OpenAI (Required)
   OPENAI_API_KEY="sk-..."
   
   # Application (Required)
   BASE_URL="http://localhost:3000"
   
   # HubSpot (Optional)
   HUBSPOT_API_KEY="pat-..."
   
   # Analytics (Optional)
   NEXT_PUBLIC_POSTHOG_KEY="phc_..."
   ```

3. **Verify `.env*` files are gitignored:**
   ```bash
   # This should show .env* in .gitignore
   grep "\.env" .gitignore
   ```

#### Production (Render)

For production deployment:

1. **Using render.yaml** (Recommended):
   - The `render.yaml` file in the project root automatically configures environment variables
   - Update the values in Render dashboard after initial deployment

2. **Manual Setup**:
   - Go to Render dashboard → Your Service → Environment
   - Add each environment variable from the template
   - Click "Save Changes" to redeploy

## Security Best Practices

### ✅ DO:
- Store all API keys and secrets in environment variables
- Use `process.env.VARIABLE_NAME` in server-side code only
- Prefix client-side variables with `NEXT_PUBLIC_`
- Keep `.env*` files in `.gitignore`
- Use different API keys for development and production
- Rotate API keys regularly
- Use private app tokens for HubSpot (they're more secure than API keys)

### ❌ DON'T:
- Hardcode API keys in source code
- Commit `.env` files to version control
- Expose server-side API keys to the client
- Share API keys in chat, email, or documentation
- Use production API keys in development
- Log API keys in console or error messages

## API Key Security by Service

### OpenAI API Key
- **Security Level**: High - Server-side only
- **Location**: Server-side API routes only
- **Access**: Never exposed to client
- **Usage**: `/app/api/assess/score/route.ts`

### HubSpot API Key
- **Security Level**: High - Server-side only
- **Location**: Server-side API routes only
- **Access**: Never exposed to client
- **Usage**: 
  - `/app/api/hubspot/create-contact/route.ts`
  - `/app/api/hubspot/sync/route.ts`
  - `/lib/hubspot.ts`

### Database URL
- **Security Level**: Critical - Server-side only
- **Location**: Prisma client (server-side)
- **Access**: Never exposed to client
- **Usage**: All Prisma database operations

### PostHog Key
- **Security Level**: Low - Public analytics key
- **Location**: Client-side (NEXT_PUBLIC_ prefix)
- **Access**: Safely exposed to client
- **Usage**: Analytics tracking (public by design)

## Deployment Security Checklist

Before deploying to production:

- [ ] All `.env*` files are in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] Environment variables configured in hosting platform
- [ ] Production API keys are different from development
- [ ] Database credentials are secure
- [ ] HTTPS is enforced for production
- [ ] API rate limiting is configured
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date

## Incident Response

If an API key is compromised:

1. **Immediately revoke** the compromised key in the service provider dashboard
2. **Generate a new key** with the same permissions
3. **Update the environment variable** in all environments
4. **Redeploy the application** with the new key
5. **Review access logs** for unauthorized usage
6. **Rotate all related credentials** as a precaution

## Monitoring

Regularly check:
- API key usage in service dashboards
- Unusual traffic patterns
- Failed authentication attempts
- Error logs for potential security issues

## Contact

For security concerns, please contact: [Your Security Contact]

Last updated: 2025-10-08

