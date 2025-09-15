import { NextResponse } from "next/server";
import { fetchTotalVestingStreams } from "@/lib/services/graphql";

export async function GET() {
  try {
    const data = await fetchTotalVestingStreams();
    
    console.log(`Total vesting streams fetched: ${data.toLocaleString()}`);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in fallback-total-streams:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}