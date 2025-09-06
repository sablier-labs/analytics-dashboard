import { NextResponse } from "next/server";
import { get } from "@vercel/edge-config";
import { getCachedTotalUsers } from "@/lib/services/cache";

export async function GET() {
  try {
    // Test direct Edge Config access
    const directRead = await get("analytics");
    
    // Test through cache function
    const cacheFunction = await getCachedTotalUsers();
    
    return NextResponse.json({
      success: true,
      directEdgeConfig: {
        hasData: !!directRead,
        dataType: typeof directRead,
        keys: directRead && typeof directRead === 'object' ? Object.keys(directRead) : null
      },
      cacheFunction: {
        result: cacheFunction,
        type: typeof cacheFunction
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null
    });
  }
}