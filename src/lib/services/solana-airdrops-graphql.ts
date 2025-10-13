const SOLANA_AIRDROPS_GRAPHQL_ENDPOINT =
  "https://graph.sablier.io/airdrops-mainnet/subgraphs/name/sablier-airdrops-solana-mainnet";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface CampaignAggregateResponse {
  campaigns: Array<{
    id: string;
  }>;
}

export interface ActivityResponse {
  activities: Array<{
    id: string;
    timestamp: string;
    claims: string;
  }>;
}

export async function fetchSolanaCampaigns(): Promise<number> {
  const query = `
    query GetSolanaCampaigns {
      campaigns(first: 1000) {
        id
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<CampaignAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.campaigns.length;
  } catch (error) {
    console.error("Error fetching Solana campaigns:", error);
    throw error;
  }
}

export async function fetchSolanaClaims24h(): Promise<number> {
  const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

  const query = `
    query GetClaims24h {
      activities(
        where: { timestamp_gte: "${twentyFourHoursAgo}" }
        first: 1000
      ) {
        id
        timestamp
        claims
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<ActivityResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const totalClaims = result.data.activities.reduce((sum, activity) => {
      return sum + parseInt(activity.claims, 10);
    }, 0);

    return totalClaims;
  } catch (error) {
    console.error("Error fetching Solana claims 24h:", error);
    throw error;
  }
}

const SOLANA_STABLECOINS = ["PYUSD", "USDC", "USDH", "USDT"];

export interface CampaignVolumeResponse {
  campaigns: Array<{
    aggregateAmount: string;
    asset: {
      decimals: number;
      symbol: string;
    };
  }>;
}

export async function fetchSolanaAirdropsStablecoinVolume(): Promise<number> {
  const query = `
    query GetSolanaAirdropsVolume {
      campaigns(first: 1000, where: {aggregateAmount_gt: "0"}) {
        aggregateAmount
        asset {
          decimals
          symbol
        }
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<CampaignVolumeResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Filter stablecoins and sum normalized amounts
    const totalVolume = result.data.campaigns
      .filter((campaign) => SOLANA_STABLECOINS.includes(campaign.asset.symbol))
      .reduce((sum, campaign) => {
        const decimals = campaign.asset.decimals;
        const aggregateAmount = BigInt(campaign.aggregateAmount);
        const normalized = Number(aggregateAmount) / 10 ** decimals;
        return sum + normalized;
      }, 0);

    return totalVolume;
  } catch (error) {
    console.error("Error fetching Solana Airdrops stablecoin volume:", error);
    throw error;
  }
}
