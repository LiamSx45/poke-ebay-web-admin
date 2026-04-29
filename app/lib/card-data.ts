import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CardIndex, PokemonCard, PokemonSet } from "./card-types";

export type CardSort = "relevance" | "set" | "newest" | "number";

type LoadedIndex = CardIndex & {
  usingFallback: boolean;
};

let indexCache: LoadedIndex | null = null;

const fallbackIndex: LoadedIndex = {
  source: "PokemonTCG/pokemon-tcg-data",
  syncedAt: "",
  files: 0,
  totalCards: 0,
  usingFallback: true,
  cards: []
};

export async function getCardIndex(): Promise<LoadedIndex> {
  if (indexCache) {
    return indexCache;
  }

  try {
    const dataPath = path.join(process.cwd(), "data", "cards-index.json");
    const contents = await readFile(dataPath, "utf8");
    const parsed = JSON.parse(contents) as CardIndex;
    indexCache = {
      ...parsed,
      usingFallback: false
    };
    return indexCache;
  } catch {
    indexCache = fallbackIndex;
    return indexCache;
  }
}

export async function searchCards(
  query: string,
  limit = 48,
  sort: CardSort = "relevance",
  setId = ""
) {
  const index = await getCardIndex();
  const normalizedQuery = normalize(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);

  const scopedCards = setId
    ? index.cards.filter((card) => card.set.id === setId)
    : index.cards;

  const cards = scopedCards
    .map((card) => ({
      card,
      score: scoreCard(card, normalizedQuery, tokens)
    }))
    .filter(({ score }) => score > 0 || tokens.length === 0)
    .sort((left, right) => {
      if (sort === "relevance" && right.score !== left.score) {
        return right.score - left.score;
      }

      if (sort === "set") {
        return compareBySet(left.card, right.card);
      }

      if (sort === "number") {
        return compareByNumber(left.card, right.card);
      }

      return compareByNewest(left.card, right.card);
    })
    .slice(0, limit)
    .map(({ card }) => card);

  return { cards, index };
}

export async function getSets(): Promise<{ sets: PokemonSet[]; index: LoadedIndex }> {
  const index = await getCardIndex();
  const sets = index.sets?.length ? index.sets : deriveSets(index.cards);

  return {
    index,
    sets: sets.sort(
      (left, right) =>
        dateValue(right.releaseDate) - dateValue(left.releaseDate) ||
        left.name.localeCompare(right.name)
    )
  };
}

function deriveSets(cards: PokemonCard[]): PokemonSet[] {
  const sets = new Map<string, PokemonSet>();
  for (const card of cards) {
    if (!card.set.id || sets.has(card.set.id)) {
      continue;
    }

    sets.set(card.set.id, {
      id: card.set.id,
      name: card.set.name || card.set.id,
      series: card.set.series,
      printedTotal: card.set.printedTotal,
      total: card.set.total,
      releaseDate: card.set.releaseDate,
      images: card.set.images
    });
  }

  return [...sets.values()];
}

function compareBySet(left: PokemonCard, right: PokemonCard): number {
  return (
    setName(left).localeCompare(setName(right)) ||
    compareByNumber(left, right) ||
    left.name.localeCompare(right.name)
  );
}

function compareByNewest(left: PokemonCard, right: PokemonCard): number {
  return (
    dateValue(right.set.releaseDate) - dateValue(left.set.releaseDate) ||
    setName(left).localeCompare(setName(right)) ||
    compareByNumber(left, right)
  );
}

function compareByNumber(left: PokemonCard, right: PokemonCard): number {
  return (
    setName(left).localeCompare(setName(right)) ||
    numberValue(left.number) - numberValue(right.number) ||
    left.number.localeCompare(right.number) ||
    left.name.localeCompare(right.name)
  );
}

function scoreCard(card: PokemonCard, query: string, tokens: string[]): number {
  if (!query) {
    return dateValue(card.set.releaseDate) / 100000000000;
  }

  const haystack = normalize(
    [
      card.name,
      setName(card),
      card.set.series,
      card.number,
      card.rarity,
      card.supertype,
      card.artist,
      ...(card.subtypes ?? []),
      ...(card.types ?? [])
    ].join(" ")
  );

  let score = 0;
  if (normalize(card.name) === query) {
    score += 80;
  }
  if (normalize(card.name).startsWith(query)) {
    score += 50;
  }
  if (haystack.includes(query)) {
    score += 30;
  }

  for (const token of tokens) {
    if (normalize(card.name).includes(token)) {
      score += 14;
    } else if (normalize(setName(card)).includes(token)) {
      score += 8;
    } else if (haystack.includes(token)) {
      score += 4;
    }
  }

  if (score > 0 && (card.images?.small || card.images?.large)) {
    score += 2;
  }

  return score;
}

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function setName(card: PokemonCard): string {
  return card.set.name || card.set.id || "Unknown Set";
}

function dateValue(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function numberValue(value: string | undefined): number {
  const parsed = Number.parseFloat(value?.match(/\d+(\.\d+)?/)?.[0] ?? "");
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}
