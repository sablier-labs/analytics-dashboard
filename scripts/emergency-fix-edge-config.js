#!/usr/bin/env node

/**
 * EMERGENCY SCRIPT - Fix Edge Config with real data from fallback endpoints
 * This script bypasses the deployment issue and directly updates Edge Config
 */

console.log("🚨 EMERGENCY: Starting Edge Config fix script...");

const VERCEL_URL = "https://analytics-dashboard-941u.vercel.app";

async function main() {
  try {
    // Environment variables check
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

    if (!edgeConfigId || !vercelAccessToken) {
      console.error("❌ Missing required environment variables:");
      console.error("   EDGE_CONFIG_ID:", edgeConfigId ? "✓" : "❌");
      console.error("   VERCEL_ACCESS_TOKEN:", vercelAccessToken ? "✓" : "❌");
      console.log("\n📋 To run this script:");
      console.log("export EDGE_CONFIG_ID=your_edge_config_id");
      console.log("export VERCEL_ACCESS_TOKEN=your_vercel_token");
      console.log("node scripts/emergency-fix-edge-config.js");
      process.exit(1);
    }

    console.log("📥 Fetching data from fallback endpoints...");

    // Fetch all data from working fallback APIs
    const fallbackEndpoints = [
      { endpoint: 'fallback-growth-metrics', key: 'growthRateMetrics' },
      { endpoint: 'fallback-time-users', key: 'timeBasedUsers' },
      { endpoint: 'fallback-time-transactions', key: 'timeBasedTransactions' },
      { endpoint: 'fallback-monthly-users', key: 'monthlyUserGrowth' },
      { endpoint: 'fallback-monthly-transactions', key: 'monthlyTransactionGrowth' },
    ];

    const fallbackResults = {};
    const results = [];

    for (const { endpoint, key } of fallbackEndpoints) {
      try {
        console.log(`  📡 Fetching ${endpoint}...`);
        const response = await fetch(`${VERCEL_URL}/api/${endpoint}`);
        const data = await response.json();

        if (data.success) {
          fallbackResults[key] = data.data;
          results.push(`✅ ${endpoint}: Success (${JSON.stringify(data.data).length} chars)`);
          console.log(`    ✅ Got data: ${Object.keys(data.data).join(', ')}`);
        } else {
          results.push(`❌ ${endpoint}: Failed - ${data.error}`);
          console.log(`    ❌ Failed: ${data.error}`);
        }
      } catch (err) {
        results.push(`❌ ${endpoint}: Error - ${err.message}`);
        console.log(`    ❌ Error: ${err.message}`);
      }
    }

    if (Object.keys(fallbackResults).length === 0) {
      throw new Error("No fallback data could be fetched");
    }

    console.log(`\n📊 Successfully fetched ${Object.keys(fallbackResults).length}/5 datasets`);

    // Get current Edge Config data
    console.log("📖 Reading current Edge Config...");
    const currentResponse = await fetch(`${VERCEL_URL}/api/analytics`);
    const currentData = await currentResponse.json();
    console.log("   📋 Current cached data keys:", Object.keys(currentData).join(', '));

    // Merge fallback data with current Edge Config data
    const updatedData = {
      ...currentData,
      ...fallbackResults,
      lastUpdated: new Date().toISOString(),
    };

    console.log("\n💾 Updating Edge Config...");
    console.log("   🔄 Updating keys:", Object.keys(fallbackResults).join(', '));

    // Update Edge Config
    const updateResponse = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vercelAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            operation: "update",
            key: "analytics",
            value: updatedData,
          },
        ],
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update Edge Config: ${updateResponse.status} ${errorText}`);
    }

    console.log("\n🎉 EMERGENCY FIX COMPLETED SUCCESSFULLY!");
    console.log("✅ Edge Config updated with real data");
    console.log(`📊 Updated fields: ${Object.keys(fallbackResults).join(', ')}`);
    console.log(`⏰ Last updated: ${updatedData.lastUpdated}`);

    console.log("\n📋 Summary:");
    results.forEach(result => console.log(`   ${result}`));

    console.log("\n🚀 Components should now load fast from Edge Config instead of slow fallback APIs");
    console.log("⚠️  Remember to secure/remove the emergency endpoint after confirming the fix");

  } catch (error) {
    console.error("\n🚨 Emergency fix failed:", error.message);
    console.error("💡 The components will continue to work via fallback APIs (slowly)");
    process.exit(1);
  }
}

main();