#!/usr/bin/env node

/**
 * Script to populate Edge Config with real data from fallback APIs
 * This bypasses GraphQL issues by using our working fallback endpoints
 */

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://analytics-dashboard-941u.vercel.app';

async function fetchFallbackData() {
  console.log('Fetching data from fallback endpoints...');
  
  const endpoints = [
    'fallback-growth-metrics',
    'fallback-time-users', 
    'fallback-time-transactions',
    'fallback-monthly-users',
    'fallback-monthly-transactions',
    'fallback-assets',
    'fallback-stream-properties',
    'fallback-category-distribution',
    'fallback-duration-stats',
    'fallback-total-streams',
    'fallback-active-completed',
    'fallback-monthly-streams'
  ];

  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Fetching ${endpoint}...`);
      const response = await fetch(`${baseUrl}/api/${endpoint}`);
      const data = await response.json();
      
      if (data.success) {
        const key = endpoint.replace('fallback-', '');
        results[key] = data.data;
        console.log(`✅ ${endpoint}: Got ${JSON.stringify(data.data).length} chars`);
      } else {
        console.log(`❌ ${endpoint}: Failed -`, data.error);
      }
    } catch (err) {
      console.log(`❌ ${endpoint}: Error -`, err.message);
    }
  }

  return results;
}

// Map fallback endpoints to Edge Config field names
function mapToEdgeConfigFormat(fallbackData) {
  return {
    growthRateMetrics: fallbackData['growth-metrics'],
    timeBasedUsers: fallbackData['time-users'],
    timeBasedTransactions: fallbackData['time-transactions'], 
    monthlyUserGrowth: fallbackData['monthly-users'],
    monthlyTransactionGrowth: fallbackData['monthly-transactions'],
    topAssets: fallbackData['assets'],
    streamProperties: fallbackData['stream-properties'],
    streamCategoryDistribution: fallbackData['category-distribution'],
    streamDurationStats: fallbackData['duration-stats'],
    totalVestingStreams: fallbackData['total-streams'],
    activeVsCompletedStreams: fallbackData['active-completed'],
    monthlyStreamCreation: fallbackData['monthly-streams'],
    lastUpdated: new Date().toISOString()
  };
}

async function main() {
  try {
    const fallbackData = await fetchFallbackData();
    const edgeConfigData = mapToEdgeConfigFormat(fallbackData);
    
    console.log('\n📋 Edge Config data to use:');
    console.log(JSON.stringify(edgeConfigData, null, 2));
    
    console.log('\n💡 To apply this data:');
    console.log('1. Copy the JSON above');
    console.log('2. Go to Vercel Dashboard > Edge Config');
    console.log('3. Update the config with this data');
    console.log('4. This will make Edge Config work instead of fallback APIs');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

if (require.main === module) {
  main();
}