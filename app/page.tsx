"use client";

import { useEffect, useRef, useState } from "react";
import { config } from "../lib/config";

type NewsItem = {
  id: string;
  rank: number;
  title: string;
  url: string;
  domain: string;
  source: string;
  points: number;
  comments: number;
  age: string;
  publishedAt: string | null;
  summary: string;
};

type SignalItem = {
  asset: string;
  direction: "bullish" | "bearish" | "neutral";
  reason: string;
};

type SourceItem = {
  url: string;
  label: string;
};

type Lang = "en" | "zh";

const SOURCE_STORAGE_KEY = "investment-dashboard:selected-sources";

const SOURCE_LABEL_OVERRIDES: Array<[RegExp, string]> = [
  [/cnbc/i, "CNBC"],
  [/marketwatch/i, "MarketWatch"],
  [/chinanews|中国新闻网/i, "中国新闻网"],
  [/people|人民网/i, "人民网"],
  [/chinadaily|中国日报/i, "中国日报"],
  [/36kr|36氪/i, "36氪"],
];

function isChineseSource(source: string) {
  return /[\u4e00-\u9fff]/.test(source) || /中国|人民网|中国日报|中国新闻网|财联社|澎湃|新华|36kr/i.test(source);
}

const COPY: Record<
  Lang,
  {
    headerTag: string;
    headerTitle: string;
    headerDescription: string;
    refreshing: string;
    upToDate: string;
    adminLabel: string;
    adminAriaLabel: string;
    newsTitle: string;
    newsSubtitle: string;
    newsCountLabel: string;
    signalsTitle: string;
    signalsSubtitle: string;
    signalsCountLabel: string;
    pointsLabel: string;
    commentsLabel: string;
    noSignals: string;
    noNews: string;
    sourceFilterTitle: string;
    sourceFilterHint: string;
    chinaGroupLabel: string;
    globalGroupLabel: string;
    selectAllSources: string;
    clearSources: string;
    sourceCountLabel: string;
    toggleLabel: string;
  }
> = {
  en: {
    headerTag: "Smart Trading Space",
    headerTitle: "Live market news and signals",
    headerDescription:
      "A lightweight trading dashboard that keeps headlines and signals in separate lanes, so the page stays readable at a glance.",
    refreshing: "Refreshing",
    upToDate: "Up to date",
    adminLabel: "Admin",
    adminAriaLabel: "Go to admin console",
    newsTitle: "🌍 Global News",
    newsSubtitle: "Live feed refreshed every 5 seconds",
    newsCountLabel: "items",
    signalsTitle: "📈 Investment Signals",
    signalsSubtitle: "Signals inferred from the headlines above",
    signalsCountLabel: "signals",
    pointsLabel: "points",
    commentsLabel: "comments",
    noSignals: "No signals generated from current news",
    noNews: "No news matches the selected sources",
    sourceFilterTitle: "News sources",
    sourceFilterHint: "Search, group, and pick one or more feeds to focus the list.",
    chinaGroupLabel: "China",
    globalGroupLabel: "Global",
    selectAllSources: "Select all",
    clearSources: "Clear",
    sourceCountLabel: "sources",
    toggleLabel: "中文",
  },
  zh: {
    headerTag: "Smart Trading Space",
    headerTitle: "实时市场新闻与信号",
    headerDescription:
      "一个轻量化的交易看板，把新闻标题和信号分开呈现，让信息一眼就能看清。",
    refreshing: "刷新中",
    upToDate: "已更新",
    adminLabel: "管理台",
    adminAriaLabel: "进入管理台",
    newsTitle: "🌍 全球新闻",
    newsSubtitle: "每 5 秒刷新一次",
    newsCountLabel: "条",
    signalsTitle: "📈 投资信号",
    signalsSubtitle: "根据上方新闻自动生成信号",
    signalsCountLabel: "条信号",
    pointsLabel: "热度",
    commentsLabel: "评论",
    noSignals: "当前新闻暂无可生成的信号",
    noNews: "当前所选来源暂无新闻",
    sourceFilterTitle: "新闻来源",
    sourceFilterHint: "可搜索、分组，并勾选一个或多个来源来聚焦新闻列表。",
    chinaGroupLabel: "中国",
    globalGroupLabel: "国际",
    selectAllSources: "全选",
    clearSources: "清空",
    sourceCountLabel: "个来源",
    toggleLabel: "EN",
  },
};

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [sourceCatalog, setSourceCatalog] = useState<SourceItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lang, setLang] = useState<Lang>("en");
  const [sourceMode, setSourceMode] = useState<"all" | "custom">("all");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sourceSearch, setSourceSearch] = useState("");
  const newsRef = useRef<NewsItem[]>([]);
  const signalsRef = useRef<SignalItem[]>([]);
  const [sourcePrefsLoaded, setSourcePrefsLoaded] = useState(false);
  const isZh = lang === "zh";
  const ui = COPY[lang];
  const numberFormatter = new Intl.NumberFormat(isZh ? "zh-CN" : "en-US");
  const langSwapStyle = {
    animation: "lang-swap 180ms ease",
    willChange: "opacity, transform",
  } as const;
  function buildFallbackSourceCatalog(items: NewsItem[]) {
    const seen = new Set<string>();
    const catalog: SourceItem[] = [];

    items.forEach((item) => {
      const url = item.sourceUrl || item.source;
      if (!url || seen.has(url)) {
        return;
      }

      seen.add(url);
      catalog.push({
        url,
        label: item.source,
      });
    });

    return catalog;
  }

  const availableSources = sourceCatalog.length > 0 ? sourceCatalog : buildFallbackSourceCatalog(news);
  const availableSourceUrls = availableSources.map((item) => item.url);
  const sourceByUrl = new Map(availableSources.map((item) => [item.url, item]));
  const sourceByLabel = new Map(availableSources.map((item) => [item.label, item]));
  const sourceSearchTerm = sourceSearch.trim().toLowerCase();
  const sourceCounts = news.reduce<Record<string, number>>((acc, item) => {
    const key = item.sourceUrl || item.source;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const groupedSources = {
    china: availableSources.filter((source) => isChineseSource(source.label) || isChineseSource(source.url)),
    global: availableSources.filter((source) => !(isChineseSource(source.label) || isChineseSource(source.url))),
  };
  const visibleNews =
    sourceMode === "all"
      ? news
      : news.filter((item) => selectedSources.includes(item.sourceUrl || item.source));
  const visibleSourceCount = sourceMode === "all" ? availableSourceUrls.length : selectedSources.length;
  const visibleSourceLabel = sourceMode === "all" ? ui.selectAllSources : ui.sourceFilterTitle;
  const filteredSources = availableSources.filter((source) => {
    if (!sourceSearchTerm) {
      return true;
    }

    return `${source.label} ${source.url}`.toLowerCase().includes(sourceSearchTerm);
  });

  function formatSourceLabel(source: string) {
    const catalogByUrl = sourceByUrl.get(source);
    if (catalogByUrl) {
      return catalogByUrl.label;
    }

    const catalogByLabel = sourceByLabel.get(source);
    if (catalogByLabel) {
      return catalogByLabel.label;
    }

    const override = SOURCE_LABEL_OVERRIDES.find(([pattern]) => pattern.test(source));
    if (override) {
      return override[1];
    }

    if (source.length <= 34) {
      return source;
    }

    return `${source.slice(0, 31)}...`;
  }

  function formatRelativeAge(item: NewsItem) {
    if (item.publishedAt) {
      const publishedAt = new Date(item.publishedAt);
      if (!Number.isNaN(publishedAt.getTime())) {
        const diffMinutes = Math.max(1, Math.floor((Date.now() - publishedAt.getTime()) / 60000));

        if (diffMinutes < 60) {
          return isZh ? `${diffMinutes} 分钟前` : `${diffMinutes}m ago`;
        }

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
          return isZh ? `${diffHours} 小时前` : `${diffHours}h ago`;
        }

        const diffDays = Math.floor(diffHours / 24);
        return isZh ? `${diffDays} 天前` : `${diffDays}d ago`;
      }
    }

    const match = item.age.match(/^(\d+)([mhd]) ago$/i);
    if (match) {
      const value = Number(match[1]);
      const unit = match[2].toLowerCase();

      if (isZh) {
        if (unit === "m") return `${value} 分钟前`;
        if (unit === "h") return `${value} 小时前`;
        return `${value} 天前`;
      }
    }

    return item.age;
  }

  function normalizeSourceSelection(values: string[], options: SourceItem[]) {
    const byUrl = new Map(options.map((item) => [item.url, item]));
    const byLabel = new Map(options.map((item) => [item.label, item]));
    const normalized: string[] = [];

    values.forEach((value) => {
      if (byUrl.has(value)) {
        normalized.push(value);
        return;
      }

      const matched = byLabel.get(value);
      if (matched) {
        normalized.push(matched.url);
      }
    });

    return Array.from(new Set(normalized));
  }

  useEffect(() => {
    document.documentElement.lang = isZh ? "zh-CN" : "en";
  }, [isZh]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SOURCE_STORAGE_KEY);
      if (!stored) {
        setSourcePrefsLoaded(true);
        return;
      }

      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        const nextMode = parsed.mode === "custom" ? "custom" : "all";
        const nextSources = Array.isArray(parsed.sources)
          ? parsed.sources.filter((value: unknown) => typeof value === "string")
          : [];

        setSourceMode(nextMode);
        setSelectedSources(nextSources);
      }
    } catch {
      // Ignore malformed saved preferences.
    } finally {
      setSourcePrefsLoaded(true);
    }
  }, []);

  useEffect(() => {
    newsRef.current = news;
  }, [news]);

  useEffect(() => {
    signalsRef.current = signals;
  }, [signals]);

  useEffect(() => {
    if (availableSources.length === 0) {
      return;
    }

    setSelectedSources((current) => {
      const normalized = normalizeSourceSelection(current, availableSources);

      if (sourceMode === "all") {
        if (normalized.length === availableSourceUrls.length && normalized.every((source, index) => source === availableSourceUrls[index])) {
          return normalized;
        }

        return availableSourceUrls;
      }

      const next = normalized.filter((source) => availableSourceUrls.includes(source));
      if (next.length === normalized.length && next.every((source, index) => source === normalized[index])) {
        return normalized;
      }

      return next;
    });
  }, [availableSourceUrls, availableSources, sourceMode]);

  useEffect(() => {
    if (!sourcePrefsLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        SOURCE_STORAGE_KEY,
        JSON.stringify({ mode: sourceMode, sources: selectedSources }),
      );
    } catch {
      // Ignore storage failures.
    }
  }, [selectedSources, sourceMode, sourcePrefsLoaded]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsRefreshing(true);

        try {
        const [newsRes, signalsRes, sourcesRes] = await Promise.all([
          fetch(`${config.apiUrl}/news`),
          fetch(`${config.apiUrl}/signals`),
          fetch(`${config.apiUrl}/sources`),
        ]);

        const [newsData, signalData, sourceData] = await Promise.all([
          newsRes.json(),
          signalsRes.json(),
          sourcesRes.json(),
        ]);

        if (cancelled) {
          return;
        }

        const nextNews = Array.isArray(newsData) ? newsData : [];
        const nextSignals = Array.isArray(signalData) ? signalData : [];
        const nextSources = Array.isArray(sourceData?.sources) ? sourceData.sources : [];

        if (nextNews.length > 0 || newsRef.current.length === 0) {
          setNews(nextNews);
        }

        if (nextSignals.length > 0 || signalsRef.current.length === 0) {
          setSignals(nextSignals);
        }

        if (nextSources.length > 0 || sourceCatalog.length === 0) {
          setSourceCatalog(
            nextSources
              .filter((item: unknown): item is SourceItem => {
                return Boolean(item) && typeof item === "object" && typeof (item as SourceItem).url === "string" && typeof (item as SourceItem).label === "string";
              })
              .map((item: SourceItem) => ({ url: item.url, label: item.label })),
          );
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }

    load();

    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sourceCatalog.length]);

  function selectAllSources() {
    setSourceMode("all");
    setSelectedSources(availableSourceUrls);
  }

  function clearSources() {
    setSourceMode("custom");
    setSelectedSources([]);
  }

  function focusSourceGroup(group: "china" | "global") {
    const nextSources = groupedSources[group];
    setSourceMode("custom");
    setSelectedSources(nextSources.map((source) => source.url));
  }

  function toggleSource(sourceUrl: string) {
    setSourceMode("custom");
    setSelectedSources((current) => {
      const base = sourceMode === "all" ? availableSourceUrls : current;

      if (base.includes(sourceUrl)) {
        return base.filter((item) => item !== sourceUrl);
      }

      return [...base, sourceUrl];
    });
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "14px 18px 12px",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.72) 100%)",
          backdropFilter: "blur(14px)",
        }}
      >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minWidth: 280,
              minHeight: 98,
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.08)",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  color: "#334155",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {ui.headerTag}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  borderRadius: 999,
                  backgroundColor: isRefreshing ? "rgba(202,138,4,0.12)" : "rgba(34,197,94,0.12)",
                  color: isRefreshing ? "#a16207" : "#15803d",
                  border: `1px solid ${isRefreshing ? "rgba(202,138,4,0.18)" : "rgba(34,197,94,0.18)"}`,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    backgroundColor: isRefreshing ? "#f59e0b" : "#22c55e",
                    boxShadow: isRefreshing ? "0 0 0 3px rgba(245,158,11,0.15)" : "0 0 0 3px rgba(34,197,94,0.15)",
                  }}
                />
                {isRefreshing ? ui.refreshing : ui.upToDate}
              </div>
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: 1.05,
                  color: "#0f172a",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                {ui.headerTitle}
              </h1>
              <div
                style={{
                  marginTop: 8,
                  maxWidth: 720,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "#475569",
                  minHeight: 40,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {ui.headerDescription}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
              flex: "1 1 420px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                flex: "0 0 176px",
                minWidth: 176,
                padding: "10px 12px",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.72)",
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
                minHeight: 68,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>
                {ui.sourceFilterTitle}
              </div>
              <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>{visibleSourceCount}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                {visibleSourceLabel}
              </div>
            </div>
            <a
              href={config.adminUrl}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 92,
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "rgba(255,255,255,0.86)",
                color: "#0f172a",
                borderRadius: 14,
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                textDecoration: "none",
                flexShrink: 0,
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
              }}
              aria-label={ui.adminAriaLabel}
              title={ui.adminLabel}
            >
              {ui.adminLabel}
            </a>
            <button
              type="button"
              onClick={() => setLang((current) => (current === "en" ? "zh" : "en"))}
              style={{
                border: "1px solid rgba(15, 23, 42, 0.08)",
                backgroundColor: "rgba(255,255,255,0.86)",
                color: "#0f172a",
                borderRadius: 14,
                padding: "10px 14px",
                minWidth: 60,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
              }}
              aria-label={`Switch language to ${ui.toggleLabel}`}
            >
              {ui.toggleLabel}
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
          gap: 16,
          padding: 16,
          background: "transparent",
        }}
      >
        <section
          style={{
            flex: 1,
            minWidth: 0,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 20,
            padding: 16,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              marginBottom: 14,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div key={`${lang}-news-heading`} style={{ ...langSwapStyle, minHeight: 62, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h2 style={{ margin: 0, fontSize: 20, color: "#0f172a", fontWeight: 800, lineHeight: 1.2 }}>
                {ui.newsTitle}
              </h2>
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", lineHeight: 1.35, minHeight: 32 }}>
                {ui.newsSubtitle}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", minWidth: 88, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {numberFormatter.format(visibleNews.length)} {ui.newsCountLabel}
            </div>
          </div>

          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              borderRadius: 16,
              backgroundColor: "rgba(248, 250, 252, 0.92)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                minHeight: 42,
              }}
            >
              <div key={`${lang}-source-copy`} className="lang-swap" style={{ fontSize: 11, color: "#64748b", lineHeight: 1.35, minWidth: 0, flex: "1 1 260px" }}>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{ui.sourceFilterTitle}</div>
                <div>{ui.sourceFilterHint}</div>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                {sourceMode === "all"
                  ? `${numberFormatter.format(availableSourceUrls.length)} ${ui.sourceCountLabel}`
                  : `${numberFormatter.format(selectedSources.length)}/${numberFormatter.format(availableSourceUrls.length)} ${ui.sourceCountLabel}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <input
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                placeholder={isZh ? "搜索来源..." : "Search sources..."}
                style={{
                  flex: "1 1 220px",
                  minWidth: 0,
                  minHeight: 38,
                  padding: "9px 11px",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.12)",
                  backgroundColor: "#fff",
                  color: "#0f172a",
                  fontSize: 12,
                }}
              />
              <button
                type="button"
                onClick={() => focusSourceGroup("china")}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: 999,
                  padding: "9px 12px",
                  minWidth: 88,
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {ui.chinaGroupLabel} {groupedSources.china.length}
              </button>
              <button
                type="button"
                onClick={() => focusSourceGroup("global")}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: 999,
                  padding: "9px 12px",
                  minWidth: 88,
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {ui.globalGroupLabel} {groupedSources.global.length}
              </button>
              <button
                type="button"
                onClick={selectAllSources}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: 999,
                  padding: "9px 12px",
                  minWidth: 92,
                  backgroundColor: sourceMode === "all" ? "#0f172a" : "#ffffff",
                  color: sourceMode === "all" ? "#ffffff" : "#0f172a",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {ui.selectAllSources}
              </button>
              <button
                type="button"
                onClick={clearSources}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: 999,
                  padding: "9px 12px",
                  minWidth: 72,
                  backgroundColor: sourceMode === "custom" && selectedSources.length === 0 ? "#0f172a" : "#ffffff",
                  color: sourceMode === "custom" && selectedSources.length === 0 ? "#ffffff" : "#0f172a",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {ui.clearSources}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {filteredSources.map((source) => {
                const checked = sourceMode === "all" || selectedSources.includes(source.url);

                return (
                  <label
                    key={source.url}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      backgroundColor: checked ? "#0f172a" : "#ffffff",
                      color: checked ? "#ffffff" : "#000000",
                      fontSize: 11,
                      cursor: "pointer",
                      userSelect: "none",
                      maxWidth: 260,
                    }}
                    title={`${source.label} ${source.url}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSource(source.url)}
                      style={{ accentColor: "#000000" }}
                    />
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        verticalAlign: "bottom",
                      }}
                    >
                      {formatSourceLabel(source.label)}
                    </span>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 999,
                        backgroundColor: checked ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.06)",
                        fontSize: 10,
                        color: checked ? "rgba(255,255,255,0.92)" : "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      {numberFormatter.format(sourceCounts[source.url] || sourceCounts[source.label] || 0)}
                    </span>
                  </label>
                );
              })}
              {filteredSources.length === 0 && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px dashed rgba(15,23,42,0.14)",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    color: "#64748b",
                    fontSize: 11,
                  }}
                >
                  {isZh ? "没有匹配的来源" : "No matching sources"}
                </div>
              )}
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {visibleNews.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginBottom: 12,
                  padding: "14px",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
                  lineHeight: 1.35,
                  textDecoration: "none",
                  color: "inherit",
                  borderRadius: 16,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      backgroundColor: "rgba(15, 23, 42, 0.06)",
                      color: "#0f172a",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {n.rank}
                  </span>
                  <div style={{ fontSize: 15, flex: 1, minWidth: 0, color: "#0f172a", fontWeight: 700 }}>
                    <span style={{ wordBreak: "break-word" }}>{n.title}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 999,
                      backgroundColor: "rgba(15, 23, 42, 0.05)",
                      color: "#475569",
                      fontSize: 11,
                    }}
                    title={n.domain}
                  >
                    {n.domain}
                  </span>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 999,
                      backgroundColor: "rgba(15, 23, 42, 0.05)",
                      color: "#475569",
                      fontSize: 11,
                    }}
                    title={n.source}
                  >
                    {formatSourceLabel(n.source)}
                  </span>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 999,
                      backgroundColor: "rgba(15, 23, 42, 0.05)",
                      color: "#475569",
                      fontSize: 11,
                    }}
                  >
                    {formatRelativeAge(n)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 10,
                    fontSize: 11,
                    color: "#475569",
                  }}
                >
                  <span>
                    {numberFormatter.format(n.points)} {ui.pointsLabel}
                  </span>
                  <span>
                    {numberFormatter.format(n.comments)} {ui.commentsLabel}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "#334155",
                  }}
                >
                  {n.summary}
                </div>
              </a>
            ))}
            {visibleNews.length === 0 && (
              <div
                style={{
                  padding: 14,
                  textAlign: "center",
                  color: "#64748b",
                  fontStyle: "italic",
                  border: "1px dashed rgba(15, 23, 42, 0.18)",
                  borderRadius: 16,
                  fontSize: 11,
                  backgroundColor: "rgba(248, 250, 252, 0.85)",
                }}
              >
                {ui.noNews}
              </div>
            )}
          </div>
        </section>

        {/* 右边：信号 - 和左侧风格一致 */}
        <section
          style={{
            flex: 1,
            minWidth: 0,
            padding: 16,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 20,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.72) 100%)",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              marginBottom: 14,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div key={`${lang}-signals-heading`} className="lang-swap">
              <h2 style={{ margin: 0, fontSize: 18, color: "#0f172a", fontWeight: 800, lineHeight: 1.2 }}>
                {ui.signalsTitle}
              </h2>
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", lineHeight: 1.2 }}>
                {ui.signalsSubtitle}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", minWidth: 88, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {numberFormatter.format(signals.length)} {ui.signalsCountLabel}
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {signals.map((s) => {
              const colors = {
                bullish: {
                  bg: "#f0fdf4",
                  border: "#bbf7d0",
                  text: "#166534",
                },
                bearish: {
                  bg: "#fef2f2",
                  border: "#fecaca",
                  text: "#991b1b",
                },
                neutral: {
                  bg: "#f9fafb",
                  border: "#e5e7eb",
                  text: "#374151",
                },
              };
              const color = colors[s.direction];

              return (
                <div
                  key={s.asset}
                  style={{
                    marginBottom: 8,
                    padding: "14px 14px",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    borderRadius: 16,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{s.asset}</span>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        backgroundColor: color.text,
                        color: "white",
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isZh
                        ? s.direction === "bullish"
                          ? "看涨"
                          : s.direction === "bearish"
                            ? "看跌"
                            : "中性"
                        : s.direction.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: "#64748b", marginTop: 8, fontSize: 12, lineHeight: 1.45 }}>{s.reason}</div>
                </div>
              );
            })}
            {signals.length === 0 && (
              <div
                style={{
                  padding: 14,
                  textAlign: "center",
                  color: "#64748b",
                  fontStyle: "italic",
                  border: "1px dashed rgba(15, 23, 42, 0.18)",
                  borderRadius: 16,
                  fontSize: 11,
                  backgroundColor: "rgba(248, 250, 252, 0.85)",
                }}
              >
                {ui.noSignals}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
