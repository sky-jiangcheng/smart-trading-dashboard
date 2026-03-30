import { config } from "@/lib/config";
import type { BoardNavItem, BoardSectionId, BoardUiCopy, MarketStateMeta } from "./model";

export default function ReadingRail({
  ui,
  isZh,
  isRefreshing,
  marketStateMeta,
  displayNewsCount,
  signalsCount,
  triggeredThresholdCount,
  thresholdsCount,
  visibleSourceCount,
  snapshotTime,
  boardNavItems,
  activeBoardSection,
  onScrollToSection,
  onToggleLanguage,
}: {
  ui: BoardUiCopy;
  isZh: boolean;
  isRefreshing: boolean;
  marketStateMeta: MarketStateMeta;
  displayNewsCount: string;
  signalsCount: string;
  triggeredThresholdCount: string;
  thresholdsCount: string;
  visibleSourceCount: number;
  snapshotTime: string;
  boardNavItems: BoardNavItem[];
  activeBoardSection: BoardSectionId;
  onScrollToSection: (sectionId: BoardSectionId) => void;
  onToggleLanguage: () => void;
}) {
  return (
    <header className="board-topbar board-rail">
      <div className="board-masthead-strip" aria-label={isZh ? "市场横幅" : "Markets banner"}>
        <div className="board-masthead-strip-tabs">
          {["US", "EUR", "ASIA", "BONDS", "OIL", "FX", "CRYPTO"].map((item, index) => (
            <span
              key={item}
              className={`board-masthead-tab ${index === 0 ? "board-masthead-tab-active" : ""}`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="board-masthead-strip-note">
          {isZh ? "Quick Links" : "Quick Links"}:
          <span>{isZh ? " 头条 / 市场 / 趋势" : " Top stories / Markets / Trending"}</span>
        </div>
      </div>

      <div className="board-topbar-row board-topbar-row-reset">
        <div className="board-brand-lockup">
          <div className="board-brand-copy">
            <div className="board-chip-row board-chip-row-tight">
              <span className="board-kicker">{isZh ? "LIVE" : "LIVE"}</span>
              <span className={`board-status-pill board-status-pill-${marketStateMeta.tone}`}>
                <span className={`board-status-dot ${isRefreshing ? "board-status-dot-live" : ""}`} />
                {isRefreshing ? ui.refreshing : ui.upToDate}
              </span>
              <span className="board-status-pill board-status-pill-muted">
                {isZh ? "快照" : "Snapshot"} {snapshotTime}
              </span>
            </div>
            <h2>{isZh ? "SMART TRADING SPACE" : "SMART TRADING SPACE"}</h2>
            <p>{isZh ? "Markets · Business · Investing" : "Markets · Business · Investing"}</p>
          </div>
        </div>

        <div className="board-topbar-actions">
          <div className="board-topbar-summary board-topbar-summary-reset" aria-label={isZh ? "市场摘要" : "Market summary"}>
            <span className="board-topbar-summary-item">
              <strong>{displayNewsCount}</strong>
              <span>{ui.newsCountLabel}</span>
            </span>
            <span className="board-topbar-summary-item">
              <strong>{signalsCount}</strong>
              <span>{ui.signalsCountLabel}</span>
            </span>
            <span className="board-topbar-summary-item">
              <strong>{triggeredThresholdCount}/{thresholdsCount}</strong>
              <span>{isZh ? "阈值" : "thresholds"}</span>
            </span>
            <span className="board-topbar-summary-item">
              <strong>{visibleSourceCount}</strong>
              <span>{ui.sourceCountLabel}</span>
            </span>
          </div>
          <div className="board-topbar-cta board-topbar-cta-reset">
            <a href={config.adminUrl} className="board-action-primary" aria-label={ui.adminAriaLabel}>
              {ui.adminLabel}
            </a>
            <button
              type="button"
              className="board-action-secondary"
              onClick={onToggleLanguage}
              aria-label={`Switch language to ${ui.toggleLabel}`}
            >
              {ui.toggleLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="board-topnav-wrap board-topnav-wrap-reset">
        <nav className="board-topnav" aria-label={isZh ? "Board 导航" : "Board navigation"}>
          {boardNavItems.map((item, index) => {
            const active = activeBoardSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`board-topnav-item ${active ? "board-topnav-item-active" : ""}`}
                onClick={() => onScrollToSection(item.id)}
                aria-current={active ? "page" : undefined}
              >
                <span className="board-topnav-row">
                  <span className="board-topnav-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="board-topnav-meta">{item.meta}</span>
                </span>
                <span className="board-topnav-label">{item.label}</span>
                <span className="board-topnav-hint">{item.hint}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
