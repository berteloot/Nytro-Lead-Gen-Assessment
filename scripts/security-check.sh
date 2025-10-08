#!/bin/bash

# Security Check Script
# This script validates that no API keys or secrets are exposed in the codebase

echo "🔒 Running Security Check..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify .env files are gitignored
echo "📋 Check 1: Verifying .env files are gitignored..."
if grep -q "^\.env\*" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}: .env* files are in .gitignore"
else
    echo -e "${RED}✗ FAIL${NC}: .env* files are NOT properly gitignored"
    exit 1
fi
echo ""

# Check 2: Ensure no .env files are committed
echo "📋 Check 2: Checking for committed .env files..."
if git ls-files | grep -q "\.env"; then
    echo -e "${RED}✗ FAIL${NC}: .env files found in git history"
    git ls-files | grep "\.env"
    exit 1
else
    echo -e "${GREEN}✓ PASS${NC}: No .env files in git repository"
fi
echo ""

# Check 3: Search for hardcoded API keys (common patterns)
echo "📋 Check 3: Scanning for hardcoded API keys..."
PATTERNS=(
    "sk-[a-zA-Z0-9]{40,}"  # OpenAI keys
    "pat-[a-zA-Z0-9-]{20,}"  # HubSpot tokens
    "Bearer [a-zA-Z0-9]{20,}"  # Bearer tokens
    "api_key\s*=\s*['\"][a-zA-Z0-9]{20,}['\"]"  # api_key assignments
)

FOUND_ISSUES=0
for pattern in "${PATTERNS[@]}"; do
    if git grep -i -E "$pattern" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' 2>/dev/null | grep -v "OPENAI_API_KEY" | grep -v "HUBSPOT_API_KEY" | grep -v "process.env" > /dev/null; then
        echo -e "${RED}✗ FAIL${NC}: Potential hardcoded API key found:"
        git grep -i -E "$pattern" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' | grep -v "OPENAI_API_KEY" | grep -v "HUBSPOT_API_KEY" | grep -v "process.env"
        FOUND_ISSUES=1
    fi
done

if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: No hardcoded API keys found"
fi
echo ""

# Check 4: Verify server-side env vars are not exposed to client
echo "📋 Check 4: Checking for client-side exposure of server secrets..."
CLIENT_EXPOSED=$(git grep -E "process\.env\.(OPENAI_API_KEY|HUBSPOT_API_KEY|DATABASE_URL)" -- 'app/**/*.tsx' 'components/**/*.tsx' 2>/dev/null || true)

if [ -n "$CLIENT_EXPOSED" ]; then
    echo -e "${RED}✗ FAIL${NC}: Server-side env vars exposed in client components:"
    echo "$CLIENT_EXPOSED"
    exit 1
else
    echo -e "${GREEN}✓ PASS${NC}: No server secrets exposed to client"
fi
echo ""

# Check 5: Verify NEXT_PUBLIC_ prefix for client-side vars
echo "📋 Check 5: Verifying client-safe environment variables..."
PUBLIC_VARS=$(git grep -h "process\.env\.NEXT_PUBLIC_" | sed -E 's/.*process\.env\.(NEXT_PUBLIC_[A-Z_]+).*/\1/' | sort -u)

if [ -n "$PUBLIC_VARS" ]; then
    echo -e "${YELLOW}ℹ INFO${NC}: Client-exposed variables (these should be public-safe):"
    echo "$PUBLIC_VARS"
else
    echo -e "${GREEN}✓ PASS${NC}: No client-exposed environment variables"
fi
echo ""

# Check 6: Verify API routes use environment variables
echo "📋 Check 6: Verifying API routes use environment variables..."
API_ROUTES=$(find app/api -type f -name "*.ts" 2>/dev/null)
MISSING_ENV_CHECK=0

for route in $API_ROUTES; do
    if grep -q "HUBSPOT\|OPENAI\|DATABASE" "$route" 2>/dev/null; then
        if ! grep -q "process\.env\." "$route" 2>/dev/null; then
            echo -e "${RED}✗ FAIL${NC}: $route may have hardcoded credentials"
            MISSING_ENV_CHECK=1
        fi
    fi
done

if [ $MISSING_ENV_CHECK -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: API routes properly use environment variables"
fi
echo ""

# Check 7: Verify no package-lock.json contains secrets
echo "📋 Check 7: Checking package files for secrets..."
if grep -i -E "(api[_-]?key|secret|password|token).*[:=].*['\"][a-zA-Z0-9]{20,}['\"]" package.json package-lock.json 2>/dev/null | grep -v "description" | grep -v "repository" > /dev/null; then
    echo -e "${RED}✗ FAIL${NC}: Potential secrets found in package files"
    exit 1
else
    echo -e "${GREEN}✓ PASS${NC}: No secrets in package files"
fi
echo ""

# Summary
echo "════════════════════════════════════════"
echo -e "${GREEN}✓ Security Check Complete!${NC}"
echo "════════════════════════════════════════"
echo ""
echo "Recommendations:"
echo "1. Regularly rotate API keys"
echo "2. Use different keys for dev/staging/prod"
echo "3. Monitor API usage for anomalies"
echo "4. Review access logs regularly"
echo "5. Keep dependencies updated"
echo ""
echo "For more details, see SECURITY.md"

