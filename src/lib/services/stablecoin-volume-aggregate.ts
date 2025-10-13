import {
  fetchAirdropsStablecoinVolume,
  fetchAirdropsStablecoinVolumeTimeRange,
} from "./airdrops-graphql";
import { fetchFlowStablecoinVolume, fetchFlowStablecoinVolumeTimeRange } from "./flow-graphql";
import { fetchLockupStablecoinVolume, fetchLockupStablecoinVolumeTimeRange } from "./graphql";
import {
  fetchSolanaAirdropsStablecoinVolume,
  fetchSolanaAirdropsStablecoinVolumeTimeRange,
} from "./solana-airdrops-graphql";
import {
  fetchSolanaLockupStablecoinVolume,
  fetchSolanaLockupStablecoinVolumeTimeRange,
} from "./solana-lockup-graphql";

export type StablecoinVolumeBreakdown = {
  evmAirdrops: number;
  evmFlow: number;
  evmLockup: number;
  solanaAirdrops: number;
  solanaLockup: number;
  total: number;
};

export type TimeBasedStablecoinVolume = {
  past30Days: number;
  past90Days: number;
  past180Days: number;
  pastYear: number;
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

  // Log individual results with suspicious value detection
  console.log(`📊 EVM Lockup volume: $${evmLockup.toLocaleString()}`);
  if (evmLockup > 1_000_000_000_000) {
    console.error(`⚠️  EVM Lockup volume looks suspicious! Raw value: ${evmLockup}`);
  }

  console.log(`📊 EVM Flow volume: $${evmFlow.toLocaleString()}`);
  if (evmFlow > 1_000_000_000_000) {
    console.error(`⚠️  EVM Flow volume looks suspicious! Raw value: ${evmFlow}`);
  }

  console.log(`📊 EVM Airdrops volume: $${evmAirdrops.toLocaleString()}`);
  if (evmAirdrops > 1_000_000_000_000) {
    console.error(`⚠️  EVM Airdrops volume looks suspicious! Raw value: ${evmAirdrops}`);
  }

  console.log(`📊 Solana Lockup volume: $${solanaLockup.toLocaleString()}`);
  if (solanaLockup > 1_000_000_000_000) {
    console.error(`⚠️  Solana Lockup volume looks suspicious! Raw value: ${solanaLockup}`);
  }

  console.log(`📊 Solana Airdrops volume: $${solanaAirdrops.toLocaleString()}`);
  if (solanaAirdrops > 1_000_000_000_000) {
    console.error(`⚠️  Solana Airdrops volume looks suspicious! Raw value: ${solanaAirdrops}`);
  }

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

export async function fetchTimeBasedStablecoinVolume(): Promise<TimeBasedStablecoinVolume> {
  console.log("💰 Fetching time-based stablecoin volume across all protocols...");

  // Fetch all time periods in parallel
  const timePeriods = [30, 90, 180, 365];

  const results = await Promise.all(
    timePeriods.map(async (days) => {
      console.log(`  📅 Fetching ${days}-day volume...`);

      // Fetch all 5 protocols for this time period
      const protocolResults = await Promise.allSettled([
        fetchLockupStablecoinVolumeTimeRange(days),
        fetchFlowStablecoinVolumeTimeRange(days),
        fetchAirdropsStablecoinVolumeTimeRange(days),
        fetchSolanaLockupStablecoinVolumeTimeRange(days),
        fetchSolanaAirdropsStablecoinVolumeTimeRange(days),
      ]);

      // Extract values with fallback to 0
      const [
        evmLockupResult,
        evmFlowResult,
        evmAirdropsResult,
        solanaLockupResult,
        solanaAirdropsResult,
      ] = protocolResults;

      const evmLockup = evmLockupResult.status === "fulfilled" ? evmLockupResult.value : 0;
      const evmFlow = evmFlowResult.status === "fulfilled" ? evmFlowResult.value : 0;
      const evmAirdrops = evmAirdropsResult.status === "fulfilled" ? evmAirdropsResult.value : 0;
      const solanaLockup = solanaLockupResult.status === "fulfilled" ? solanaLockupResult.value : 0;
      const solanaAirdrops =
        solanaAirdropsResult.status === "fulfilled" ? solanaAirdropsResult.value : 0;

      // Log any errors
      if (evmLockupResult.status === "rejected") {
        console.error(`  ❌ EVM Lockup ${days}-day fetch failed:`, evmLockupResult.reason);
      }
      if (evmFlowResult.status === "rejected") {
        console.error(`  ❌ EVM Flow ${days}-day fetch failed:`, evmFlowResult.reason);
      }
      if (evmAirdropsResult.status === "rejected") {
        console.error(`  ❌ EVM Airdrops ${days}-day fetch failed:`, evmAirdropsResult.reason);
      }
      if (solanaLockupResult.status === "rejected") {
        console.error(`  ❌ Solana Lockup ${days}-day fetch failed:`, solanaLockupResult.reason);
      }
      if (solanaAirdropsResult.status === "rejected") {
        console.error(
          `  ❌ Solana Airdrops ${days}-day fetch failed:`,
          solanaAirdropsResult.reason,
        );
      }

      const total = evmLockup + evmFlow + evmAirdrops + solanaLockup + solanaAirdrops;
      console.log(`  ✅ ${days}-day total: $${total.toLocaleString()}`);

      return total;
    }),
  );

  const [past30Days, past90Days, past180Days, pastYear] = results;

  console.log("✅ Time-based stablecoin volume fetch completed");
  console.log(`   30 days: $${past30Days.toLocaleString()}`);
  console.log(`   90 days: $${past90Days.toLocaleString()}`);
  console.log(`   180 days: $${past180Days.toLocaleString()}`);
  console.log(`   365 days: $${pastYear.toLocaleString()}`);

  return {
    past30Days,
    past90Days,
    past180Days,
    pastYear,
  };
}
