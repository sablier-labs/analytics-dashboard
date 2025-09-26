import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check Edge Config freshness
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/analytics`);
    const data = await response.json();

    const lastUpdated = new Date(data.lastUpdated);
    const now = new Date();
    const hoursOld = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

    // Check if data is fresh (less than 24 hours old)
    const isDataFresh = hoursOld < 24;

    // Check if critical metrics have real data (not zeros/empty)
    const hasRealData =
      data.totalUsers > 0 &&
      data.growthRateMetrics?.userGrowthRate > 0 &&
      data.monthlyUserGrowth?.length > 0;

    const status = isDataFresh && hasRealData ? "healthy" : "unhealthy";

    return NextResponse.json({
      checks: {
        dataFreshness: {
          actual: `${Math.round(hoursOld * 100) / 100} hours`,
          status: isDataFresh ? "pass" : "fail",
          threshold: "< 24 hours",
        },
        realData: {
          growthRate: data.growthRateMetrics?.userGrowthRate || 0,
          monthlyDataPoints: data.monthlyUserGrowth?.length || 0,
          status: hasRealData ? "pass" : "fail",
          totalUsers: data.totalUsers,
        },
      },
      hoursOld: Math.round(hoursOld * 100) / 100,
      lastUpdated: data.lastUpdated,
      message:
        status === "healthy"
          ? "Edge Config is fresh and has real data"
          : "Edge Config is stale or contains zero/empty data",
      status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Unable to check Edge Config health",
        status: "error",
      },
      { status: 500 },
    );
  }
}
