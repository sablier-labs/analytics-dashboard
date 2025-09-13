import { NextResponse } from "next/server";
import { fetchMonthlyStreamCreation } from "@/lib/services/graphql";

// Test endpoint to verify the monthly stream creation query works
export async function GET() {
  try {
    console.log("Testing monthly stream creation GraphQL query...");
    
    const monthlyStreamData = await fetchMonthlyStreamCreation();
    
    console.log("Monthly stream creation data fetched successfully:", monthlyStreamData.length);
    
    return NextResponse.json({
      success: true,
      count: monthlyStreamData.length,
      data: monthlyStreamData,
      summary: {
        totalStreams: monthlyStreamData.reduce((sum, item) => sum + item.count, 0),
        months: monthlyStreamData.length,
        latestMonth: monthlyStreamData[monthlyStreamData.length - 1]
      }
    });
  } catch (error) {
    console.error("Error testing monthly stream creation:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}