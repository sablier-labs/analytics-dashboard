import { NextResponse } from "next/server";
import { fetchStreamCategoryDistribution } from "@/lib/services/graphql";

export async function GET() {
  try {
    const data = await fetchStreamCategoryDistribution();
    
    console.log(`Stream category distribution fetched: linear=${data.linear}, dynamic=${data.dynamic}, tranched=${data.tranched}, total=${data.total}`);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in fallback-category-distribution:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}