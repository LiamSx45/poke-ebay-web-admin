"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { CardSearchResponse, PokemonCard } from "../lib/card-types";
import { CardGrid } from "./CardTiles";

const sortOptions = [
  { label: "Best match", value: "relevance" },
  { label: "Set A-Z", value: "set" },
  { label: "Newest set", value: "newest" },
  { label: "Card number", value: "number" }
];

export function SearchClient() {
  const [query, setQuery] = useState("charizard");
  const [sort, setSort] = useState("relevance");
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ q: query, sort, limit: "96" });
        const response = await fetch(`/api/cards?${params.toString()}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Card search failed.");
        }

        const data = (await response.json()) as CardSearchResponse;
        setCards(data.cards);
      } catch (searchError) {
        if (!controller.signal.aborted) {
          setError(searchError instanceof Error ? searchError.message : "Card search failed.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query, sort]);

  return (
    <section className="dashboard-card page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Catalog search</p>
          <h2>Search for a card</h2>
        </div>
        <span className={`status-pill ${loading ? "is-loading" : ""}`}>
          {loading ? "Loading" : `${cards.length} results`}
        </span>
      </div>

      <div className="command-row">
        <label className="command-input">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Charizard, 151, Secret Rare, SV..."
          />
        </label>
        <label className="select-control">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <div className="notice warning">{error}</div> : null}
      <CardGrid cards={cards} />
    </section>
  );
}
