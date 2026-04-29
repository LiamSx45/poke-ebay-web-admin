"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PokemonSet } from "../lib/card-types";
import { SetLogo } from "./CardTiles";

export function SetsClient({ sets }: { sets: PokemonSet[] }) {
  const [query, setQuery] = useState("");
  const filteredSets = useMemo(() => {
    const needle = normalizeText(query);
    if (!needle) {
      return sets;
    }

    return sets.filter((set) =>
      normalizeText([set.name, set.series, set.id].filter(Boolean).join(" ")).includes(needle)
    );
  }, [query, sets]);

  return (
    <section className="dashboard-card page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Set catalog</p>
          <h2>Choose a set</h2>
        </div>
        <span className="status-pill">{filteredSets.length} sets</span>
      </div>

      <div className="command-row single">
        <label className="command-input">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search set name or series"
          />
        </label>
      </div>

      <div className="set-logo-grid">
        {filteredSets.map((set) => (
          <Link className="set-logo-card" href={`/sets/${set.id}`} key={set.id}>
            <SetLogo set={set} />
            <span>
              <strong>{set.name}</strong>
              <small>{set.series}</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
