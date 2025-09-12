import { NextResponse } from "next/server";
import { fetchTopAssetsByStreamCount } from "@/lib/services/graphql";

// Test endpoint to verify the GraphQL query works
export async function GET() {
  try {
    console.log("Testing top assets GraphQL query...");
    
    const topAssets = await fetchTopAssetsByStreamCount();
    
    console.log("Top assets fetched successfully:", topAssets.length);
    
    return NextResponse.json({
      success: true,
      count: topAssets.length,
      data: topAssets
    });
  } catch (error) {
    console.error("Error testing top assets:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}