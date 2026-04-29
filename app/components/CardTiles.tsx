import Image from "next/image";
import Link from "next/link";
import type { PokemonCard, PokemonSet } from "../lib/card-types";

export function CardGrid({ cards }: { cards: PokemonCard[] }) {
  return (
    <div className="card-grid">
      {cards.map((card) => (
        <Link className="product-card" href={`/listing?card=${card.id}`} key={card.id}>
          <CardImage card={card} />
          <span className="product-card-copy">
            <strong>{card.name}</strong>
            <small>{displaySetName(card)}</small>
            <em>
              {card.number}
              {card.set.printedTotal ? `/${card.set.printedTotal}` : ""} ·{" "}
              {card.rarity ?? "Unknown rarity"}
            </em>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function CardImage({ card }: { card: PokemonCard }) {
  if (!card.images?.small) {
    return <span className="card-image-placeholder" />;
  }

  return (
    <Image
      alt=""
      className="card-image"
      height={168}
      sizes="76px"
      src={card.images.small}
      width={120}
    />
  );
}

export function SetLogo({ set }: { set: PokemonSet }) {
  const src = set.images?.logo ?? set.images?.symbol;

  if (!src) {
    return <span className="set-logo-placeholder">{set.name.slice(0, 2)}</span>;
  }

  return (
    <Image
      alt=""
      className="set-logo"
      height={72}
      sizes="180px"
      src={src}
      style={{ height: "auto", maxHeight: "72px", maxWidth: "100%", width: "auto" }}
      width={180}
    />
  );
}

export function displaySetName(card: PokemonCard): string {
  return card.set.name || card.set.id || "Unknown set";
}
