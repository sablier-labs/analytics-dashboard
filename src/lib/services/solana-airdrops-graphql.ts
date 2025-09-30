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

export interface ClaimResponse {
  claims: Array<{
    id: string;
    timestamp: string;
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
      claims(
        where: { timestamp_gte: "${twentyFourHoursAgo}" }
        first: 1000
      ) {
        id
        timestamp
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

    const result: GraphQLResponse<ClaimResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.claims.length;
  } catch (error) {
    console.error("Error fetching Solana claims 24h:", error);
    throw error;
  }
}
