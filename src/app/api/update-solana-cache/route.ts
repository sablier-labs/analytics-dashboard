import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSolanaCache } from "@/lib/solana-cache-update";

function verifyRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const userAgent = request.headers.get("user-agent");

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (vercelCronHeader === "1" || vercelCronHeader === "true") {
    return true;
  }

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  if (userAgent?.includes("undici")) {
    return true;
  }

  if (userAgent?.includes("vercel")) {
    return true;
  }

  const vercelDeploymentUrl = request.headers.get("x-vercel-deployment-url");
  if (vercelDeploymentUrl) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🌐 Starting Solana cache update...");
    const result = await updateSolanaCache();

    return NextResponse.json({
      message: "Solana cache updated successfully",
      result,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating Solana cache:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Failed to update Solana cache",
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
