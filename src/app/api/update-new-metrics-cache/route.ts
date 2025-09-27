import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  fetchMonthlyStreamCreation,
  fetchStreamDurationStats,
  fetchStreamProperties,
} from "@/lib/services/graphql";

// Verify the request is from Vercel Cron or has correct API key
function verifyRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Allow Vercel Cron requests
  if (authHeader === "Bearer " + process.env.CRON_SECRET) {
    return true;
  }

  // Allow requests with the correct API key
  if (authHeader === "Bearer " + process.env.API_SECRET) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  // Verify the request
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting new metrics cache update...");

    // Fetch only the new metrics in parallel
    const [monthlyStreamCreation, streamDurationStats, streamProperties] = await Promise.all([
      fetchMonthlyStreamCreation().catch((err) => {
        console.error("Error fetching monthly stream creation:", err);
        return [];
      }),
      fetchStreamDurationStats().catch((err) => {
        console.error("Error fetching stream duration stats:", err);
        return { average: 0, max: 0, median: 0, min: 0 };
      }),
      fetchStreamProperties().catch((err) => {
        console.error("Error fetching stream properties:", err);
        return { both: 0, cancelable: 0, total: 0, transferable: 0 };
      }),
    ]);

    // Get existing cache data and merge with new metrics
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

    if (!edgeConfigId || !vercelAccessToken) {
      throw new Error("EDGE_CONFIG_ID or VERCEL_ACCESS_TOKEN environment variables are not set");
    }

    // First, get existing cache data
    let existingData = {};
    try {
      const getResponse = await fetch(
        `https://api.vercel.com/v1/edge-config/${edgeConfigId}/item/analytics?slug=sablier-labs`,
        {
          headers: {
            Authorization: `Bearer ${vercelAccessToken}`,
          },
        },
      );

      if (getResponse.ok) {
        existingData = await getResponse.json();
      }
    } catch (_error) {
      console.log("Could not fetch existing cache data, will create new entry");
    }

    // Merge new metrics with existing data
    const updatedData = {
      ...existingData,
      lastUpdated: new Date().toISOString(),
      monthlyStreamCreation,
      streamDurationStats,
      streamProperties,
    };

    // Update Edge Config
    const response = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      body: JSON.stringify({
        items: [
          {
            key: "analytics",
            operation: "upsert",
            value: updatedData,
          },
        ],
      }),
      headers: {
        Authorization: `Bearer ${vercelAccessToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update Edge Config: ${response.status} ${errorText}`);
    }

    console.log("New metrics cache updated successfully");

    return NextResponse.json({
      message: "New metrics cache updated successfully",
      metrics: {
        monthlyStreamCreation: monthlyStreamCreation.length + " months",
        streamDurationStats: "median " + Math.round(streamDurationStats.median / 86400) + " days",
        streamProperties: `cancelable: ${streamProperties.cancelable}, transferable: ${streamProperties.transferable}, both: ${streamProperties.both}`,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error updating new metrics cache:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Failed to update cache",
        success: false,
      },
      { status: 500 },
    );
  }
}

// Also allow GET requests for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
