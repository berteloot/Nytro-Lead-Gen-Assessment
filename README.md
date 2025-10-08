# Lead Generation Assessment Tool

A comprehensive B2B lead generation assessment tool built with Next.js 14, TypeScript, and AI-powered recommendations.

## Features

- **Multi-step Assessment Form**: 5-step questionnaire covering 7 key marketing areas
- **Deterministic Scoring**: Transparent scoring algorithm for lead generation maturity
- **AI-Powered Insights**: OpenAI integration for personalized recommendations
- **PDF Report Generation**: Professional PDF reports with @react-pdf/renderer
- **HubSpot Integration**: Optional CRM sync for contacts and deals
- **Modern UI**: Built with Tailwind CSS and responsive design
- **Analytics Ready**: PostHog integration for funnel tracking

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-3.5-turbo for recommendations
- **PDF**: @react-pdf/renderer for server-side generation
- **CRM**: HubSpot REST API (optional)
- **Analytics**: PostHog (optional)
- **Hosting**: Render (Web Service + Managed Postgres)

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- (Optional) HubSpot API key
- (Optional) PostHog API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leadgen-assessment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file for local development
touch .env
```

Edit `.env` with your configuration (see [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) for full template):
```env
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/leadgen_assessment"
OPENAI_API_KEY="sk-..."
BASE_URL="http://localhost:3000"

# Optional
HUBSPOT_API_KEY="pat-..."  # HubSpot private app token
NEXT_PUBLIC_POSTHOG_KEY="phc_..."  # Analytics (public, safe for client)
```

**Security Note**: `.env` files are gitignored and never committed. See [SECURITY.md](./SECURITY.md) for details.

4. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
leadgen-assessment/
├── app/                    # Next.js App Router
│   ├── (marketing)/       # Marketing pages
│   ├── assess/            # Assessment flow
│   └── api/               # API routes
├── components/            # React components
│   ├── forms/            # Form components
│   ├── results/          # Results dashboard
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── scoring.ts        # Scoring algorithm
│   ├── prompts.ts        # OpenAI prompts
│   ├── pdf.tsx           # PDF generation
│   ├── hubspot.ts        # HubSpot integration
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema and migrations
└── scripts/              # Deployment scripts
```

## API Endpoints

- `POST /api/assess/submit` - Submit assessment responses
- `POST /api/assess/score` - Score assessment and get AI recommendations
- `GET /api/pdf/[id]` - Generate and download PDF report
- `POST /api/hubspot/sync` - Sync assessment to HubSpot (optional)
- `GET /api/health` - Health check endpoint

## Scoring Algorithm

The assessment uses a deterministic scoring system across 7 modules:

1. **Inbound Marketing** (20% weight)
2. **Outbound Sales** (15% weight)
3. **Content Marketing** (15% weight)
4. **Paid Advertising** (15% weight)
5. **Lead Nurturing** (15% weight)
6. **Marketing Infrastructure** (10% weight)
7. **Attribution & Analytics** (10% weight)

Each module is scored based on:
- **Presence**: Whether the lever is implemented (0 or 1)
- **Maturity**: Implementation quality (1-5 scale)
- **Performance**: Optional performance multiplier (0.8-1.2)

## AI Integration

OpenAI GPT-3.5-turbo is used to generate:
- Executive summary of assessment results
- Top 3 growth opportunities with impact estimates
- Risk flags and compliance considerations
- Personalized next steps

## Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure build settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables
5. Create a Managed Postgres database
6. Update `DATABASE_URL` with the new connection string

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key (server-side only)
- `BASE_URL` - Application base URL

**Optional:**
- `HUBSPOT_API_KEY` - HubSpot private app token for CRM integration (server-side only)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog key for analytics (public, client-safe)
- `HUBSPOT_SOURCE` - Source identifier for HubSpot

**Security:** All sensitive keys are server-side only. See [SECURITY.md](./SECURITY.md) for complete security documentation.

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npx prisma migrate reset
```

### Health Check

```bash
# Run health check
npx tsx scripts/render-healthcheck.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Security

This application follows security best practices for API key management:

- All sensitive credentials are server-side only
- Environment variables are properly protected
- No API keys are exposed to clients
- Automated security validation included

**Run security check:**
```bash
npm run security-check
```

**Documentation:**
- [SECURITY.md](./SECURITY.md) - Security best practices
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Security audit report
- [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) - Environment variables template

## Support

For support, email support@example.com or create an issue in the repository.