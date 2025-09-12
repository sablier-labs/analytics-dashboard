import { NextResponse } from "next/server";

const GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/53b7e25/v1/graphql";

export async function GET() {
  try {
    // Let's check what chains are available and get total stream counts
    const query = `
      query DebugStreams {
        totalStreams: Stream_aggregate {
          aggregate {
            count
          }
        }
        
        uniqueChains: Stream(distinct_on: [chainId], limit: 20) {
          chainId
        }
        
        recentStreams: Stream(limit: 5, order_by: {timestamp: desc}) {
          id
          chainId
          tokenId
          timestamp
          asset {
            symbol
            name
          }
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return NextResponse.json({
        success: false,
        error: result.errors[0]?.message,
        errors: result.errors
      }, { status: 500 });
    }

    console.log("Debug results:", {
      totalStreams: result.data.totalStreams.aggregate.count,
      chainIds: result.data.uniqueChains.map((s: any) => s.chainId),
      recentStreams: result.data.recentStreams
    });

    return NextResponse.json({
      success: true,
      totalStreams: result.data.totalStreams.aggregate.count,
      availableChains: result.data.uniqueChains.map((s: any) => s.chainId),
      recentStreams: result.data.recentStreams,
      raw: result.data
    });
  } catch (error) {
    console.error("Error debugging streams:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}