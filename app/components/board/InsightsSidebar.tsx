import type { DimensionCard } from "./model";
import { dimensionToneStyle } from "./shared";

export default function InsightsSidebar({
  isZh,
  dimensionCards,
  activeDimension,
  onToggleDimension,
  reportBriefs,
}: {
  isZh: boolean;
  dimensionCards: DimensionCard[];
  activeDimension: string | null;
  onToggleDimension: (key: string) => void;
  reportBriefs: Array<{ label: string; value: string; meta: string }>;
}) {
  const activeCard = dimensionCards.find((card) => card.key === activeDimension) || dimensionCards[0] || null;
  const leadingCards = dimensionCards.slice(0, 4);
  const keyBriefs = reportBriefs.slice(0, 3);
  const trendingCards = dimensionCards
    .slice()
    .sort((a, b) => (b.newsCount + b.signalCount) - (a.newsCount + a.signalCount))
    .slice(0, 5);

  return (
    <aside className="board-panel-stack board-right-rail">
      <section className="board-section board-panel board-panel-side board-right-rail-section">
        <div className="board-section-head">
          <div>
            <div className="board-panel-label">{isZh ? "Most Active" : "Most Active"}</div>
            <h2>{isZh ? "市场热点" : "What's leading the tape"}</h2>
          </div>
        </div>

        <div className="board-right-rail-list board-right-rail-list-trending">
          {trendingCards.map((card, index) => (
            <button
              key={`trending-${card.key}`}
              type="button"
              className={`board-dimension-card board-dimension-card-editorial ${activeDimension === card.key ? "board-dimension-card-active" : ""}`}
              onClick={() => onToggleDimension(card.key)}
              style={dimensionToneStyle(card.tone)}
            >
              <div className="board-dimension-head">
                <span>{index + 1}. {card.label}</span>
                <span className={`board-dimension-state board-dimension-state-${card.state}`}>{card.state}</span>
              </div>
              <div className="board-dimension-metrics">
                <span>{card.newsCount} {isZh ? "新闻" : "news"}</span>
                <span>{card.signalCount} {isZh ? "信号" : "signals"}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="board-section board-panel board-panel-side board-right-rail-section">
        <div className="board-section-head">
          <div>
            <div className="board-panel-label">{isZh ? "Coverage Lens" : "Coverage Lens"}</div>
            <h2>{isZh ? "主题镜头" : "Coverage lenses"}</h2>
          </div>
        </div>

        {activeCard ? (
          <div className="board-dimension-focus board-dimension-focus-feature" style={dimensionToneStyle(activeCard.tone)}>
            <div className="board-panel-label">{isZh ? "焦点镜头" : "Featured Lens"}</div>
            <div className="board-dimension-focus-title">{activeCard.label}</div>
            <p className="board-dimension-focus-copy">{activeCard.description}</p>
            <div className="board-dimension-focus-grid">
              <div>
                <span>{activeCard.newsCount}</span>
                <small>{isZh ? "新闻" : "news"}</small>
              </div>
              <div>
                <span>{activeCard.signalCount}</span>
                <small>{isZh ? "信号" : "signals"}</small>
              </div>
              <div>
                <span>{activeCard.thresholdCount}</span>
                <small>thresholds</small>
              </div>
            </div>
          </div>
        ) : null}

        <div className="board-right-rail-list">
          <div className="board-panel-label">{isZh ? "镜头列表" : "Lens Watchlist"}</div>
          {leadingCards.map((card) => {
            const active = activeDimension === card.key;

            return (
              <button
                key={card.key}
                type="button"
                className={`board-dimension-card board-dimension-card-editorial ${active ? "board-dimension-card-active" : ""}`}
                onClick={() => onToggleDimension(card.key)}
                style={dimensionToneStyle(card.tone)}
              >
                <div className="board-dimension-head">
                  <span>{card.label}</span>
                  <span className={`board-dimension-state board-dimension-state-${card.state}`}>{card.state}</span>
                </div>
                <p>{card.description}</p>
                <div className="board-dimension-metrics">
                  <span>{card.newsCount} {isZh ? "新闻" : "news"}</span>
                  <span>{card.signalCount} {isZh ? "信号" : "signals"}</span>
                  <span>{card.thresholdCount} {isZh ? "阈值" : "thresholds"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="board-section board-panel board-panel-side board-right-rail-section">
        <div className="board-section-head">
          <div>
            <div className="board-panel-label">{isZh ? "Market Snapshot" : "Market Snapshot"}</div>
            <h2>{isZh ? "快速市场摘要" : "Quick market read"}</h2>
          </div>
        </div>

        <div className="board-right-rail-list board-right-rail-list-briefs">
          {keyBriefs.map((item) => (
            <div key={item.label} className="board-brief-card board-brief-card-editorial">
              <div className="board-panel-label">{item.label}</div>
              <div className="board-brief-value">{item.value}</div>
              <div className="board-brief-copy">{item.meta}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="board-section board-panel board-panel-side board-right-rail-section">
        <div className="board-section-head">
          <div>
            <div className="board-panel-label">{isZh ? "Editor's Note" : "Editor's Note"}</div>
            <h2>{isZh ? "阅读顺序" : "Reading order"}</h2>
          </div>
        </div>

        <div className="board-standard-grid board-standard-grid-editorial">
          <div className="board-standard-card board-standard-card-editorial">
            <div className="board-panel-label">{isZh ? "阅读顺序" : "Reading Order"}</div>
            <div className="board-brief-value">{isZh ? "头条优先" : "Lead First"}</div>
            <p className="board-brief-copy">
              {isZh ? "先读头条，再进入新闻流、市场栏与镜头。" : "Start with the lead, then move through the feed, markets, and lens."}
            </p>
          </div>
          <div className="board-standard-card board-standard-card-editorial">
            <div className="board-panel-label">{isZh ? "界面语言" : "Interface Language"}</div>
            <div className="board-brief-value">{isZh ? "媒体优先" : "Editorial"}</div>
            <p className="board-brief-copy">
              {isZh ? "按财经首页组织内容，而不是按后台模块组织内容。" : "Organized like a financial homepage, not a control panel."}
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
