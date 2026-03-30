import { config } from "@/lib/config";
import type { BoardNavItem, BoardSectionId } from "./model";

export default function BoardFooter({
  isZh,
  boardNavItems,
  onScrollToSection,
  onToggleLanguage,
  topSources,
  snapshotTime,
  displayNewsCount,
  signalsCount,
  visibleSourceCount,
}: {
  isZh: boolean;
  boardNavItems: BoardNavItem[];
  onScrollToSection: (sectionId: BoardSectionId) => void;
  onToggleLanguage: () => void;
  topSources: Array<{ url: string; label: string; count: number }>;
  snapshotTime: string;
  displayNewsCount: string;
  signalsCount: string;
  visibleSourceCount: number;
}) {
  return (
    <footer className="board-footer">
      <div className="board-footer-brand-row">
        <div>
          <div className="board-footer-brand">SMART TRADING SPACE</div>
          <p className="board-footer-copy">
            {isZh
              ? "按财经首页方式组织头条、市场和来源，所有入口都基于当前真实内容。"
              : "An editorial trading homepage built from the real stories, signals, and sources in view."}
          </p>
        </div>
        <div className="board-footer-stats">
          <span><strong>{displayNewsCount}</strong> {isZh ? "条新闻" : "news"}</span>
          <span><strong>{signalsCount}</strong> {isZh ? "条信号" : "signals"}</span>
          <span><strong>{visibleSourceCount}</strong> {isZh ? "个来源" : "sources"}</span>
        </div>
      </div>

      <div className="board-footer-grid">
        <section className="board-footer-column">
          <h3>{isZh ? "栏目导览" : "Sections"}</h3>
          <div className="board-footer-link-list">
            {boardNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="board-footer-link-button"
                onClick={() => onScrollToSection(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.meta}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="board-footer-column">
          <h3>{isZh ? "主要来源" : "Top Sources"}</h3>
          <div className="board-footer-link-list">
            {topSources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="board-footer-link"
              >
                <span>{source.label}</span>
                <small>{source.count} {isZh ? "条" : "items"}</small>
              </a>
            ))}
          </div>
        </section>

        <section className="board-footer-column">
          <h3>{isZh ? "工作台" : "Workspace"}</h3>
          <div className="board-footer-link-list">
            <a href={config.adminUrl} className="board-footer-link">
              <span>{isZh ? "管理台" : "Admin Console"}</span>
              <small>{isZh ? "跨项目控制入口" : "cross-project controls"}</small>
            </a>
            <a href={config.apiUrl} className="board-footer-link">
              <span>{isZh ? "数据接口" : "Data API"}</span>
              <small>{isZh ? "实时数据服务" : "live data service"}</small>
            </a>
            <button type="button" className="board-footer-link-button" onClick={onToggleLanguage}>
              <span>{isZh ? "切换到英文" : "Switch to Chinese"}</span>
              <small>{isZh ? "当前语言：中文" : "current language: English"}</small>
            </button>
          </div>
        </section>

        <section className="board-footer-column">
          <h3>{isZh ? "当前快照" : "Current Snapshot"}</h3>
          <div className="board-footer-note">
            <p>{isZh ? "页面内容和页脚统计保持同步，不展示没有对应数据的壳子模块。" : "This footer mirrors the live page state and avoids placeholder modules without backing data."}</p>
            <p>{isZh ? `快照时间 ${snapshotTime}` : `Snapshot ${snapshotTime}`}</p>
          </div>
        </section>
      </div>
    </footer>
  );
}
