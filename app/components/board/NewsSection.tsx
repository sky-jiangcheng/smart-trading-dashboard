import type { BoardUiCopy, NewsItem } from "./model";
import { EmptyState, chipToneStyle } from "./shared";

function trimCopy(value: string | undefined, maxLength: number) {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export default function NewsSection({
  id,
  ui,
  isZh,
  excludedNewsIds,
  displayNewsCount,
  sourceMode,
  availableSourceCount,
  selectedSourceCount,
  sourceSearch,
  onSourceSearchChange,
  onFocusChina,
  onFocusGlobal,
  onSelectAllSources,
  onClearSources,
  groupedSources,
  filteredSources,
  selectedSources,
  getSourceCount,
  formatSourceLabel,
  onToggleSource,
  filteredBoardNews,
  activeDimension,
  formatRelativeAge,
  classifyNews,
  numberFormatter,
}: {
  id: string;
  ui: BoardUiCopy;
  isZh: boolean;
  excludedNewsIds: string[];
  displayNewsCount: string;
  sourceMode: "all" | "custom";
  availableSourceCount: string;
  selectedSourceCount: string;
  sourceSearch: string;
  onSourceSearchChange: (value: string) => void;
  onFocusChina: () => void;
  onFocusGlobal: () => void;
  onSelectAllSources: () => void;
  onClearSources: () => void;
  groupedSources: { china: Array<{ url: string }>; global: Array<{ url: string }> };
  filteredSources: Array<{ url: string; label: string }>;
  selectedSources: string[];
  getSourceCount: (source: { url: string; label: string }) => number;
  formatSourceLabel: (source: string) => string;
  onToggleSource: (sourceUrl: string) => void;
  filteredBoardNews: NewsItem[];
  activeDimension: string | null;
  formatRelativeAge: (item: { publishedAt: string | null; age: string }) => string;
  classifyNews: (item: NewsItem) => { label: string; tone: string };
  numberFormatter: Intl.NumberFormat;
}) {
  const remainingFeed = filteredBoardNews.filter((item) => !excludedNewsIds.includes(item.id));
  const editorialFeed = remainingFeed.length > 0 ? remainingFeed : filteredBoardNews;
  const headlineRiver = editorialFeed.slice(0, 16);
  const moreStories = editorialFeed.slice(16, 24);

  return (
    <section id={id} className="board-section board-panel board-panel-news">
      <div className="board-section-head">
        <div>
          <div className="board-panel-label">{isZh ? "新闻流" : "News Feed"}</div>
          <h2>{isZh ? "连续头条流" : "Rolling headlines and developing stories"}</h2>
        </div>
        <div className="board-section-meta">{displayNewsCount} {ui.newsCountLabel}</div>
      </div>

      <div className="board-news-shell board-news-shell-reset">
        <div className="board-news-primary">
          <div id="sources" className="board-filter-panel board-filter-panel-newsroom">
            <div className="board-section-head board-section-head-compact">
              <div>
                <div className="board-panel-label">{ui.sourceFilterTitle}</div>
                <p className="board-filter-hint">{ui.sourceFilterHint}</p>
              </div>
              <div className="board-section-meta">
                {sourceMode === "all"
                  ? `${availableSourceCount} ${ui.sourceCountLabel}`
                  : `${selectedSourceCount}/${availableSourceCount} ${ui.sourceCountLabel}`}
              </div>
            </div>

            <div className="board-filter-actions">
              <input
                className="board-search-input"
                value={sourceSearch}
                onChange={(e) => onSourceSearchChange(e.target.value)}
                placeholder={isZh ? "搜索来源..." : "Search sources..."}
              />
              <button type="button" className="board-filter-button board-filter-button-solid" onClick={onFocusChina}>
                {ui.chinaGroupLabel} {groupedSources.china.length}
              </button>
              <button type="button" className="board-filter-button" onClick={onFocusGlobal}>
                {ui.globalGroupLabel} {groupedSources.global.length}
              </button>
              <button type="button" className={`board-filter-button ${sourceMode === "all" ? "board-filter-button-solid" : ""}`} onClick={onSelectAllSources}>
                {ui.selectAllSources}
              </button>
              <button type="button" className={`board-filter-button ${sourceMode === "custom" && selectedSources.length === 0 ? "board-filter-button-solid" : ""}`} onClick={onClearSources}>
                {ui.clearSources}
              </button>
            </div>

            <div className="board-source-cloud board-source-cloud-newsroom">
              {filteredSources.map((source) => {
                const checked = sourceMode === "all" || selectedSources.includes(source.url);
                const sourceCount = getSourceCount(source);
                const isEmptySource = sourceCount === 0;

                return (
                  <label
                    key={source.url}
                    className={`board-source-chip ${checked ? "board-source-chip-selected" : ""} ${isEmptySource ? "board-source-chip-muted" : ""}`}
                    title={`${source.label} ${source.url}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => onToggleSource(source.url)} />
                    <span className="board-source-label">{formatSourceLabel(source.label)}</span>
                    <span className="board-source-count">{numberFormatter.format(sourceCount)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="board-headline-river">
            {headlineRiver.map((item, index) => {
              const lens = classifyNews(item);
              return (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="board-river-item">
                  <div className="board-river-time">{formatRelativeAge(item)}</div>
                  <div className="board-river-body">
                    <div className="board-river-topline">
                      <span className="board-river-index">{String(index + 1).padStart(2, "0")}</span>
                      <span>{formatSourceLabel(item.source)}</span>
                      <span>{item.domain}</span>
                    </div>
                    <div className="board-river-title">{item.title}</div>
                    <div className="board-river-meta">
                      <span className="board-chip board-chip-tone" style={chipToneStyle(lens.tone)}>
                        {lens.label}
                      </span>
                      {item.whyItMatters ? <span className="board-river-summary">{trimCopy(item.whyItMatters, isZh ? 34 : 84)}</span> : null}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <aside className="board-news-sidebar board-news-sidebar-reset">
          <div className="board-news-rail board-news-rail-sidebar">
            <div className="board-news-rail-head">
              <span className="board-panel-label">{isZh ? "继续追踪" : "Follow-ups"}</span>
              <span className="board-news-rail-meta">{isZh ? "更多头条" : "More headlines"}</span>
            </div>
            <div className="board-news-rail-list">
              {moreStories.map((item, index) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="board-news-rail-item">
                  <div className="board-news-rail-marker">
                    <span className="board-news-rail-index">{String(index + headlineRiver.length + 1).padStart(2, "0")}</span>
                    <span className="board-news-rail-time">{formatRelativeAge(item)}</span>
                  </div>
                  <div className="board-news-rail-body">
                    <div className="board-news-rail-topline">
                      <span>{formatSourceLabel(item.source)}</span>
                      <span>{item.domain}</span>
                    </div>
                    <div className="board-news-rail-title">{item.title}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {filteredBoardNews.length === 0 && (
        <EmptyState>
          {activeDimension ? (isZh ? "当前维度没有匹配的新闻" : "No news matches the selected dimension") : ui.noNews}
        </EmptyState>
      )}
    </section>
  );
}
