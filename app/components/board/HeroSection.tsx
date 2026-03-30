import type { MarketStateMeta } from "./model";

function trimCopy(value: string | undefined, maxLength: number) {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export default function HeroSection({
  id,
  isZh,
  marketStateMeta,
  snapshotTime,
  reportBriefs,
  activeDimensionCard,
  onClearDimension,
  topNews,
  secondaryNews,
  topSignal,
  formatSourceLabel,
  formatRelativeAge,
}: {
  id: string;
  isZh: boolean;
  marketStateMeta: MarketStateMeta;
  snapshotTime: string;
  reportBriefs: Array<{ label: string; value: string; meta: string }>;
  activeDimensionCard: { label: string; description: string } | null;
  onClearDimension: () => void;
  topNews?: {
    id?: string;
    title: string;
    source: string;
    domain: string;
    url?: string;
    dimensions?: string[];
    dimensionLabel?: string;
    dimensionLabelZh?: string;
    summary: string;
    whyItMatters?: string;
    publishedAt: string | null;
    age: string;
  };
  secondaryNews: Array<{
    id: string;
    title: string;
    source: string;
    domain: string;
    url: string;
    summary: string;
    publishedAt: string | null;
    age: string;
    points: number;
    dimensionLabel?: string;
    dimensionLabelZh?: string;
  }>;
  topSignal?: {
    asset: string;
    direction: "bullish" | "bearish" | "neutral";
    dimensionLabel?: string;
    dimensionLabelZh?: string;
    confidence?: number;
    whyItMatters?: string;
    reason: string;
    relatedAssets?: string[];
  };
  formatSourceLabel: (source: string) => string;
  formatRelativeAge: (item: { publishedAt: string | null; age: string }) => string;
}) {
  const topNewsChips = topNews
    ? (topNews.dimensions && topNews.dimensions.length > 0
        ? topNews.dimensions
        : [topNews.dimensionLabelZh || topNews.dimensionLabel || "General"]
      ).slice(0, 3)
    : [];
  const marketBars = reportBriefs.slice(0, 3);
  const leadDeck = topNews ? trimCopy(topNews.summary, isZh ? 70 : 126) : "";
  const remainingSecondary = secondaryNews.slice(0, 4);
  const quickLinkStories = [topNews, ...secondaryNews].filter(Boolean).slice(0, 6);

  return (
    <header id={id} className="board-section board-hero-panel">
      <div className="board-hero-meta-strip">
        <span className="board-panel-label">{isZh ? "头条" : "Lead"}</span>
        <div className="board-chip-row board-chip-row-tight">
          <span className={`board-status-pill board-status-pill-${marketStateMeta.tone}`}>{marketStateMeta.label}</span>
          <span className="board-status-pill board-status-pill-muted">
            {isZh ? "快照" : "Snapshot"} {snapshotTime}
          </span>
        </div>
      </div>

      <div className="board-hero-market-strip">
        {marketBars.map((item) => (
          <div key={item.label} className="board-market-bar">
            <div className="board-panel-label">{item.label}</div>
            <div className="board-market-bar-value">{item.value}</div>
            <div className="board-market-bar-meta">{item.meta}</div>
          </div>
        ))}
      </div>

      <div className="board-hero-quicklinks">
        <span className="board-hero-quicklinks-label">{isZh ? "头条导航" : "Top Stories"}</span>
        <div className="board-hero-quicklinks-list">
          {quickLinkStories.map((item) => {
            if (!item?.title) {
              return null;
            }

            return (
              <a
                key={`${item.title}-${item.publishedAt || item.age}`}
                href={item.url || "#"}
                target={item.url ? "_blank" : undefined}
                rel={item.url ? "noopener noreferrer" : undefined}
                className="board-hero-quicklink"
              >
                {trimCopy(item.title, isZh ? 16 : 28)}
              </a>
            );
          })}
        </div>
      </div>

      <div className="board-lead-cluster">
        <article className="board-hero-lead">
          <div className="board-story-card-top">
            <span className="board-kicker">{isZh ? "头条" : "Top Story"}</span>
            {topNews ? (
              <div className="board-news-meta">
                <span>{formatSourceLabel(topNews.source)}</span>
                <span>{formatRelativeAge(topNews)}</span>
                <span>{topNews.domain}</span>
              </div>
            ) : null}
          </div>
          {topNews?.url ? (
            <a href={topNews.url} target="_blank" rel="noopener noreferrer" className="board-hero-lead-link">
              <div className="board-hero-lead-title">
                {topNews.title}
              </div>
            </a>
          ) : (
            <div className="board-hero-lead-title">
              {topNews ? topNews.title : isZh ? "暂无新闻" : "No news yet"}
            </div>
          )}
          {topNews ? (
            <>
              <p className="board-hero-lead-deck">{leadDeck}</p>
              <div className="board-chip-row board-chip-row-tight">
                {topNewsChips.map((chip) => (
                  <span key={chip} className="board-chip">{chip}</span>
                ))}
              </div>
              <p className="board-hero-lead-copy">{trimCopy(topNews.whyItMatters || topNews.summary, isZh ? 116 : 220)}</p>
            </>
          ) : null}
        </article>

        <aside className="board-lead-sidebar">
          <div className="board-lead-sidebar-block">
            <div className="board-story-card-top">
              <span className="board-panel-label">{isZh ? "头条追踪" : "Follow-ups"}</span>
              <span className="board-news-rail-meta">{remainingSecondary.length}</span>
            </div>
            <div className="board-lead-headline-list">
              {remainingSecondary.map((item) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="board-lead-headline-item">
                  <div className="board-news-meta">
                    <span>{formatSourceLabel(item.source)}</span>
                    <span>{formatRelativeAge(item)}</span>
                  </div>
                  <div className="board-lead-headline-title">{item.title}</div>
                  <p className="board-lead-headline-copy">{trimCopy(item.summary, isZh ? 42 : 86)}</p>
                </a>
              ))}
            </div>
          </div>

          {topSignal ? (
            <article className={`board-hero-rail-card board-hero-rail-card-signal board-hero-rail-card-signal-${topSignal.direction}`}>
              <div className="board-story-card-top">
                <span className="board-panel-label">{isZh ? "市场快照" : "Snapshot"}</span>
                <span className="board-hero-signal-state">
                  {isZh
                    ? topSignal.direction === "bullish"
                      ? "看涨"
                      : topSignal.direction === "bearish"
                        ? "看跌"
                        : "中性"
                    : topSignal.direction.toUpperCase()}
                </span>
              </div>
              <div className="board-hero-signal-asset">
                {topSignal.asset}
              </div>
              <p className="board-hero-story-copy">{trimCopy(topSignal.whyItMatters || topSignal.reason, isZh ? 44 : 84)}</p>
            </article>
          ) : null}

          {activeDimensionCard ? (
            <article className="board-hero-rail-card board-hero-rail-card-note">
              <div className="board-story-card-top">
                <span className="board-panel-label">{isZh ? "当前镜头" : "Lens"}</span>
                <button type="button" className="board-inline-clear" onClick={onClearDimension}>
                  {isZh ? "清除" : "Clear"}
                </button>
              </div>
              <div className="board-spotlight-title">{activeDimensionCard.label}</div>
              <p className="board-spotlight-copy">{trimCopy(activeDimensionCard.description, isZh ? 56 : 96)}</p>
            </article>
          ) : null}
        </aside>
      </div>
    </header>
  );
}
