import type { StablecoinVolumeBreakdown } from "./services/stablecoin-volume-aggregate";
import { fetchTotalStablecoinVolume } from "./services/stablecoin-volume-aggregate";

export type StablecoinVolumeData = StablecoinVolumeBreakdown & {
  lastUpdated: string;
};

export async function updateStablecoinVolumeCache(): Promise<{
  dataPoints: StablecoinVolumeBreakdown;
  lastUpdated: string;
  message: string;
  success: boolean;
}> {
  console.log("💰 Starting stablecoin volume cache update...");

  const breakdown = await fetchTotalStablecoinVolume();

  const timestamp = new Date().toISOString();
  const cachedData: StablecoinVolumeData = {
    ...breakdown,
    lastUpdated: timestamp,
  };

  // Update Vercel Edge Config
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelAccessToken = process.env.VERCEL_ACCESS_TOKEN;

  if (!edgeConfigId || !vercelAccessToken) {
    console.warn("⚠️ Edge Config credentials not available, skipping cache update");
    return {
      dataPoints: breakdown,
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
            key: "stablecoin_volume",
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

    console.log("✅ Stablecoin volume cache update completed successfully");
    console.log(`   Total Volume: $${breakdown.total.toLocaleString()}`);
    console.log(`   EVM Lockup: $${breakdown.evmLockup.toLocaleString()}`);
    console.log(`   EVM Flow: $${breakdown.evmFlow.toLocaleString()}`);
    console.log(`   EVM Airdrops: $${breakdown.evmAirdrops.toLocaleString()}`);
    console.log(`   Solana Lockup: $${breakdown.solanaLockup.toLocaleString()}`);
    console.log(`   Solana Airdrops: $${breakdown.solanaAirdrops.toLocaleString()}`);

    return {
      dataPoints: breakdown,
      lastUpdated: timestamp,
      message: "Stablecoin volume cache updated successfully",
      success: true,
    };
  } catch (error) {
    console.error("❌ Error updating stablecoin volume cache:", error);
    return {
      dataPoints: breakdown,
      lastUpdated: timestamp,
      message: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}
