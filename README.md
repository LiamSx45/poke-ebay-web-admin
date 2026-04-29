# Pokemon eBay Web Admin

A modern Next.js admin dashboard for creating eBay listing copy from Pokemon TCG card data.

The app lets you search cards, browse sets by logo, open full set checklists, and generate listing-ready titles, descriptions, item specifics, keywords, and price references for a selected card.

## Highlights

- Search Pokemon cards by name, set, number, rarity, or type
- Browse the full Pokemon TCG set catalog with set logos
- Open dedicated set pages with complete card checklists
- Generate eBay-ready listing copy from selected card metadata
- Copy title, subtitle, description, price, and item specifics
- Uses local synced data from `PokemonTCG/pokemon-tcg-data`
- Built as a routed admin app, not a single-page demo

## App Routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard overview and primary workflows |
| `/search` | Card search and sorting |
| `/sets` | Set logo browser |
| `/sets/[setId]` | Full card checklist for a set |
| `/listing?card=base1-4` | eBay listing builder for a selected card |
| `/api/cards` | Card search, set filtering, and id lookup |
| `/api/sets` | Set catalog API |

## Tech Stack

- Next.js `16.2.4`
- React `19.2.5`
- TypeScript `6.0.3`
- ESLint `9.39.4`
- Lucide React icons

## Getting Started

```bash
npm install
npm run sync:cards
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Sync

Card and set metadata is synced from the public [`PokemonTCG/pokemon-tcg-data`](https://github.com/PokemonTCG/pokemon-tcg-data) repository.

```bash
npm run sync:cards
```

This writes a local searchable index to:

```text
data/cards-index.json
```

The index is committed so the app works immediately after cloning. Run the sync command whenever you want to refresh against upstream card data.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js dev server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run sync:cards` | Fetch and rebuild the local Pokemon card index |

## Project Structure

```text
app/
  api/
    cards/          Card search and lookup API
    sets/           Set catalog API
  components/       Admin UI and client components
  lib/              Card types, search, and listing generation
  listing/          Listing builder route
  search/           Card search route
  sets/             Set browser and set detail routes
data/
  cards-index.json  Synced Pokemon TCG card index
scripts/
  sync-cards.mjs    GitHub data sync script
```

## Listing Generation

The listing builder uses card metadata plus seller inputs to create:

- eBay title with an 80-character target
- Subtitle
- Description
- Item specifics
- Suggested price reference from available TCGplayer market data
- Search keywords

Generated copy should still be reviewed against your card photos, condition, grading, and eBay category requirements before publishing.

## Deployment

This is a standard Next.js app and can be deployed anywhere that supports Next.js, including Vercel.

For hosted deployments, keep `data/cards-index.json` committed or run `npm run sync:cards` during your build process if network access is available.

## Repository

[github.com/LiamSx45/poke-ebay-web-admin](https://github.com/LiamSx45/poke-ebay-web-admin)
