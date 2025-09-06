"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { ChainDistribution } from "@/lib/services/graphql";
import { SourceCodeLink } from "./SourceCodeLink";
import { useTheme } from "@/contexts/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

// Chain ID to name mapping - using your complete list
const chainNames: Record<string, string> = {
  "1": "ethereum",
  "8": "ubiq",
  "10": "optimism",
  "14": "flare",
  "19": "songbird",
  "20": "elastos",
  "24": "kardia",
  "25": "cronos",
  "30": "rsk",
  "40": "telos",
  "42": "lukso",
  "44": "crab",
  "46": "darwinia",
  "50": "XDC",
  "52": "csc",
  "55": "zyx",
  "56": "binance",
  "57": "syscoin",
  "60": "gochain",
  "61": "ethereumclassic",
  "66": "okexchain",
  "70": "hoo",
  "82": "meter",
  "87": "nova network",
  "88": "tomochain",
  "96": "bitkub",
  "100": "Gnosis Chain",
  "106": "velas",
  "108": "thundercore",
  "119": "enuls",
  "122": "fuse",
  "128": "heco",
  "130": "unichain",
  "137": "polygon",
  "146": "sonic",
  "148": "shimmer_evm",
  "151": "rbn",
  "166": "omni",
  "169": "manta",
  "177": "hsk",
  "181": "water",
  "196": "xlayer",
  "200": "xdaiarb",
  "204": "op_bnb",
  "207": "vinuchain",
  "232": "lc",
  "246": "energyweb",
  "248": "oasys",
  "250": "fantom",
  "252": "fraxtal",
  "269": "hpb",
  "288": "boba",
  "295": "hbar",
  "311": "omax",
  "314": "filecoin",
  "321": "kucoin",
  "324": "zksync era",
  "336": "shiden",
  "361": "theta",
  "369": "pulse",
  "388": "cronos zkevm",
  "416": "sx",
  "463": "areum",
  "478": "form network",
  "480": "wc",
  "534": "candle",
  "570": "rollux",
  "592": "astar",
  "690": "redstone",
  "698": "matchain",
  "820": "callisto",
  "841": "tara",
  "888": "wanchain",
  "957": "lyra chain",
  "996": "bifrost",
  "999": "hyperliquid",
  "1030": "conflux",
  "1088": "metis",
  "1100": "dymension",
  "1101": "polygon zkevm",
  "1116": "core",
  "1124": "ecm",
  "1135": "lisk",
  "1231": "ultron",
  "1234": "step",
  "1284": "moonbeam",
  "1285": "moonriver",
  "1329": "sei",
  "1440": "living assets mainnet",
  "1514": "sty",
  "1559": "tenet",
  "1625": "gravity",
  "1729": "reya network",
  "1868": "soneium",
  "1890": "LightLink",
  "1923": "swellchain",
  "1975": "onus",
  "1992": "hubblenet",
  "1996": "sanko",
  "2000": "dogechain",
  "2001": "milkomeda",
  "2002": "milkomeda_a1",
  "2222": "kava",
  "2332": "soma",
  "2410": "karak",
  "2741": "abstract",
  "2818": "morph",
  "3073": "move",
  "4158": "crossfi",
  "4337": "beam",
  "4689": "iotex",
  "5000": "mantle",
  "5050": "skate",
  "5330": "superseed",
  "5432": "yeying",
  "5551": "nahmii",
  "5845": "Tangle",
  "6001": "bouncebit",
  "6880": "mtt network",
  "6900": "nibiru",
  "6969": "tombchain",
  "7000": "zetachain",
  "7070": "planq",
  "7171": "bitrock",
  "7200": "xsat",
  "7560": "cyeth",
  "7700": "canto",
  "8217": "klaytn",
  "8428": "that",
  "8453": "base",
  "8668": "hela",
  "8822": "iotaevm",
  "8899": "jbc",
  "9001": "evmos",
  "9790": "carbon",
  "10000": "smartbch",
  "11820": "artela",
  "13371": "immutable zkevm",
  "15551": "loop",
  "16507": "genesys",
  "17777": "eos evm",
  "22776": "map protocol",
  "23294": "sapphire",
  "32380": "paix",
  "32520": "bitgert",
  "32659": "fusion",
  "32769": "zilliqa",
  "33139": "apechain",
  "34443": "Mode",
  "41923": "edu chain",
  "42161": "arbitrum",
  "42170": "arbitrum nova",
  "42220": "celo",
  "42262": "oasis",
  "42420": "assetchain",
  "42793": "etherlink",
  "43111": "hemi",
  "43114": "avalanche",
  "47805": "rei",
  "48900": "zircuit",
  "50104": "sophon",
  "52014": "etn",
  "55244": "superposition",
  "55555": "reichain",
  "56288": "boba_bnb",
  "57073": "ink",
  "59144": "linea",
  "60808": "bob",
  "71402": "godwoken",
  "80094": "berachain",
  "81457": "blast",
  "88888": "chiliz",
  "98866": "plume",
  "105105": "stratis",
  "111188": "real",
  "153153": "odyssey",
  "167000": "taiko",
  "200901": "bitlayer",
  "222222": "hydradx",
  "322202": "parex",
  "333999": "polis",
  "420420": "kekchain",
  "534352": "scroll",
  "543210": "zero_network",
  "777777": "winr",
  "810180": "zklink nova",
  "888888": "vision",
  "7000700": "jmdt",
  "7225878": "saakuru",
  "7777777": "zora",
  "20250217": "xphere",
  "21000000": "corn",
  "245022934": "neon",
  "994873017": "lumia",
  "1313161554": "aurora",
  "1666600000": "harmony",
  "11297108109": "palm",
  "383414847825": "zeniq",
  "836542336838601": "curio",
};

// Generate brand-based colors for pie chart
function generateChainColors(chainData: ChainDistribution[]): string[] {
  const brandColors = [
    "#FF5001", // Primary brand orange
    "#ea580c", // Orange 600
    "#fb923c", // Orange 400
    "#fdba74", // Orange 300
    "#fed7aa", // Orange 200
    "#c2410c", // Orange 700
    "#9a3412", // Orange 800
    "#f97316", // Orange 500 variant
    "#ff6b35", // Orange variant
    "#ff8566", // Orange tint
    "#ff9f80", // Orange light
    "#ffb399", // Orange lighter
    "#ffc7b3", // Orange lightest
    "#e55100", // Deep orange
    "#ff7043", // Orange accent
    "#ff8a65", // Orange light accent
    "#ffab91", // Orange very light
    "#ffccbc", // Orange pale
    "#d84315", // Red orange
    "#ff5722", // Deep orange material
    "#ff6f00", // Amber orange
    "#ff8f00", // Amber
    "#ffa000", // Amber dark
    "#ffb300", // Amber darker
    "#ffc107", // Amber yellow
  ];

  return chainData.map((_, index) => brandColors[index % brandColors.length]);
}

export function ChainDistributionChart() {
  const { data, loading, error } = useAnalytics();
  const { theme } = useTheme();
  
  // Filter out unwanted chains: 11155111 (Sepolia testnet) and 84532 (Base Sepolia)
  const chainData = data?.chainDistribution?.filter(
    (chain) => chain.chainId !== "11155111" && chain.chainId !== "84532",
  ) || null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 shadow-sm p-6">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading chain distribution</p>
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!chainData || chainData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No chain distribution data available</p>
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        backgroundColor: generateChainColors(chainData),
        borderColor: "transparent",
        borderWidth: 0,
        data: chainData.map((chain) => chain.userCount),
        hoverBackgroundColor: generateChainColors(chainData),
        hoverBorderColor: "#ffffff",
        hoverBorderWidth: 2,
      },
    ],
    labels: chainData.map((chain) => {
      const chainName = chainNames[chain.chainId] || `Chain ${chain.chainId}`;
      return chainName.charAt(0).toUpperCase() + chainName.slice(1); // Capitalize first letter
    }),
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(55, 65, 81)',
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "normal" as const,
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            const total = data.datasets[0].data.reduce(
              (sum: number, value: number) => sum + value,
              0,
            );

            return data.labels.slice(0, 10).map((label: string, index: number) => {
              const value = data.datasets[0].data[index];
              const percentage = ((value / total) * 100).toFixed(1);

              return {
                fillStyle: data.datasets[0].backgroundColor[index],
                fontColor: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(55, 65, 81)',
                hidden: false,
                index: index,
                lineWidth: 0,
                pointStyle: "circle",
                strokeStyle: "transparent",
                text: `${label} (${percentage}%)`,
              };
            });
          },
          padding: 16,
          usePointStyle: true,
          boxWidth: 12,
          boxHeight: 12,
        },
        position: "right" as const,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        bodyColor: "rgb(255, 255, 255)",
        borderWidth: 0,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = new Intl.NumberFormat().format(context.parsed);
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} users (${percentage}%)`;
          },
        },
        cornerRadius: 6,
        displayColors: false,
        padding: 12,
        titleColor: "rgb(255, 255, 255)",
        titleFont: {
          size: 13,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    responsive: true,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Distribution by Chain</h2>
          <SourceCodeLink fileName="graphql.ts" lineNumber={466} tooltip="View fetchChainDistribution source" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Distribution of active users across different blockchain networks
        </p>
      </div>
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
