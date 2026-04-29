import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO_CONTENTS_URL =
  "https://api.github.com/repos/PokemonTCG/pokemon-tcg-data/contents/cards/en?ref=master";
const SETS_URL =
  "https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/sets/en.json";
const OUTFILE = path.join(process.cwd(), "data", "cards-index.json");
const CONCURRENCY = 8;

async function main() {
  const files = await fetchJson(REPO_CONTENTS_URL);
  const cardFiles = files
    .filter((file) => file.type === "file" && file.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const sets = await fetchJson(SETS_URL);
  const setsById = new Map(sets.map((set) => [set.id, set]));

  console.log(`Found ${cardFiles.length} card set files and ${sets.length} set records.`);

  const cards = [];
  let completed = 0;

  for (let index = 0; index < cardFiles.length; index += CONCURRENCY) {
    const batch = cardFiles.slice(index, index + CONCURRENCY);
    const batchCards = await Promise.all(
      batch.map(async (file) => {
        const setId = file.name.replace(/\.json$/, "");
        const setMeta = setsById.get(setId);
        const setCards = await fetchJson(file.download_url);
        completed += 1;
        process.stdout.write(`\rFetched ${completed}/${cardFiles.length} sets`);
        return setCards.map((card) => compactCard(card, setMeta ?? { id: setId, name: setId }));
      })
    );
    cards.push(...batchCards.flat());
  }

  process.stdout.write("\n");

  const index = {
    source: "https://github.com/PokemonTCG/pokemon-tcg-data/tree/master/cards/en",
    syncedAt: new Date().toISOString(),
    files: cardFiles.length,
    totalCards: cards.length,
    sets: sets.map(compactSet),
    cards
  };

  await mkdir(path.dirname(OUTFILE), { recursive: true });
  await writeFile(OUTFILE, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`Wrote ${cards.length} cards to ${path.relative(process.cwd(), OUTFILE)}.`);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "User-Agent": "poke-ebay-web-admin"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function compactCard(card, setMeta) {
  const set = card.set ?? setMeta;

  return {
    id: card.id,
    name: card.name,
    supertype: card.supertype,
    subtypes: card.subtypes,
    hp: card.hp,
    types: card.types,
    evolvesFrom: card.evolvesFrom,
    set: {
      id: set?.id,
      name: set?.name,
      series: set?.series,
      printedTotal: set?.printedTotal,
      total: set?.total,
      releaseDate: set?.releaseDate?.replaceAll("/", "-"),
      images: {
        symbol: set?.images?.symbol,
        logo: set?.images?.logo
      }
    },
    number: card.number,
    artist: card.artist,
    rarity: card.rarity,
    flavorText: card.flavorText,
    nationalPokedexNumbers: card.nationalPokedexNumbers,
    images: {
      small: card.images?.small,
      large: card.images?.large
    },
    tcgplayer: card.tcgplayer
      ? {
          url: card.tcgplayer.url,
          updatedAt: card.tcgplayer.updatedAt,
          prices: card.tcgplayer.prices
        }
      : undefined
  };
}

function compactSet(set) {
  return {
    id: set.id,
    name: set.name,
    series: set.series,
    printedTotal: set.printedTotal,
    total: set.total,
    releaseDate: set.releaseDate?.replaceAll("/", "-"),
    images: {
      symbol: set.images?.symbol,
      logo: set.images?.logo
    }
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
