import { NextResponse } from "next/server";
import { fetchTimeBasedTransactionCounts } from "@/lib/services/graphql";

export async function GET() {
  try {
    const data = await fetchTimeBasedTransactionCounts();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch time-based transactions:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}