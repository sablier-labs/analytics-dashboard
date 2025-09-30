"use client";

import { SolanaClaims24h } from "./SolanaClaims24h";
import { SolanaMAU } from "./SolanaMAU";
import { SolanaStreams24h } from "./SolanaStreams24h";
import { SolanaTopSPLTokens } from "./SolanaTopSPLTokens";
import { SolanaTotalCampaigns } from "./SolanaTotalCampaigns";
import { SolanaTotalStreams } from "./SolanaTotalStreams";
import { SolanaTotalTransactions } from "./SolanaTotalTransactions";
import { SolanaTotalUsers } from "./SolanaTotalUsers";

export function SolanaSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sablier on Solana</h2>

        {/* Row 1: 4 main counters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SolanaMAU />
          <SolanaTotalUsers />
          <SolanaTotalStreams />
          <SolanaTotalCampaigns />
        </div>

        {/* Row 2: 3 activity counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SolanaTotalTransactions />
          <SolanaStreams24h />
          <SolanaClaims24h />
        </div>

        {/* Row 3: Chart full width */}
        <div className="grid grid-cols-1 gap-6">
          <SolanaTopSPLTokens />
        </div>
      </div>
    </div>
  );
}
