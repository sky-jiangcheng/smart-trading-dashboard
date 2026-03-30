import type { BoardUiCopy, SignalItem, ThresholdItem } from "./model";
import { THRESHOLD_CATEGORY_LABELS, getThresholdStatus, formatNumber } from "./model";
import { EmptyState } from "./shared";

function trimCopy(value: string | undefined, maxLength: number) {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export default function SignalsSection({
  id,
  ui,
  isZh,
  signalsCount,
  thresholds,
  filteredBoardSignals,
  activeDimension,
  findThresholdForSignal,
}: {
  id: string;
  ui: BoardUiCopy;
  isZh: boolean;
  signalsCount: string;
  thresholds: ThresholdItem[];
  filteredBoardSignals: SignalItem[];
  activeDimension: string | null;
  findThresholdForSignal: (asset: string) => ThresholdItem | undefined;
}) {
  const leadSignal = filteredBoardSignals[0];
  const remainingSignals = filteredBoardSignals.slice(1, 5);
  const watchThresholds = thresholds.slice(0, 4);
  const leadThreshold = leadSignal ? findThresholdForSignal(leadSignal.asset) : undefined;
  const leadThresholdStatus = leadThreshold ? getThresholdStatus(leadThreshold) : null;
  const hasSignals = filteredBoardSignals.length > 0;

  return (
    <section id={id} className="board-section board-panel board-panel-signals">
      <div className="board-section-head">
        <div>
          <div className="board-panel-label">{ui.signalsTitle}</div>
          <h2>{ui.signalsSubtitle}</h2>
        </div>
        <div className="board-section-meta">{signalsCount} {ui.signalsCountLabel}</div>
      </div>

      <div className="board-signals-shell board-signals-shell-fixed">
        <div className="board-signals-primary board-signals-primary-fixed">
          <div className="board-signals-feature-block">
            {leadSignal ? (
              <div className={`board-signal-command board-signal-command-${leadSignal.direction}`}>
                <div className="board-signal-command-top">
                  <div>
                    <div className="board-panel-label">{isZh ? "市场主线" : "Market Watch"}</div>
                    <div className="board-signal-command-asset">{leadSignal.asset}</div>
                  </div>
                  <span className="board-signal-command-direction">
                    {isZh
                      ? leadSignal.direction === "bullish"
                        ? "看涨"
                        : leadSignal.direction === "bearish"
                          ? "看跌"
                          : "中性"
                      : leadSignal.direction.toUpperCase()}
                  </span>
                </div>
                <div className="board-chip-row board-chip-row-tight">
                  {leadSignal.dimensionLabelZh || leadSignal.dimensionLabel ? (
                    <span className="board-chip">{isZh ? leadSignal.dimensionLabelZh || leadSignal.dimensionLabel : leadSignal.dimensionLabel || leadSignal.dimensionLabelZh}</span>
                  ) : null}
                  {typeof leadSignal.confidence === "number" ? (
                    <span className="board-chip">{Math.round(leadSignal.confidence * 100)}%</span>
                  ) : null}
                </div>
                <p className="board-signal-command-copy">{trimCopy(leadSignal.reason, isZh ? 58 : 112)}</p>
                {leadSignal.whyItMatters ? (
                  <p className="board-signal-command-copy board-signal-command-copy-muted">{trimCopy(leadSignal.whyItMatters, isZh ? 48 : 92)}</p>
                ) : null}
                {leadThreshold && leadThresholdStatus ? (
                  <div className="board-signal-command-footer">
                    <span>
                      {isZh ? "关键阈值" : "Key level"} {leadThreshold.symbol}
                    </span>
                    <span>
                      {leadThresholdStatus.triggered ? (isZh ? "已触发" : "Triggered") : isZh ? "观察中" : "Watching"}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="board-signal-empty-feature">
                <div className="board-panel-label">{isZh ? "市场主线" : "Market Watch"}</div>
                <div className="board-signal-empty-title">{isZh ? "当前没有新的可执行信号" : "No fresh actionable signals yet"}</div>
                <p className="board-signal-empty-copy">
                  {isZh
                    ? "这一段先收紧，只保留关键位置和等待中的市场线索。"
                    : "This block stays compact until the news tape produces stronger market signals."}
                </p>
              </div>
            )}
          </div>

          {remainingSignals.length > 0 ? (
            <div className="board-signal-monitor board-signals-watchlist-block">
              <div className="board-panel-label">{isZh ? "观察列表" : "Watchlist"}</div>
              <div className="board-signal-list board-signal-list-editorial">
                {remainingSignals.map((signal) => {
                  const matchedThreshold = findThresholdForSignal(signal.asset);
                  const thresholdStatus = matchedThreshold ? getThresholdStatus(matchedThreshold) : null;

                  return (
                    <div key={`${signal.asset}-${signal.reason}`} className={`board-signal-list-item board-signal-list-item-${signal.direction}`}>
                      <div className="board-signal-head">
                        <div className="board-signal-title">{signal.asset}</div>
                        <span className="board-signal-direction">
                          {isZh
                            ? signal.direction === "bullish"
                              ? "看涨"
                              : signal.direction === "bearish"
                                ? "看跌"
                                : "中性"
                            : signal.direction.toUpperCase()}
                        </span>
                      </div>
                      <p className="board-signal-copy">{trimCopy(signal.reason, isZh ? 46 : 90)}</p>
                      {matchedThreshold && thresholdStatus ? (
                        <div className="board-signal-list-meta">
                          <span>{isZh ? "关联阈值" : "Linked"} {matchedThreshold.symbol}</span>
                          <span>{thresholdStatus.triggered ? (isZh ? "已触发" : "Triggered") : isZh ? "观察中" : "Watching"}</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="board-signals-sidebar board-signals-sidebar-fixed">
          <div className="board-threshold-watch board-signals-levels-block">
            <div className="board-panel-label">{isZh ? "关键位置" : "Key Levels"}</div>
            <div className="board-threshold-watch-list">
              {watchThresholds.map((item) => {
                const status = getThresholdStatus(item);
                return (
                  <div key={`${item.category}-${item.symbol}`} className={`board-threshold-watch-item ${status.triggered ? "board-threshold-watch-item-live" : ""}`}>
                    <div className="board-threshold-watch-top">
                      <span className="board-threshold-symbol">{item.symbol}</span>
                      <span className="board-threshold-state">
                        {status.triggered ? (isZh ? "已触发" : "Triggered") : isZh ? "观察中" : "Watching"}
                      </span>
                    </div>
                    <div className="board-threshold-copy">
                      {item.name} · {THRESHOLD_CATEGORY_LABELS[item.category]}
                    </div>
                    <div className="board-threshold-values">
                      <span>{formatNumber(item.currentValue)} / {formatNumber(item.thresholdValue)} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {!hasSignals && (
        <EmptyState>
          {activeDimension ? (isZh ? "当前维度没有匹配的信号" : "No signals match the selected dimension") : ui.noSignals}
        </EmptyState>
      )}
    </section>
  );
}
