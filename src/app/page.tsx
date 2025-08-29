import { UserCounter } from "@/components/UserCounter";
import { TimeBasedUserCounters } from "@/components/TimeBasedUserCounters";
import { CumulativeUserChart } from "@/components/CumulativeUserChart";
import { ChainDistributionChart } from "@/components/ChainDistributionChart";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sablier Analytics
          </h1>
          <p className="text-xl text-gray-600">
            Protocol metrics for token distribution, vesting, payroll, and more
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-md mx-auto">
            <UserCounter />
          </div>
          
          <TimeBasedUserCounters />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CumulativeUserChart />
            <ChainDistributionChart />
          </div>
        </div>
      </div>
    </div>
  );
}
