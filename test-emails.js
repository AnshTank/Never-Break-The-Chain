// Test script to force send all email types for debugging
// Run with: node test-emails.js

const CRON_SECRET = 'nbtc-secure-2025';
const BASE_URL = 'http://localhost:3000'; // Change to your local dev server

async function testEmailType(window, description) {
  console.log(`\n🧪 Testing ${description}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/cron/notifications?window=${window}&dryRun=0&secret=${CRON_SECRET}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log(`✅ ${description} Response:`, JSON.stringify(result, null, 2));
    
    if (result.results?.sent > 0) {
      console.log(`📧 Successfully sent ${result.results.sent} ${description} emails`);
    } else {
      console.log(`⚠️ No ${description} emails sent - check eligibility or timing`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ ${description} test failed:`, error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive email testing...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`🔑 Using secret: ${CRON_SECRET}`);
  
  // Test all email types
  const tests = [
    { window: 'morning', description: 'Morning Motivation' },
    { window: 'evening', description: 'Evening Check-in' },
    { window: 'weekly', description: 'Weekly Summary' },
    { window: 'all', description: 'All Email Types' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEmailType(test.window, test.description);
    results.push({ ...test, result });
    
    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  
  let totalSent = 0;
  let totalFailed = 0;
  
  results.forEach(({ description, result }) => {
    if (result) {
      const sent = result.results?.sent || 0;
      const failed = result.results?.failed || 0;
      totalSent += sent;
      totalFailed += failed;
      
      console.log(`${description}: ${sent} sent, ${failed} failed`);
      
      if (result.results?.types) {
        Object.entries(result.results.types).forEach(([type, count]) => {
          console.log(`  - ${type}: ${count}`);
        });
      }
    } else {
      console.log(`${description}: TEST FAILED`);
    }
  });
  
  console.log(`\nTOTAL: ${totalSent} sent, ${totalFailed} failed`);
  
  if (totalSent === 0) {
    console.log('\n⚠️ NO EMAILS SENT - Possible issues:');
    console.log('1. No users in database with emailNotifications enabled');
    console.log('2. All notifications were recently sent (cooldown period)');
    console.log('3. Email service configuration issues');
    console.log('4. Database connection problems');
    console.log('5. User has no progress data');
    console.log('\n💡 Check the server logs for detailed debugging information');
  }
}

// Run the tests
runAllTests().catch(console.error);