# Pokemon eBay Web Admin

A Next.js admin portal for building eBay listing copy from the public Pokemon TCG data set.

## Stack

- Next.js 16.2.4
- React 19.2.5
- TypeScript 6.0.3
- ESLint 9.39.4, the latest 9.x release supported by the current Next ESLint plugin stack

## Data

Card metadata is synced from `PokemonTCG/pokemon-tcg-data`.

```bash
npm run sync:cards
```

The sync creates `data/cards-index.json`, a compact searchable index used by `/api/cards`.

## Development

```bash
npm install
npm run sync:cards
npm run dev
```

Open `http://localhost:3000`.
