import { ActiveVsCompletedStreams } from "@/components/ActiveVsCompletedStreams";
import { Activity24Hours } from "@/components/Activity24Hours";
import { AirdropsSection } from "@/components/AirdropsSection";
import { ChainDistributionChart } from "@/components/ChainDistributionChart";
import { CumulativeTransactionChart } from "@/components/CumulativeTransactionChart";
import { CumulativeTransactionGrowthChart } from "@/components/CumulativeTransactionGrowthChart";
import { CumulativeUserChart } from "@/components/CumulativeUserChart";
import { FlowTotalStreams } from "@/components/FlowTotalStreams";
import { GrowthRateIndicators } from "@/components/GrowthRateIndicators";
import { LargestStablecoinStreams } from "@/components/LargestStablecoinStreams";
import { LastUpdated } from "@/components/LastUpdated";
import { MedianStreamDuration } from "@/components/MedianStreamDuration";
import { MonthlyStreamCreationChart } from "@/components/MonthlyStreamCreationChart";
import { SolanaSection } from "@/components/SolanaSection";
import { StreamCategoryDistribution } from "@/components/StreamCategoryDistribution";
import { StreamProperties } from "@/components/StreamProperties";
import { TimeBasedTransactionCounters } from "@/components/TimeBasedTransactionCounters";
import { TimeBasedUserCounters } from "@/components/TimeBasedUserCounters";
import { TopAssetsChart } from "@/components/TopAssetsChart";
import { TotalClaims } from "@/components/TotalClaims";
import { TotalVestingStreams } from "@/components/TotalVestingStreams";
import { TransactionCounter } from "@/components/TransactionCounter";
import { UserCounter } from "@/components/UserCounter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0c0d14] dark:to-[#0c0d14] transition-colors">
      <div className="px-16 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-semibold text-text-primary mb-3">Sablier Analytics</h1>
          <p className="text-xl text-text-secondary mb-6">
            Protocol metrics for token distribution, vesting, payroll, and more
          </p>
          <LastUpdated />
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <UserCounter />
            <TransactionCounter />
            <TotalVestingStreams />
            <TotalClaims />
          </div>

          {/* Flow (Open-Ended Streaming) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FlowTotalStreams />
          </div>

          <Activity24Hours />

          <TimeBasedUserCounters />

          <TimeBasedTransactionCounters />

          <GrowthRateIndicators />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MedianStreamDuration />
            <StreamProperties />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CumulativeUserChart />
            <CumulativeTransactionChart />
          </div>

          <CumulativeTransactionGrowthChart />

          <MonthlyStreamCreationChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChainDistributionChart />
            <TopAssetsChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StreamCategoryDistribution />
            <ActiveVsCompletedStreams />
          </div>

          <LargestStablecoinStreams />

          <AirdropsSection />

          <SolanaSection />
        </div>
      </div>
    </div>
  );
}
