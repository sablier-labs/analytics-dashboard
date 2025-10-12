#!/usr/bin/env npx tsx

/**
 * Edge Config Storage Analysis Script
 * Analyzes current storage structure and estimates memory usage
 */

import { get } from "@vercel/edge-config";
import type { CachedAirdropsData } from "../src/lib/services/airdrops-graphql";
import type { CachedAnalyticsData } from "../src/lib/services/cache";

function estimateObjectSize(obj: any): number {
  const str = JSON.stringify(obj);
  return Buffer.byteLength(str, "utf8");
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
}

async function analyzeStorage() {
  console.log("🔍 Edge Config Storage Analysis\n");

  try {
    // Analyze main analytics cache
    console.log("📊 Main Analytics Cache ('analytics' key):");
    const analyticsCache = await get<CachedAnalyticsData>("analytics");

    if (analyticsCache) {
      const totalSize = estimateObjectSize(analyticsCache);
      console.log(`   Total Size: ${formatBytes(totalSize)}`);
      console.log(`   Last Updated: ${analyticsCache.lastUpdated}`);
      console.log(`   Data Points:`);

      // Analyze individual fields
      const fieldSizes = {
        activeVsCompletedStreams: estimateObjectSize(analyticsCache.activeVsCompletedStreams),
        activity24Hours: estimateObjectSize(analyticsCache.activity24Hours),
        chainDistribution: estimateObjectSize(analyticsCache.chainDistribution),
        growthRateMetrics: estimateObjectSize(analyticsCache.growthRateMetrics),
        largestStablecoinStreams: estimateObjectSize(analyticsCache.largestStablecoinStreams),
        monthlyStreamCreation: estimateObjectSize(analyticsCache.monthlyStreamCreation),
        monthlyTransactionGrowth: estimateObjectSize(analyticsCache.monthlyTransactionGrowth),
        monthlyUserGrowth: estimateObjectSize(analyticsCache.monthlyUserGrowth),
        streamCategoryDistribution: estimateObjectSize(analyticsCache.streamCategoryDistribution),
        streamDurationStats: estimateObjectSize(analyticsCache.streamDurationStats),
        streamProperties: estimateObjectSize(analyticsCache.streamProperties),
        timeBasedTransactions: estimateObjectSize(analyticsCache.timeBasedTransactions),
        timeBasedUsers: estimateObjectSize(analyticsCache.timeBasedUsers),
        topAssets: estimateObjectSize(analyticsCache.topAssets),
        totalTransactions: estimateObjectSize(analyticsCache.totalTransactions),
        totalUsers: estimateObjectSize(analyticsCache.totalUsers),
        totalVestingStreams: estimateObjectSize(analyticsCache.totalVestingStreams),
      };

      // Sort by size (largest first)
      const sortedFields = Object.entries(fieldSizes)
        .sort(([, a], [, b]) => b - a)
        .map(([field, size]) => ({
          field,
          percentage: ((size / totalSize) * 100).toFixed(1),
          size,
        }));

      sortedFields.forEach(({ field, size, percentage }) => {
        console.log(`     ${field}: ${formatBytes(size)} (${percentage}%)`);

        // Additional details for large array fields
        if (field === "monthlyUserGrowth" && analyticsCache.monthlyUserGrowth) {
          console.log(`       → ${analyticsCache.monthlyUserGrowth.length} months of data`);
        }
        if (field === "monthlyTransactionGrowth" && analyticsCache.monthlyTransactionGrowth) {
          console.log(`       → ${analyticsCache.monthlyTransactionGrowth.length} months of data`);
        }
        if (field === "largestStablecoinStreams" && analyticsCache.largestStablecoinStreams) {
          console.log(
            `       → ${analyticsCache.largestStablecoinStreams.length} streams (limit: 25)`,
          );
        }
        if (field === "topAssets" && analyticsCache.topAssets) {
          console.log(`       → ${analyticsCache.topAssets.length} assets`);
        }
        if (field === "chainDistribution" && analyticsCache.chainDistribution) {
          console.log(`       → ${analyticsCache.chainDistribution.length} chains`);
        }
      });
    } else {
      console.log("   No analytics cache found");
    }

    console.log("\n🪂 Airdrops Cache ('airdrops' key):");
    const airdropsCache = await get<CachedAirdropsData>("airdrops");

    if (airdropsCache) {
      const totalSize = estimateObjectSize(airdropsCache);
      console.log(`   Total Size: ${formatBytes(totalSize)}`);
      console.log(`   Last Updated: ${airdropsCache.lastUpdated}`);
      console.log(`   Data Points:`);

      const fieldSizes = {
        chainDistribution: estimateObjectSize(airdropsCache.chainDistribution),
        medianClaimers: estimateObjectSize(airdropsCache.medianClaimers),
        medianClaimWindow: estimateObjectSize(airdropsCache.medianClaimWindow),
        monthlyCampaignCreation: estimateObjectSize(airdropsCache.monthlyCampaignCreation),
        recipientParticipation: estimateObjectSize(airdropsCache.recipientParticipation),
        topPerformingCampaigns: estimateObjectSize(airdropsCache.topPerformingCampaigns),
        totalCampaigns: estimateObjectSize(airdropsCache.totalCampaigns),
        vestingDistribution: estimateObjectSize(airdropsCache.vestingDistribution),
      };

      Object.entries(fieldSizes)
        .sort(([, a], [, b]) => b - a)
        .forEach(([field, size]) => {
          const percentage = ((size / totalSize) * 100).toFixed(1);
          console.log(`     ${field}: ${formatBytes(size)} (${percentage}%)`);

          if (field === "monthlyCampaignCreation" && airdropsCache.monthlyCampaignCreation) {
            console.log(`       → ${airdropsCache.monthlyCampaignCreation.length} months of data`);
          }
          if (field === "topPerformingCampaigns" && airdropsCache.topPerformingCampaigns) {
            console.log(
              `       → ${airdropsCache.topPerformingCampaigns.length} campaigns (limit: 10)`,
            );
          }
        });
    } else {
      console.log("   No airdrops cache found");
    }

    // Calculate total storage
    const analyticsSize = analyticsCache ? estimateObjectSize(analyticsCache) : 0;
    const airdropsSize = airdropsCache ? estimateObjectSize(airdropsCache) : 0;
    const totalStorage = analyticsSize + airdropsSize;

    console.log(`\n📊 Total Edge Config Storage: ${formatBytes(totalStorage)}`);
    console.log(
      `   Analytics: ${formatBytes(analyticsSize)} (${analyticsSize > 0 ? ((analyticsSize / totalStorage) * 100).toFixed(1) : 0}%)`,
    );
    console.log(
      `   Airdrops: ${formatBytes(airdropsSize)} (${airdropsSize > 0 ? ((airdropsSize / totalStorage) * 100).toFixed(1) : 0}%)`,
    );

    // Recommendations
    console.log("\n🎯 Optimization Recommendations:");

    if (analyticsCache?.monthlyUserGrowth && analyticsCache.monthlyUserGrowth.length > 24) {
      console.log(
        `   • Limit monthlyUserGrowth to 24 months (currently: ${analyticsCache.monthlyUserGrowth.length})`,
      );
    }

    if (
      analyticsCache?.monthlyTransactionGrowth &&
      analyticsCache.monthlyTransactionGrowth.length > 24
    ) {
      console.log(
        `   • Limit monthlyTransactionGrowth to 24 months (currently: ${analyticsCache.monthlyTransactionGrowth.length})`,
      );
    }

    if (
      analyticsCache?.largestStablecoinStreams &&
      analyticsCache.largestStablecoinStreams.length > 20
    ) {
      console.log(
        `   • Consider reducing stablecoin streams from ${analyticsCache.largestStablecoinStreams.length} to 20`,
      );
    }

    if (totalStorage > 500000) {
      // 500KB threshold
      console.log(`   ⚠️  Storage is above 500KB - consider implementing data retention limits`);
    }

    if (totalStorage > 1000000) {
      // 1MB threshold
      console.log(`   🚨 Storage is above 1MB - immediate optimization needed`);
    }
  } catch (error) {
    console.error("Error analyzing storage:", error);
  }
}

// Run analysis
analyzeStorage();
