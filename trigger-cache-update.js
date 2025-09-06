#!/usr/bin/env node

// Script to manually trigger cache update with 90-day data
const https = require('https');

console.log('🚀 Triggering cache update with 90-day data...');

const options = {
  hostname: 'analytics-dashboard-ten.vercel.app',
  port: 443,
  path: '/api/update-cache',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-vercel-cron': '1',  // Simulate Vercel cron
    'User-Agent': 'Manual Cache Update Script'
  }
};

const req = https.request(options, (res) => {
  console.log(`📡 Response status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response body:', data);
    if (res.statusCode === 200) {
      console.log('✅ Cache update triggered successfully!');
      console.log('🔄 The dashboard should now have 90-day data within a few minutes.');
    } else {
      console.log('❌ Cache update failed.');
    }
  });
});

req.on('error', (e) => {
  console.error('💥 Request error:', e.message);
});

// Send empty JSON body
req.write('{}');
req.end();

console.log('⏳ Waiting for response...');