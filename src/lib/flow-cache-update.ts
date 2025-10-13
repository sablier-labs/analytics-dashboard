import { fetchFlowStreams } from "./services/flow-graphql";

export type FlowAnalyticsData = {
  lastUpdated: string;
  totalStreams: number;
};

export async function updateFlowCache(): Promise<{
  dataPoints: {
    totalStreams: number;
  };
  lastUpdated: string;
  message: string;
  success: boolean;
}> {
  console.log("🌊 Starting Flow analytics cache update...");

  const results = await Promise.allSettled([fetchFlowStreams()]);

  const [totalStreamsResult] = results;

  const totalStreams = totalStreamsResult.status === "fulfilled" ? totalStreamsResult.value : 0;

  const timestamp = new Date().toISOString();
  const cachedData: FlowAnalyticsData = {
    lastUpdated: timestamp,
    totalStreams,
  };

  // Update Vercel Edge Config
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

  if (!edgeConfigId || !vercelAccessToken) {
    console.warn("⚠️ Edge Config credentials not available, skipping cache update");
    return {
      dataPoints: { totalStreams },
      lastUpdated: timestamp,
      message: "Edge Config credentials not configured",
      success: false,
    };
  }

  try {
    const response = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      body: JSON.stringify({
        items: [
          {
            key: "flow_analytics",
            operation: "upsert",
            value: cachedData,
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
      throw new Error(`Failed to update Edge Config: ${response.statusText}`);
    }

    console.log("✅ Flow analytics cache update completed successfully");
    console.log(`   Total Streams: ${totalStreams}`);

    return {
      dataPoints: { totalStreams },
      lastUpdated: timestamp,
      message: "Flow cache updated successfully",
      success: true,
    };
  } catch (error) {
    console.error("❌ Error updating Flow cache:", error);
    return {
      dataPoints: { totalStreams },
      lastUpdated: timestamp,
      message: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}
