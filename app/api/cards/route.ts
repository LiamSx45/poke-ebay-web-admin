import { NextResponse } from "next/server";
import { getCardIndex, searchCards, type CardSort } from "@/app/lib/card-data";
import type { CardSearchResponse } from "@/app/lib/card-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const query = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? "48");
  const sort = toCardSort(searchParams.get("sort"));
  const setId = searchParams.get("set") ?? "";
  const boundedLimit = Math.min(Math.max(limit, 1), 500);
  const { cards, index } = id
    ? await getCardById(id)
    : await searchCards(query, boundedLimit, sort, setId);

  const response: CardSearchResponse = {
    cards,
    total: cards.length,
    source: {
      source: index.source,
      syncedAt: index.syncedAt || null,
      totalCards: index.totalCards,
      usingFallback: index.usingFallback
    }
  };

  return NextResponse.json(response);
}

async function getCardById(id: string) {
  const index = await getCardIndex();
  const card = index.cards.find((candidate) => candidate.id === id);
  return {
    cards: card ? [card] : [],
    index
  };
}

function toCardSort(value: string | null): CardSort {
  if (value === "set" || value === "newest" || value === "number") {
    return value;
  }

  return "relevance";
}
