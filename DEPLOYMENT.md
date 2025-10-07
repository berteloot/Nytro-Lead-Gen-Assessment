# Deployment Guide

This guide covers multiple deployment options for the Lead Generation Assessment Tool.

## Prerequisites

Before deploying, ensure you have:
- A PostgreSQL database
- OpenAI API key
- (Optional) HubSpot API key
- (Optional) PostHog API key

## Environment Variables

Required environment variables:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
OPENAI_API_KEY="sk-..."
BASE_URL="https://your-domain.com"
```

Optional environment variables:
```env
HUBSPOT_API_KEY="..."
HUBSPOT_SOURCE="leadgen-assessment"
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
```

## Deployment Options

### 1. Render (Recommended)

1. **Connect GitHub Repository**
   - Go to [render.com](https://render.com)
   - Sign up/login and connect your GitHub account
   - Click "New +" → "Web Service"
   - Connect your `leadgen-assessment` repository

2. **Configure Web Service**
   - **Name**: `leadgen-assessment`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter (free tier available)

3. **Create Database**
   - Click "New +" → "PostgreSQL"
   - **Name**: `leadgen-assessment-db`
   - **Plan**: Starter (free tier available)
   - Copy the connection string

4. **Set Environment Variables**
   - In your web service settings, add:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `BASE_URL`: Your Render app URL
     - `NODE_ENV`: `production`

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### 2. Railway

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Sign up/login and connect GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `leadgen-assessment` repository

2. **Add Database**
   - In your project, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

3. **Set Environment Variables**
   - In your service settings, add:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `BASE_URL`: Your Railway app URL
     - `NODE_ENV`: `production`

4. **Deploy**
   - Railway will automatically detect the Node.js app and deploy

### 3. Netlify (Static + Functions)

**Note**: Netlify is better for static sites. For full-stack apps with database, consider Render or Railway.

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login and connect GitHub
   - Click "New site from Git"
   - Select your `leadgen-assessment` repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

3. **Set Environment Variables**
   - In Site settings → Environment variables, add all required variables

4. **Deploy**
   - Click "Deploy site"

### 4. Docker Deployment

For self-hosting or cloud providers that support Docker:

1. **Build and Run with Docker Compose**
   ```bash
   # Set environment variables in .env file
   cp .env.example .env
   # Edit .env with your values
   
   # Build and start
   docker-compose up -d
   ```

2. **Manual Docker Build**
   ```bash
   # Build the image
   docker build -t leadgen-assessment .
   
   # Run with environment variables
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-db-url" \
     -e OPENAI_API_KEY="your-openai-key" \
     -e BASE_URL="http://localhost:3000" \
     leadgen-assessment
   ```

## Post-Deployment Setup

After deployment, you need to:

1. **Run Database Migrations**
   ```bash
   # Connect to your deployed app and run:
   npx prisma migrate deploy
   ```

2. **Seed the Database** (optional)
   ```bash
   npm run db:seed
   ```

3. **Test the Application**
   - Visit your deployed URL
   - Complete a test assessment
   - Verify PDF generation works
   - Check API endpoints

## Health Check

Your app includes a health check endpoint at `/api/health` that you can use to monitor the deployment.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from your deployment platform
   - Check if migrations have been run

2. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify API keys are valid

### Logs and Debugging

- **Render**: Check logs in the Render dashboard
- **Railway**: Use `railway logs` command or dashboard
- **Netlify**: Check function logs in the Netlify dashboard

## Scaling Considerations

- **Database**: Consider upgrading to a managed PostgreSQL service for production
- **Caching**: Add Redis for session management and caching
- **CDN**: Use a CDN for static assets
- **Monitoring**: Set up application monitoring and error tracking
