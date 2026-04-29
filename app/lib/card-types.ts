export type PricePoint = {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
};

export type PokemonCard = {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  set: {
    id: string;
    name: string;
    series?: string;
    printedTotal?: number;
    total?: number;
    releaseDate?: string;
    images?: {
      symbol?: string;
      logo?: string;
    };
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, PricePoint>;
  };
};

export type PokemonSet = {
  id: string;
  name: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  releaseDate?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
};

export type CardIndex = {
  source: string;
  syncedAt: string;
  files: number;
  totalCards: number;
  sets?: PokemonSet[];
  cards: PokemonCard[];
};

export type CardSearchResponse = {
  cards: PokemonCard[];
  total: number;
  source: {
    source: string;
    syncedAt: string | null;
    totalCards: number;
    usingFallback: boolean;
  };
};

export type SetListResponse = {
  sets: PokemonSet[];
  source: {
    source: string;
    syncedAt: string | null;
    totalCards: number;
    usingFallback: boolean;
  };
};

export type ListingOptions = {
  condition: string;
  finish: string;
  grading: string;
  quantity: number;
  language: string;
  sku: string;
  sellerNotes: string;
};

export type ListingDraft = {
  title: string;
  subtitle: string;
  description: string;
  itemSpecifics: Record<string, string>;
  suggestedPrice: string;
  keywords: string[];
};

const TITLE_LIMIT = 80;

const conditionCopy: Record<string, string> = {
  "Near Mint": "Near Mint with minimal handling wear.",
  "Lightly Played": "Lightly Played with minor edge or surface wear.",
  "Moderately Played": "Moderately Played with visible wear from play.",
  "Heavily Played": "Heavily Played with notable wear.",
  Damaged: "Damaged condition with heavy wear or defects."
};

export const conditionOptions = [
  "Near Mint",
  "Lightly Played",
  "Moderately Played",
  "Heavily Played",
  "Damaged"
];

export const finishOptions = [
  "Auto",
  "Holofoil",
  "Reverse Holofoil",
  "Normal",
  "1st Edition",
  "Shadowless"
];

export const gradingOptions = [
  "Raw",
  "PSA 10",
  "PSA 9",
  "CGC 10",
  "BGS 9.5",
  "Other graded"
];

export function generateListingDraft(
  card: PokemonCard,
  options: ListingOptions
): ListingDraft {
  const finish = resolveFinish(card, options.finish);
  const cardNumber = formatCardNumber(card);
  const gradePrefix = options.grading === "Raw" ? "" : options.grading;
  const setName = getSetName(card);
  const title = fitTitle(
    [
      gradePrefix,
      card.name,
      setName,
      cardNumber,
      finish,
      card.rarity,
      "Pokemon TCG"
    ].filter(Boolean)
  );

  const subtitle = fitTitle(
    [
      card.set.series,
      card.supertype,
      card.types?.join(" "),
      options.condition,
      options.language
    ].filter(Boolean)
  );

  const specifics = cleanSpecifics({
    "Game": "Pokemon TCG",
    "Card Name": card.name,
    "Set": setName,
    "Card Number": cardNumber,
    "Rarity": card.rarity,
    "Finish": finish,
    "Condition": options.condition,
    "Graded": options.grading === "Raw" ? "No" : "Yes",
    "Grade": options.grading === "Raw" ? "" : options.grading,
    "Language": options.language,
    "Manufacturer": "The Pokemon Company",
    "Card Type": card.supertype,
    "Pokemon Type": card.types?.join(", "),
    "HP": card.hp,
    "Artist": card.artist,
    "Set Series": card.set.series,
    "Release Date": card.set.releaseDate
  });

  const description = [
    `${card.name} from ${setName} ${cardNumber ? `(${cardNumber})` : ""}.`,
    `${options.condition}: ${conditionCopy[options.condition] ?? "See photos for condition details."}`,
    finish ? `Finish: ${finish}.` : "",
    options.grading === "Raw"
      ? "Ungraded raw card."
      : `Professionally graded: ${options.grading}.`,
    options.sellerNotes ? `Seller notes: ${options.sellerNotes}` : "",
    "Ships sleeved, protected, and packed for transit.",
    "Please review photos and item specifics before purchasing."
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    title,
    subtitle,
    description,
    itemSpecifics: specifics,
    suggestedPrice: getSuggestedPrice(card, finish),
    keywords: buildKeywords(card, finish)
  };
}

function fitTitle(parts: Array<string | undefined>): string {
  const filtered = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  const candidates = [
    filtered,
    filtered.filter((part) => !["Pokemon TCG"].includes(part)),
    filtered.filter((part) => !part.match(/common|uncommon|rare/i)),
    filtered.filter((part) => part.length < 24)
  ];

  for (const candidate of candidates) {
    const title = candidate.join(" ").replace(/\s+/g, " ").trim();
    if (title.length <= TITLE_LIMIT) {
      return title;
    }
  }

  const compact = filtered.join(" ").replace(/\s+/g, " ").trim();
  const truncated = compact.slice(0, TITLE_LIMIT + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpace > 50 ? lastSpace : TITLE_LIMIT).trim();
}

function formatCardNumber(card: PokemonCard): string {
  const total = card.set.printedTotal ?? card.set.total;
  return total ? `${card.number}/${total}` : card.number;
}

function resolveFinish(card: PokemonCard, selectedFinish: string): string {
  if (selectedFinish !== "Auto") {
    return selectedFinish;
  }

  const priceKeys = Object.keys(card.tcgplayer?.prices ?? {});
  if (priceKeys.includes("reverseHolofoil")) {
    return "Reverse Holofoil";
  }

  if (priceKeys.includes("holofoil") || card.subtypes?.some((subtype) => /vmax|vstar|ex|gx/i.test(subtype))) {
    return "Holofoil";
  }

  return "Normal";
}

function getSuggestedPrice(card: PokemonCard, finish: string): string {
  const prices = card.tcgplayer?.prices;
  if (!prices) {
    return "";
  }

  const preferredKeys =
    finish === "Reverse Holofoil"
      ? ["reverseHolofoil", "holofoil", "normal"]
      : finish === "Holofoil"
        ? ["holofoil", "reverseHolofoil", "normal"]
        : ["normal", "holofoil", "reverseHolofoil"];

  for (const key of preferredKeys) {
    const point = prices[key];
    const value = point?.market ?? point?.mid ?? point?.low;
    if (typeof value === "number") {
      return value.toFixed(2);
    }
  }

  for (const point of Object.values(prices)) {
    const value = point.market ?? point.mid ?? point.low;
    if (typeof value === "number") {
      return value.toFixed(2);
    }
  }

  return "";
}

function buildKeywords(card: PokemonCard, finish: string): string[] {
  return [
    card.name,
    getSetName(card),
    card.set.series,
    card.rarity,
    finish,
    card.supertype,
    ...(card.subtypes ?? []),
    ...(card.types ?? []),
    "Pokemon TCG"
  ]
    .filter((keyword): keyword is string => Boolean(keyword))
    .filter((keyword, index, all) => all.indexOf(keyword) === index)
    .slice(0, 12);
}

function cleanSpecifics(input: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(input).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
}

function getSetName(card: PokemonCard): string {
  return card.set.name || card.set.id || "Unknown Set";
}
