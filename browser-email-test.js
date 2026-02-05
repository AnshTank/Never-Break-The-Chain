// Browser Console Test Script for Email Debugging
// Copy and paste this into your browser console while on localhost:3000

console.log('🚀 Starting Email Debug Test...');

const CRON_SECRET = 'nbtc-secure-2025';

async function testEmails() {
  const tests = [
    { window: 'morning', name: 'Morning Motivation' },
    { window: 'evening', name: 'Evening Check-in' },
    { window: 'all', name: 'All Types' }
  ];
  
  for (const test of tests) {
    console.log(`\n🧪 Testing ${test.name}...`);
    
    try {
      const response = await fetch(`/api/cron/notifications?window=${test.window}&dryRun=0&secret=${CRON_SECRET}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log(`📊 ${test.name} Result:`, result);
      
      if (result.results?.sent > 0) {
        console.log(`✅ Sent ${result.results.sent} emails`);
        console.log(`📧 Types sent:`, result.results.types);
      } else {
        console.log(`⚠️ No emails sent`);
        console.log(`👥 Eligible users: ${result.results?.eligibleUsers || 0}`);
        console.log(`⏭️ Skipped: ${result.results?.skipped || 0}`);
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error);
    }
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Email testing complete! Check your email and server logs.');
}

// Run the test
testEmails();