const SOLANA_LOCKUP_GRAPHQL_ENDPOINT =
  "https://graph.sablier.io/lockup-mainnet/subgraphs/name/sablier-lockup-solana-mainnet";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface StreamsResponse {
  streams: Array<{
    id: string;
    sender: string;
    recipient: string;
  }>;
}

export interface StreamAggregateResponse {
  streams: Array<{
    id: string;
  }>;
}

export interface ActionResponse {
  actions: Array<{
    id: string;
    addressA: string | null;
  }>;
}

export interface TopSPLToken {
  mint: string;
  address: string;
  streamCount: number;
}

export interface AssetResponse {
  assets: Array<{
    id: string;
    mint: string;
    address: string;
    streams: Array<{
      id: string;
    }>;
  }>;
}

export interface StreamTimestampResponse {
  streams: Array<{
    id: string;
    timestamp: string;
  }>;
}

export async function fetchSolanaUsers(): Promise<number> {
  const query = `
    query GetSolanaUsers {
      streams(first: 1000) {
        sender
        recipient
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

    const result: GraphQLResponse<StreamsResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const uniqueUsers = new Set<string>();
    result.data.streams.forEach((stream) => {
      uniqueUsers.add(stream.sender);
      uniqueUsers.add(stream.recipient);
    });

    return uniqueUsers.size;
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
        addressA
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

    const result: GraphQLResponse<ActionResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const uniqueUsers = new Set(
      result.data.actions
        .map((action) => action.addressA)
        .filter((addr): addr is string => addr !== null),
    );
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

    const result: GraphQLResponse<{ actions: Array<{ id: string }> }> = await response.json();

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
        mint
        address
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
        address: asset.address,
        mint: asset.mint,
        streamCount: asset.streams.length,
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

    const result: GraphQLResponse<StreamTimestampResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.streams.length;
  } catch (error) {
    console.error("Error fetching Solana streams 24h:", error);
    throw error;
  }
}
