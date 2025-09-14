import { NextResponse } from "next/server";
import { fetchStreamProperties } from "@/lib/services/graphql";

export async function GET() {
  try {
    const data = await fetchStreamProperties();
    
    console.log(`Stream properties fetched: cancelable=${data.cancelable}, transferable=${data.transferable}, both=${data.both}, total=${data.total}`);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in test-stream-properties:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}