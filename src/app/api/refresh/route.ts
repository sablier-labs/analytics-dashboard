import { NextResponse } from "next/server";
import { fetchDailyTransactionVolume } from "@/lib/services/graphql";

// Simple endpoint to refresh 90-day data
export async function GET() {
  try {
    console.log("Fetching 90 days of transaction volume data...");
    
    const dailyData = await fetchDailyTransactionVolume(90);
    
    console.log(`Fetched ${dailyData.length} days of data`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${dailyData.length} days of transaction volume data`,
      dataLength: dailyData.length,
      firstDate: dailyData[0]?.date,
      lastDate: dailyData[dailyData.length - 1]?.date,
      preview: dailyData.slice(0, 3) // First 3 entries as preview
    });
  } catch (error) {
    console.error("Error fetching 90-day data:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}