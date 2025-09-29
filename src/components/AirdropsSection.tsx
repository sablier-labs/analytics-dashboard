"use client";

import { AirdropsChainDistribution } from "./AirdropsChainDistribution";
import { CampaignCreationTrend } from "./CampaignCreationTrend";
import { MedianClaimers } from "./MedianClaimers";
import { MedianClaimWindow } from "./MedianClaimWindow";
import { RecipientParticipation } from "./RecipientParticipation";
import { TopPerformingCampaigns } from "./TopPerformingCampaigns";
import { TotalCampaigns } from "./TotalCampaigns";
import { VestingDistribution } from "./VestingDistribution";

export function AirdropsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sablier Airdrops</h2>

        {/* Row 1: Metric cards - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TotalCampaigns />
          <RecipientParticipation />
          <MedianClaimers />
          <MedianClaimWindow />
        </div>


        {/* Row 2: Campaign Creation Trend (full width) */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <CampaignCreationTrend />
        </div>

        {/* Row 3: Two charts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <VestingDistribution />
          <AirdropsChainDistribution />
        </div>

        {/* Row 4: Top Performing Campaigns (full width) */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <TopPerformingCampaigns />
        </div>

      </div>
    </div>
  );
}
