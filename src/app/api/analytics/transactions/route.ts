import { NextResponse } from "next/server";
import { getCachedTotalTransactions } from "@/lib/services/cache";

export async function GET() {
  try {
    const totalTransactions = await getCachedTotalTransactions();
    return NextResponse.json({ totalTransactions });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
