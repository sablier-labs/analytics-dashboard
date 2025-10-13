const FLOW_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/3b4ea6b/v1/graphql";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface DepositAggregateResponse {
  Action_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export async function fetchFlowDeposits(): Promise<number> {
  const query = `
    query GetFlowDeposits {
      Action_aggregate(where: { category: { _eq: "Deposit" } }) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(FLOW_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<DepositAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.Action_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching Flow deposits:", error);
    throw error;
  }
}
