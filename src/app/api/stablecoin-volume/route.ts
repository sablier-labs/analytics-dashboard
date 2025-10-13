import { get } from "@vercel/edge-config";
import { NextResponse } from "next/server";
import type { StablecoinVolumeData } from "@/lib/stablecoin-volume-cache-update";

export async function GET() {
  let cached: StablecoinVolumeData | undefined;

  // Try Edge Config cache first
  try {
    cached = await get<StablecoinVolumeData>("stablecoin_volume");
  } catch (_error) {
    console.log("Edge Config not available, falling back to direct GraphQL fetch");
  }

  if (cached) {
    return NextResponse.json(cached);
  }

  // Fallback: direct GraphQL fetch
  try {
    const { fetchTotalStablecoinVolume } = await import(
      "@/lib/services/stablecoin-volume-aggregate"
    );

    const breakdown = await fetchTotalStablecoinVolume();

    const fallbackData: StablecoinVolumeData = {
      ...breakdown,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error("Failed to fetch stablecoin volume data:", error);
    return NextResponse.json({ error: "Failed to fetch stablecoin volume data" }, { status: 500 });
  }
}
