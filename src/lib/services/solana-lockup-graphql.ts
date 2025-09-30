const SOLANA_LOCKUP_GRAPHQL_ENDPOINT =
  "https://graph.sablier.io/lockup-mainnet/subgraphs/name/sablier-lockup-solana-mainnet";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface UserAggregateResponse {
  users: Array<{
    id: string;
  }>;
}

export interface StreamAggregateResponse {
  streams: Array<{
    id: string;
  }>;
}

export interface TransactionAggregateResponse {
  actions: Array<{
    id: string;
  }>;
}

export interface TopSPLToken {
  symbol: string;
  name: string;
  streamCount: number;
}

export interface AssetResponse {
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    streams: Array<{
      id: string;
    }>;
  }>;
}

export interface StreamResponse {
  streams: Array<{
    id: string;
    timestamp: string;
  }>;
}

export async function fetchSolanaUsers(): Promise<number> {
  const query = `
    query GetSolanaUsers {
      users(first: 1000) {
        id
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<UserAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.users.length;
  } catch (error) {
    console.error("Error fetching Solana users:", error);
    throw error;
  }
}

export async function fetchSolanaMAU(): Promise<number> {
  const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

  const query = `
    query GetSolanaMAU {
      actions(
        where: { timestamp_gte: "${thirtyDaysAgo}" }
        first: 1000
      ) {
        addressId
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<{ actions: Array<{ addressId: string }> }> =
      await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const uniqueUsers = new Set(result.data.actions.map((action) => action.addressId));
    return uniqueUsers.size;
  } catch (error) {
    console.error("Error fetching Solana MAU:", error);
    throw error;
  }
}

export async function fetchSolanaStreams(): Promise<number> {
  const query = `
    query GetSolanaStreams {
      streams(first: 1000) {
        id
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<StreamAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.streams.length;
  } catch (error) {
    console.error("Error fetching Solana streams:", error);
    throw error;
  }
}

export async function fetchSolanaTransactions(): Promise<number> {
  const query = `
    query GetSolanaTransactions {
      actions(first: 1000) {
        id
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<TransactionAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.actions.length;
  } catch (error) {
    console.error("Error fetching Solana transactions:", error);
    throw error;
  }
}

export async function fetchSolanaTopTokens(): Promise<TopSPLToken[]> {
  const query = `
    query GetTopTokens {
      assets(first: 1000) {
        id
        symbol
        name
        streams {
          id
        }
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<AssetResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const topTokens = result.data.assets
      .map((asset) => ({
        name: asset.name,
        streamCount: asset.streams.length,
        symbol: asset.symbol,
      }))
      .sort((a, b) => b.streamCount - a.streamCount)
      .slice(0, 10);

    return topTokens;
  } catch (error) {
    console.error("Error fetching Solana top tokens:", error);
    throw error;
  }
}

export async function fetchSolanaStreams24h(): Promise<number> {
  const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

  const query = `
    query GetStreams24h {
      streams(
        where: { timestamp_gte: "${twentyFourHoursAgo}" }
        first: 1000
      ) {
        id
        timestamp
      }
    }
  `;

  try {
    const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<StreamResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.streams.length;
  } catch (error) {
    console.error("Error fetching Solana streams 24h:", error);
    throw error;
  }
}
