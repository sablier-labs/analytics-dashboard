import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    EDGE_CONFIG: process.env.EDGE_CONFIG ? "Set (length: " + process.env.EDGE_CONFIG.length + ")" : "Not set",
    EDGE_CONFIG_ID: process.env.EDGE_CONFIG_ID ? "Set" : "Not set", 
    VERCEL_ACCESS_TOKEN: process.env.VERCEL_ACCESS_TOKEN ? "Set" : "Not set",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    // Show first few chars of EDGE_CONFIG if it exists
    EDGE_CONFIG_PREVIEW: process.env.EDGE_CONFIG ? process.env.EDGE_CONFIG.substring(0, 80) + "..." : "Not available"
  };

  return NextResponse.json(envVars);
}