import { NextRequest, NextResponse } from "next/server";

/**
 * EMERGENCY ENDPOINT - NO AUTH REQUIRED
 * This endpoint bypasses authentication to fix Edge Config performance issue
 * Should be removed/secured after the fix is applied
 */
export async function GET() {
  try {
    console.log("🚨 EMERGENCY: Starting cache fix using fallback APIs...");

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // Fetch all data from working fallback APIs
    const fallbackEndpoints = [
      { endpoint: 'fallback-growth-metrics', key: 'growthRateMetrics' },
      { endpoint: 'fallback-time-users', key: 'timeBasedUsers' },
      { endpoint: 'fallback-time-transactions', key: 'timeBasedTransactions' },
      { endpoint: 'fallback-monthly-users', key: 'monthlyUserGrowth' },
      { endpoint: 'fallback-monthly-transactions', key: 'monthlyTransactionGrowth' },
    ];

    console.log("📥 Fetching data from fallback endpoints...");
    const fallbackResults: Record<string, any> = {};
    const results = [];

    for (const { endpoint, key } of fallbackEndpoints) {
      try {
        const response = await fetch(`${baseUrl}/api/${endpoint}`);
        const data = await response.json();

        if (data.success) {
          fallbackResults[key] = data.data;
          results.push(`✅ ${endpoint}: Success`);
          console.log(`✅ ${endpoint}: Got data`);
        } else {
          results.push(`❌ ${endpoint}: Failed - ${data.error}`);
          console.log(`❌ ${endpoint}: Failed -`, data.error);
        }
      } catch (err) {
        results.push(`❌ ${endpoint}: Error - ${err}`);
        console.log(`❌ ${endpoint}: Error -`, err);
      }
    }

    if (Object.keys(fallbackResults).length === 0) {
      throw new Error("No fallback data could be fetched");
    }

    // Get current Edge Config data
    console.log("📖 Reading current Edge Config...");
    const currentResponse = await fetch(`${baseUrl}/api/analytics`);
    const currentData = await currentResponse.json();

    // Merge fallback data with current Edge Config data
    const updatedData = {
      ...currentData,
      ...fallbackResults,
      lastUpdated: new Date().toISOString(),
    };

    console.log("💾 Updating Edge Config...");

    // Update Edge Config
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

    if (!edgeConfigId || !vercelAccessToken) {
      throw new Error("EDGE_CONFIG_ID or VERCEL_ACCESS_TOKEN environment variables are not set");
    }

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

    console.log("🎉 Emergency cache fix completed successfully!");

    return NextResponse.json({
      success: true,
      message: "🚨 EMERGENCY FIX APPLIED: Edge Config updated with real data",
      data: {
        updatedFields: Object.keys(fallbackResults),
        lastUpdated: updatedData.lastUpdated,
        fetchResults: results,
        warning: "This emergency endpoint bypasses authentication and should be secured/removed after use"
      },
    });

  } catch (error) {
    console.error("🚨 Emergency cache fix failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Emergency fix failed - Edge Config not updated"
    }, { status: 500 });
  }
}

// Allow POST as well for flexibility
export async function POST() {
  return GET();
}