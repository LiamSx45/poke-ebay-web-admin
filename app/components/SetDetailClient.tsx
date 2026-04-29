"use client";

import { useEffect, useState } from "react";
import type { CardSearchResponse, PokemonCard, PokemonSet } from "../lib/card-types";
import { CardGrid, SetLogo } from "./CardTiles";

export function SetDetailClient({ set }: { set: PokemonSet }) {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCards() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          set: set.id,
          sort: "number",
          limit: "500"
        });
        const response = await fetch(`/api/cards?${params.toString()}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Set cards failed.");
        }

        const data = (await response.json()) as CardSearchResponse;
        setCards(data.cards);
      } catch (cardsError) {
        if (!controller.signal.aborted) {
          setError(cardsError instanceof Error ? cardsError.message : "Set cards failed.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => controller.abort();
  }, [set.id]);

  return (
    <section className="dashboard-card page-section">
      <div className="set-detail-hero">
        <SetLogo set={set} />
        <div>
          <p className="eyebrow">{set.series}</p>
          <h2>{set.name}</h2>
          <p>
            {set.printedTotal ?? set.total ?? "Unknown"} printed cards
            {set.releaseDate ? ` · Released ${set.releaseDate}` : ""}
          </p>
        </div>
        <span className={`status-pill ${loading ? "is-loading" : ""}`}>
          {loading ? "Loading" : `${cards.length} cards`}
        </span>
      </div>

      {error ? <div className="notice warning">{error}</div> : null}
      <CardGrid cards={cards} />
    </section>
  );
}
