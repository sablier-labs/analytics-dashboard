import { NextResponse } from "next/server";
import { getCachedTotalUsers } from "@/lib/services/cache";

export async function GET() {
  try {
    const totalUsers = await getCachedTotalUsers();
    return NextResponse.json({ totalUsers });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
