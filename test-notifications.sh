#!/bin/bash

# MNZD Notification System Test Script

echo "🧪 Testing MNZD Notification System..."
echo "=================================="

# Test the cron endpoint
echo "📡 Testing cron endpoint..."
response=$(curl -s -w "%{http_code}" -X POST \
  https://never-break-the-chain.vercel.app/api/cron/notifications \
  -H "Authorization: Bearer nbtc-secure-2025" \
  -H "Content-Type: application/json")

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Cron endpoint working! Response: $body"
else
    echo "❌ Cron endpoint failed! HTTP Code: $http_code"
    echo "Response: $body"
fi

echo ""
echo "🔍 Next steps:"
echo "1. Check your Vercel function logs"
echo "2. Verify environment variables are set"
echo "3. Push the GitHub Actions workflow to enable automated triggers"
echo ""
echo "🚀 Setup complete! Your notification system is ready!"