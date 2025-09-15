import { NextResponse } from "next/server";
import { fetchMonthlyUserGrowth } from "@/lib/services/graphql";

export async function GET() {
  try {
    const data = await fetchMonthlyUserGrowth();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch monthly user growth:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}