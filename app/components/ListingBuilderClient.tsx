"use client";

import { BadgeDollarSign, Check, Clipboard, ExternalLink, Search, WandSparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  conditionOptions,
  finishOptions,
  generateListingDraft,
  gradingOptions,
  type CardSearchResponse,
  type ListingOptions,
  type PokemonCard
} from "../lib/card-types";
import { displaySetName } from "./CardTiles";

const defaultOptions: ListingOptions = {
  condition: "Near Mint",
  finish: "Auto",
  grading: "Raw",
  quantity: 1,
  language: "English",
  sku: "",
  sellerNotes: ""
};

export function ListingBuilderClient({ cardId }: { cardId?: string }) {
  const [card, setCard] = useState<PokemonCard | null>(null);
  const [loading, setLoading] = useState(Boolean(cardId));
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [options, setOptions] = useState<ListingOptions>(defaultOptions);

  useEffect(() => {
    if (!cardId) {
      return;
    }

    const activeCardId = cardId;
    const controller = new AbortController();

    async function loadCard() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/cards?id=${encodeURIComponent(activeCardId)}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Card lookup failed.");
        }

        const data = (await response.json()) as CardSearchResponse;
        setCard(data.cards[0] ?? null);
      } catch (lookupError) {
        if (!controller.signal.aborted) {
          setError(lookupError instanceof Error ? lookupError.message : "Card lookup failed.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCard();

    return () => controller.abort();
  }, [cardId]);

  const draft = useMemo(() => (card ? generateListingDraft(card, options) : null), [card, options]);

  async function copy(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1300);
  }

  function patchOptions(patch: Partial<ListingOptions>) {
    setOptions((current) => ({ ...current, ...patch }));
  }

  if (!cardId) {
    return (
      <section className="dashboard-card empty-builder">
        <Search size={26} />
        <h2>Select a card to build a listing</h2>
        <p>Start from search or set browsing, then open the listing builder for that card.</p>
        <div>
          <Link className="primary-link" href="/search">
            Search cards
          </Link>
          <Link className="secondary-link" href="/sets">
            Browse sets
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="listing-workbench" aria-label="Listing builder">
      <div className="section-header">
        <div>
          <p className="eyebrow">Listing builder</p>
          <h2>{card ? card.name : loading ? "Loading card" : "Card not found"}</h2>
        </div>
        <WandSparkles size={22} />
      </div>

      {error ? <div className="notice warning">{error}</div> : null}

      <div className="builder-layout">
        <article className="dashboard-card selected-product-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Selected card</p>
              <h3>{card ? card.name : "No card"}</h3>
            </div>
            {card?.tcgplayer?.url ? (
              <a className="link-button" href={card.tcgplayer.url} rel="noreferrer" target="_blank">
                <ExternalLink size={15} />
                TCGplayer
              </a>
            ) : null}
          </div>

          {card ? (
            <div className="selected-product">
              <div className="hero-card-frame">
                {card.images?.large ? (
                  <Image
                    alt={card.name}
                    height={440}
                    priority
                    sizes="(max-width: 900px) 46vw, 220px"
                    src={card.images.large}
                    width={316}
                  />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <dl className="details-grid">
                <div>
                  <dt>Set</dt>
                  <dd>{displaySetName(card)}</dd>
                </div>
                <div>
                  <dt>Number</dt>
                  <dd>
                    {card.number}
                    {card.set.printedTotal ? `/${card.set.printedTotal}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>Rarity</dt>
                  <dd>{card.rarity ?? "Unknown"}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{card.types?.join(", ") ?? card.supertype ?? "Card"}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="empty-state">{loading ? "Loading..." : "Card not found."}</div>
          )}
        </article>

        <article className="dashboard-card listing-controls-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Listing inputs</p>
              <h3>Sale details</h3>
            </div>
          </div>

          <ControlGroup label="Condition">
            <SegmentedControl
              options={conditionOptions}
              value={options.condition}
              onChange={(condition) => patchOptions({ condition })}
            />
          </ControlGroup>
          <ControlGroup label="Finish">
            <SegmentedControl
              options={finishOptions}
              value={options.finish}
              onChange={(finish) => patchOptions({ finish })}
            />
          </ControlGroup>
          <ControlGroup label="Grading">
            <SegmentedControl
              options={gradingOptions}
              value={options.grading}
              onChange={(grading) => patchOptions({ grading })}
            />
          </ControlGroup>

          <div className="form-grid">
            <label>
              <span>Qty</span>
              <input
                min={1}
                type="number"
                value={options.quantity}
                onChange={(event) => patchOptions({ quantity: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>Language</span>
              <input
                value={options.language}
                onChange={(event) => patchOptions({ language: event.target.value })}
              />
            </label>
            <label>
              <span>SKU</span>
              <input
                value={options.sku}
                onChange={(event) => patchOptions({ sku: event.target.value })}
                placeholder={card?.id}
              />
            </label>
          </div>

          <label className="notes-input">
            <span>Seller notes</span>
            <textarea
              value={options.sellerNotes}
              onChange={(event) => patchOptions({ sellerNotes: event.target.value })}
              placeholder="Centering, whitening, surface notes, extras included"
            />
          </label>
        </article>

        <article className="dashboard-card generated-copy-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Generated copy</p>
              <h3>eBay fields</h3>
            </div>
            <BadgeDollarSign size={20} />
          </div>

          {draft ? (
            <>
              <OutputField
                copied={copied}
                label="Title"
                meta={`${draft.title.length}/80`}
                onCopy={() => copy("Title", draft.title)}
                value={draft.title}
              />
              <OutputField
                copied={copied}
                label="Subtitle"
                onCopy={() => copy("Subtitle", draft.subtitle)}
                value={draft.subtitle}
              />
              <OutputField
                copied={copied}
                label="Description"
                multiline
                onCopy={() => copy("Description", draft.description)}
                value={draft.description}
              />

              <div className="price-reference">
                <span>
                  <strong>{draft.suggestedPrice ? `$${draft.suggestedPrice}` : "No price"}</strong>
                  <small>TCGplayer market reference</small>
                </span>
                {draft.suggestedPrice ? (
                  <button
                    className="icon-button"
                    onClick={() => copy("Price", draft.suggestedPrice)}
                    title="Copy price"
                    type="button"
                  >
                    {copied === "Price" ? <Check size={16} /> : <Clipboard size={16} />}
                  </button>
                ) : null}
              </div>

              <div className="specifics-panel">
                <div className="specifics-header">
                  <h4>Item specifics</h4>
                  <button
                    className="copy-button"
                    onClick={() =>
                      copy(
                        "Specifics",
                        Object.entries(draft.itemSpecifics)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join("\n")
                      )
                    }
                    type="button"
                  >
                    {copied === "Specifics" ? <Check size={16} /> : <Clipboard size={16} />}
                    Copy
                  </button>
                </div>
                <dl>
                  {Object.entries(draft.itemSpecifics).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="keyword-row">
                {draft.keywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">Select a card to generate listing copy.</div>
          )}
        </article>
      </div>
    </section>
  );
}

function ControlGroup({
  children,
  label
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <fieldset className="control-group">
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
}

function SegmentedControl({
  onChange,
  options,
  value
}: {
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <div className="segmented-control">
      {options.map((option) => (
        <button
          className={option === value ? "is-selected" : ""}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function OutputField({
  copied,
  label,
  meta,
  multiline,
  onCopy,
  value
}: {
  copied: string;
  label: string;
  meta?: string;
  multiline?: boolean;
  onCopy: () => void;
  value: string;
}) {
  return (
    <label className="output-field">
      <span>
        <strong>{label}</strong>
        {meta ? <small>{meta}</small> : null}
        <button className="icon-button" onClick={onCopy} title={`Copy ${label}`} type="button">
          {copied === label ? <Check size={16} /> : <Clipboard size={16} />}
        </button>
      </span>
      {multiline ? <textarea readOnly value={value} /> : <input readOnly value={value} />}
    </label>
  );
}
