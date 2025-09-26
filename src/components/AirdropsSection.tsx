"use client";

import { CampaignCreationTrend } from "./CampaignCreationTrend";
import { RecipientParticipation } from "./RecipientParticipation";
import { TotalCampaigns } from "./TotalCampaigns";

export function AirdropsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sablier Airdrops</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <TotalCampaigns />
          <RecipientParticipation />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <CampaignCreationTrend />
        </div>
      </div>
    </div>
  );
}
