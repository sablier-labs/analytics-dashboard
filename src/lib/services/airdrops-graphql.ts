import { getTestnetChainIds } from "@/lib/constants/chains";

const AIRDROPS_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/508d217/v1/graphql";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface TotalCampaignsResponse {
  Campaign_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface MonthlyCampaignCreation {
  month: string;
  count: number;
}

export interface RecipientParticipation {
  percentage: number;
  campaignCount: number;
}

export interface CampaignTimestamp {
  timestamp: string;
}

export interface ParticipationCampaign {
  claimedCount: string;
  totalRecipients: string;
}

export interface ParticipationResponse {
  Campaign: ParticipationCampaign[];
}

export async function fetchTotalCampaigns(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetTotalCampaigns {
      Campaign_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<TotalCampaignsResponse> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    console.log(`Fetched total campaigns: ${result.data.Campaign_aggregate.aggregate.count}`);
    return result.data.Campaign_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching total campaigns:", error);
    throw error;
  }
}

export async function fetchMonthlyCampaignCreation(): Promise<MonthlyCampaignCreation[]> {
  const testnetChainIds = getTestnetChainIds();

  // Generate last 12 months of time ranges
  const timeRanges: Array<{ label: string; startTimestamp: string; endTimestamp: string }> = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59);

    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    const startTimestamp = Math.floor(startOfMonth.getTime() / 1000).toString();
    const endTimestamp = Math.floor(endOfMonth.getTime() / 1000).toString();

    timeRanges.push({ endTimestamp, label, startTimestamp });
  }

  const query = `
    query GetMonthlyCampaignCreation {
      ${timeRanges
        .map(
          (range, index) => `
        month${index}: Campaign_aggregate(
          where: {
            chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
            timestamp: { _gte: "${range.startTimestamp}", _lte: "${range.endTimestamp}" }
          }
        ) {
          aggregate {
            count
          }
        }
      `,
        )
        .join("\n")}
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<Record<string, { aggregate: { count: number } }>> =
      await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Convert response to monthly data
    const monthlyData: MonthlyCampaignCreation[] = timeRanges.map((range, index) => ({
      count: result.data[`month${index}`].aggregate.count,
      month: range.label,
    }));

    const totalCampaigns = monthlyData.reduce((sum, month) => sum + month.count, 0);
    console.log(
      `Fetched monthly campaign creation: ${monthlyData.length} months, ${totalCampaigns} total campaigns`,
    );

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly campaign creation:", error);
    throw error;
  }
}

export async function fetchRecipientParticipation(): Promise<RecipientParticipation> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetRecipientParticipation {
      Campaign(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          claimedCount: { _gte: "10" }
        }
      ) {
        claimedCount
        totalRecipients
      }
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<ParticipationResponse> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Calculate overall participation rate
    let totalClaimed = 0;
    let totalRecipients = 0;

    for (const campaign of result.data.Campaign) {
      totalClaimed += parseInt(campaign.claimedCount);
      totalRecipients += parseInt(campaign.totalRecipients);
    }

    const percentage = totalRecipients > 0 ? (totalClaimed / totalRecipients) * 100 : 0;

    console.log(
      `Calculated recipient participation: ${percentage.toFixed(1)}% across ${result.data.Campaign.length} campaigns`,
    );
    console.log(
      `Total claims: ${totalClaimed.toLocaleString()}, Total recipients: ${totalRecipients.toLocaleString()}`,
    );

    return {
      campaignCount: result.data.Campaign.length,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
    };
  } catch (error) {
    console.error("Error fetching recipient participation:", error);
    throw error;
  }
}
