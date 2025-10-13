import { fetchAirdropsStablecoinVolume } from "./airdrops-graphql";
import { fetchFlowStablecoinVolume } from "./flow-graphql";
import { fetchLockupStablecoinVolume } from "./graphql";
import { fetchSolanaAirdropsStablecoinVolume } from "./solana-airdrops-graphql";
import { fetchSolanaLockupStablecoinVolume } from "./solana-lockup-graphql";

export type StablecoinVolumeBreakdown = {
  evmAirdrops: number;
  evmFlow: number;
  evmLockup: number;
  solanaAirdrops: number;
  solanaLockup: number;
  total: number;
};

export async function fetchTotalStablecoinVolume(): Promise<StablecoinVolumeBreakdown> {
  console.log("💰 Fetching total stablecoin volume across all protocols...");

  // Fetch all volumes in parallel with individual error handling
  const results = await Promise.allSettled([
    fetchLockupStablecoinVolume(),
    fetchFlowStablecoinVolume(),
    fetchAirdropsStablecoinVolume(),
    fetchSolanaLockupStablecoinVolume(),
    fetchSolanaAirdropsStablecoinVolume(),
  ]);

  // Extract values with fallback to 0
  const [
    evmLockupResult,
    evmFlowResult,
    evmAirdropsResult,
    solanaLockupResult,
    solanaAirdropsResult,
  ] = results;

  const evmLockup = evmLockupResult.status === "fulfilled" ? evmLockupResult.value : 0;
  const evmFlow = evmFlowResult.status === "fulfilled" ? evmFlowResult.value : 0;
  const evmAirdrops = evmAirdropsResult.status === "fulfilled" ? evmAirdropsResult.value : 0;
  const solanaLockup = solanaLockupResult.status === "fulfilled" ? solanaLockupResult.value : 0;
  const solanaAirdrops =
    solanaAirdropsResult.status === "fulfilled" ? solanaAirdropsResult.value : 0;

  // Log any errors
  if (evmLockupResult.status === "rejected") {
    console.error("  ❌ EVM Lockup fetch failed:", evmLockupResult.reason);
  }
  if (evmFlowResult.status === "rejected") {
    console.error("  ❌ EVM Flow fetch failed:", evmFlowResult.reason);
  }
  if (evmAirdropsResult.status === "rejected") {
    console.error("  ❌ EVM Airdrops fetch failed:", evmAirdropsResult.reason);
  }
  if (solanaLockupResult.status === "rejected") {
    console.error("  ❌ Solana Lockup fetch failed:", solanaLockupResult.reason);
  }
  if (solanaAirdropsResult.status === "rejected") {
    console.error("  ❌ Solana Airdrops fetch failed:", solanaAirdropsResult.reason);
  }

  // Log individual results
  console.log("  EVM Lockup: $" + evmLockup.toLocaleString());
  console.log("  EVM Flow: $" + evmFlow.toLocaleString());
  console.log("  EVM Airdrops: $" + evmAirdrops.toLocaleString());
  console.log("  Solana Lockup: $" + solanaLockup.toLocaleString());
  console.log("  Solana Airdrops: $" + solanaAirdrops.toLocaleString());

  const total = evmLockup + evmFlow + evmAirdrops + solanaLockup + solanaAirdrops;

  console.log("✅ Total stablecoin volume: $" + total.toLocaleString());

  return {
    evmAirdrops,
    evmFlow,
    evmLockup,
    solanaAirdrops,
    solanaLockup,
    total,
  };
}
