import Link from "next/link";
import { Layers, Search, WandSparkles } from "lucide-react";
import { AppFrame } from "./components/AppFrame";
import { getCardIndex, getSets } from "./lib/card-data";

export default async function Home() {
  const index = await getCardIndex();
  const { sets } = await getSets();

  return (
    <AppFrame active="dashboard" title="Dashboard" totalCards={index.totalCards}>
      <section className="dashboard-metrics" aria-label="Dashboard summary">
        <div className="metric-card">
          <span>{index.totalCards.toLocaleString()}</span>
          <div>
            <small>Cards indexed</small>
            <strong>Pokemon TCG data</strong>
          </div>
        </div>
        <div className="metric-card">
          <span>{sets.length}</span>
          <div>
            <small>Sets</small>
            <strong>Logo catalog ready</strong>
          </div>
        </div>
        <div className="metric-card">
          <span>80</span>
          <div>
            <small>Title limit</small>
            <strong>eBay optimized</strong>
          </div>
        </div>
        <div className="metric-card">
          <span>3</span>
          <div>
            <small>Core flows</small>
            <strong>Search, sets, listing</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card action-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Primary workflows</p>
              <h2>Create listings faster</h2>
            </div>
          </div>

          <div className="workflow-list">
            <Link href="/search">
              <Search size={18} />
              <span>
                <strong>Search cards</strong>
                <small>Find by name, set, number, rarity, or type.</small>
              </span>
            </Link>
            <Link href="/sets">
              <Layers size={18} />
              <span>
                <strong>Browse sets</strong>
                <small>Open a set page and select from the full checklist.</small>
              </span>
            </Link>
            <Link href="/listing">
              <WandSparkles size={18} />
              <span>
                <strong>Listing builder</strong>
                <small>Generate title, description, item specifics, and price reference.</small>
              </span>
            </Link>
          </div>
        </div>

        <div className="dashboard-card recent-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recent sets</p>
              <h2>Latest catalog drops</h2>
            </div>
            <Link className="text-link" href="/sets">
              View all
            </Link>
          </div>

          <div className="compact-set-list">
            {sets.slice(0, 8).map((set) => (
              <Link href={`/sets/${set.id}`} key={set.id}>
                <span>
                  <strong>{set.name}</strong>
                  <small>{set.series}</small>
                </span>
                <em>{set.releaseDate ?? "Unknown"}</em>
              </Link>
            ))}
          </div>
        </div>

        <div className="dashboard-card checklist-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Listing checklist</p>
              <h2>Before publish</h2>
            </div>
          </div>

          <ul className="admin-checklist">
            <li>Confirm condition against photos</li>
            <li>Choose finish and grading status</li>
            <li>Review eBay title length</li>
            <li>Copy item specifics into listing form</li>
          </ul>
        </div>
      </section>
    </AppFrame>
  );
}
