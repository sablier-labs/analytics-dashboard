import { NextResponse } from "next/server";
import { fetchActiveVsCompletedStreams } from "@/lib/services/graphql";

export async function GET() {
  try {
    const data = await fetchActiveVsCompletedStreams();
    
    console.log(`Active vs completed streams fetched: active=${data.active}, completed=${data.completed}, total=${data.total}`);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in fallback-active-completed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}