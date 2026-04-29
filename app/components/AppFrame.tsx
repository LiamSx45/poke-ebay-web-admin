import Link from "next/link";
import type { ReactNode } from "react";
import { Database, Layers, Search, Store, WandSparkles } from "lucide-react";

type AppFrameProps = {
  active: "dashboard" | "search" | "sets" | "listing";
  children: ReactNode;
  kicker?: string;
  title: string;
  totalCards?: number;
};

const navItems = [
  { href: "/", key: "dashboard", label: "Dashboard", icon: Store },
  { href: "/search", key: "search", label: "Search", icon: Search },
  { href: "/sets", key: "sets", label: "Sets", icon: Layers },
  { href: "/listing", key: "listing", label: "Listing", icon: WandSparkles }
] as const;

export function AppFrame({ active, children, kicker, title, totalCards }: AppFrameProps) {
  return (
    <main className="admin-shell">
      <aside className="app-sidebar">
        <Link className="brand-lockup" href="/">
          <div className="brand-mark">TCG</div>
          <div>
            <strong>PokéList</strong>
            <small>eBay admin</small>
          </div>
        </Link>

        <nav className="app-nav" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={active === item.key ? "is-active" : ""}
                href={item.href}
                key={item.key}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-status">
          <Database size={18} />
          <span>
            <strong>{totalCards ? totalCards.toLocaleString() : "Local"}</strong>
            indexed cards
          </span>
        </div>
      </aside>

      <section className="app-main">
        <header className="page-topbar">
          <div>
            <p className="eyebrow">{kicker ?? "Pokemon eBay Admin"}</p>
            <h1>{title}</h1>
          </div>
          <div className="topbar-meta">
            <span>Draft mode</span>
            <strong>Local catalog</strong>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
