import { NextResponse } from "next/server";
import { getSets } from "@/app/lib/card-data";
import type { SetListResponse } from "@/app/lib/card-types";

export async function GET() {
  const { sets, index } = await getSets();

  const response: SetListResponse = {
    sets,
    source: {
      source: index.source,
      syncedAt: index.syncedAt || null,
      totalCards: index.totalCards,
      usingFallback: index.usingFallback
    }
  };

  return NextResponse.json(response);
}
