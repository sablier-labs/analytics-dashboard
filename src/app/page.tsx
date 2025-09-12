import { ChainDistributionChart } from "@/components/ChainDistributionChart";
import { CumulativeTransactionChart } from "@/components/CumulativeTransactionChart";
import { CumulativeUserChart } from "@/components/CumulativeUserChart";
import { GrowthRateIndicators } from "@/components/GrowthRateIndicators";
import { TimeBasedTransactionCounters } from "@/components/TimeBasedTransactionCounters";
import { TimeBasedUserCounters } from "@/components/TimeBasedUserCounters";
import { TransactionCounter } from "@/components/TransactionCounter";
import { UserCounter } from "@/components/UserCounter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Sablier Analytics</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Protocol metrics for token distribution, vesting, payroll, and more
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <UserCounter />
            <TransactionCounter />
          </div>

          <TimeBasedUserCounters />

          <TimeBasedTransactionCounters />

          <GrowthRateIndicators />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CumulativeUserChart />
            <CumulativeTransactionChart />
          </div>

          <ChainDistributionChart />
        </div>
      </div>
    </div>
  );
}
