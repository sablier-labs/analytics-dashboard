import { NextResponse } from "next/server";
import { get } from "@vercel/edge-config";

export async function GET() {
  try {
    // Check if Edge Config is available
    const edgeConfigUrl = process.env.EDGE_CONFIG;
    
    if (!edgeConfigUrl) {
      return NextResponse.json({
        error: "EDGE_CONFIG environment variable not set",
        available: false
      });
    }

    // Try to read from cache
    const cached = await get("analytics");
    
    return NextResponse.json({
      available: true,
      edgeConfigSet: !!edgeConfigUrl,
      cacheExists: !!cached,
      cacheKeys: cached ? Object.keys(cached) : null,
      lastUpdated: cached?.lastUpdated || null
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      available: false
    });
  }
}