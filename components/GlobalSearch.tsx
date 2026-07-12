"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import holdingsData from "@/data/holdings.json";
import { Holding } from "@/lib/types";
import { FEATURES } from "@/lib/searchIndex";

const dataset = holdingsData as Holding[];

interface ResultItem {
  id: string;
  kind: "stock" | "feature";
  label: string;
  sublabel: string;
  onSelect: () => void;
}

/**
 * Global command-palette style search, available on every authenticated
 * page via the Header. Starts as a magnifying-glass icon; clicking it
 * expands the icon into an inline text field (width transition, not a
 * modal), with results dropping down beneath it. Searches the live
 * 19-holding dataset (ticker, name, sector, interest tags) alongside a
 * static index of app pages/features. Opens via click or the Cmd/Ctrl+K
 * shortcut; collapses on Escape, result selection, or an outside click.
 */
export default function GlobalSearch() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function openSearch() {
    setExpanded(true);
  }

  function closeSearch() {
    setExpanded(false);
    setQuery("");
  }

  // Cmd/Ctrl+K toggles the expanded state from anywhere on an authed page.
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setExpanded((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Focus the input once it's actually visible — a short delay lets the
  // width transition finish so focus doesn't visually jump.
  useEffect(() => {
    if (expanded) {
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  // Clicking anywhere outside the search collapses it back to just the icon.
  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const results: ResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    const stockResults: ResultItem[] = dataset
      .filter(
        (h) =>
          q === "" ||
          h.ticker.toLowerCase().includes(q) ||
          h.name.toLowerCase().includes(q) ||
          h.sector.toLowerCase().includes(q) ||
          h.interestTags.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, q === "" ? 5 : 8)
      .map((h) => ({
        id: `stock-${h.ticker}`,
        kind: "stock" as const,
        label: `${h.ticker} — ${h.name}`,
        sublabel: `${h.sector} · ${h.esgScore}/10 clean-energy score`,
        onSelect: () => router.push(`/stock/${h.ticker}`),
      }));

    const featureResults: ResultItem[] = FEATURES.filter(
      (f) =>
        q === "" ||
        f.label.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.includes(q))
    ).map((f) => ({
      id: `feature-${f.id}`,
      kind: "feature" as const,
      label: f.label,
      sublabel: f.description,
      onSelect: () => {
        if (f.action === "open-chat") {
          window.dispatchEvent(new CustomEvent("ecovest:open-chat"));
        } else if (f.href) {
          router.push(f.href);
        }
      },
    }));

    return [...stockResults, ...featureResults];
  }, [query, router]);

  function selectResult(item: ResultItem) {
    item.onSelect();
    closeSearch();
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) selectResult(results[activeIndex]);
    } else if (e.key === "Escape") {
      closeSearch();
    }
  }

  const stockItems = results.filter((r) => r.kind === "stock");
  const featureItems = results.filter((r) => r.kind === "feature");

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex h-9 items-center gap-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-800/60 transition-all duration-300 ease-out ${
          expanded ? "w-[42vw] max-w-56 px-2.5 sm:w-72 sm:max-w-none" : "w-9 px-0"
        }`}
      >
        <button
          onClick={openSearch}
          aria-label="Search"
          className={`flex h-9 shrink-0 items-center justify-center text-slate-300 transition-colors hover:text-white ${
            expanded ? "w-5" : "w-9"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </button>
        {expanded && (
          <>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search stocks, features…"
              className="min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
            />
            <button
              onClick={closeSearch}
              className="shrink-0 rounded border border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
            >
              Esc
            </button>
          </>
        )}
      </div>

      {expanded && (
        <div className="animate-fade-in-up absolute right-0 top-full z-50 mt-2 max-h-96 w-[min(20rem,88vw)] overflow-y-auto rounded-xl bg-white shadow-xl sm:w-96">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-400">
              No matches for &quot;{query}&quot;.
            </p>
          ) : (
            <div className="p-2">
              {stockItems.length > 0 && (
                <div className="mb-1">
                  <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Stocks &amp; ETFs
                  </div>
                  {stockItems.map((item) => {
                    const globalIndex = results.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectResult(item)}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors ${
                          activeIndex === globalIndex ? "bg-forest-500/10" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm font-medium text-navy-900">{item.label}</span>
                        <span className="text-xs text-slate-500">{item.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {featureItems.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Pages &amp; Features
                  </div>
                  {featureItems.map((item) => {
                    const globalIndex = results.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectResult(item)}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors ${
                          activeIndex === globalIndex ? "bg-forest-500/10" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm font-medium text-navy-900">{item.label}</span>
                        <span className="text-xs text-slate-500">{item.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
