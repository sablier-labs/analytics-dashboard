import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting force cache update using fallback APIs...");

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

    console.log("Fetching data from fallback endpoints...");
    const fallbackResults: Record<string, any> = {};

    for (const { endpoint, key } of fallbackEndpoints) {
      try {
        const response = await fetch(`${baseUrl}/api/${endpoint}`);
        const data = await response.json();

        if (data.success) {
          fallbackResults[key] = data.data;
          console.log(`✅ ${endpoint}: Got data`);
        } else {
          console.log(`❌ ${endpoint}: Failed -`, data.error);
        }
      } catch (err) {
        console.log(`❌ ${endpoint}: Error -`, err);
      }
    }

    // Get current Edge Config data
    const currentResponse = await fetch(`${baseUrl}/api/analytics`);
    const currentData = await currentResponse.json();

    // Merge fallback data with current Edge Config data
    const updatedData = {
      ...currentData,
      ...fallbackResults,
      lastUpdated: new Date().toISOString(),
    };

    console.log("Updating Edge Config with merged data...");

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

    console.log("Force cache update completed successfully");

    return NextResponse.json({
      success: true,
      message: "Cache force-updated with fallback data",
      data: {
        updatedFields: Object.keys(fallbackResults),
        lastUpdated: updatedData.lastUpdated,
      },
    });

  } catch (error) {
    console.error("Error in force cache update:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

// Allow GET for easier testing
export async function GET() {
  return POST(new Request(''));
}