import { NextResponse } from "next/server";
import { getCachedTotalUsers } from "@/lib/services/cache";

export async function GET() {
  try {
    console.log("Testing cache read...");
    
    const totalUsers = await getCachedTotalUsers();
    
    return NextResponse.json({
      success: true,
      totalUsers,
      message: "Cache read successful"
    });
  } catch (error) {
    console.error("Cache read error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Cache read failed"
    });
  }
}