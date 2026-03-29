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

const COPY: Record<
  Lang,
  {
    headerTag: string;
    headerTitle: string;
    headerDescription: string;
    refreshing: string;
    upToDate: string;
    newsTitle: string;
    newsSubtitle: string;
    signalsTitle: string;
    signalsSubtitle: string;
    pointsLabel: string;
    commentsLabel: string;
    noSignals: string;
    noNews: string;
    sourceFilterTitle: string;
    sourceFilterHint: string;
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
    newsTitle: "🌍 Global News",
    newsSubtitle: "Live feed refreshed every 5 seconds",
    signalsTitle: "📈 Investment Signals",
    signalsSubtitle: "Signals inferred from the headlines above",
    pointsLabel: "points",
    commentsLabel: "comments",
    noSignals: "No signals generated from current news",
    noNews: "No news matches the selected sources",
    sourceFilterTitle: "News sources",
    sourceFilterHint: "Pick one or more feeds to focus the list.",
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
    newsTitle: "🌍 全球新闻",
    newsSubtitle: "每 5 秒刷新一次",
    signalsTitle: "📈 投资信号",
    signalsSubtitle: "根据上方新闻自动生成信号",
    pointsLabel: "热度",
    commentsLabel: "评论",
    noSignals: "当前新闻暂无可生成的信号",
    noNews: "当前所选来源暂无新闻",
    sourceFilterTitle: "新闻来源",
    sourceFilterHint: "可勾选一个或多个来源来聚焦新闻列表。",
    selectAllSources: "全选",
    clearSources: "清空",
    sourceCountLabel: "个来源",
    toggleLabel: "EN",
  },
};

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lang, setLang] = useState<Lang>("en");
  const [sourceMode, setSourceMode] = useState<"all" | "custom">("all");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const newsRef = useRef<NewsItem[]>([]);
  const signalsRef = useRef<SignalItem[]>([]);
  const [sourcePrefsLoaded, setSourcePrefsLoaded] = useState(false);
  const ui = COPY[lang];
  const availableSources = Array.from(new Set(news.map((item) => item.source))).sort((a, b) =>
    a.localeCompare(b, lang === "zh" ? "zh-Hans-CN" : "en"),
  );
  const visibleNews =
    sourceMode === "all" ? news : news.filter((item) => selectedSources.includes(item.source));

  function formatSourceLabel(source: string) {
    const override = SOURCE_LABEL_OVERRIDES.find(([pattern]) => pattern.test(source));
    if (override) {
      return override[1];
    }

    if (source.length <= 34) {
      return source;
    }

    return `${source.slice(0, 31)}...`;
  }

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
      if (sourceMode === "all") {
        if (current.length === availableSources.length && current.every((source, index) => source === availableSources[index])) {
          return current;
        }

        return availableSources;
      }

      const next = current.filter((source) => availableSources.includes(source));
      if (next.length === current.length && next.every((source, index) => source === current[index])) {
        return current;
      }

      return next;
    });
  }, [availableSources, sourceMode]);

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
        const [newsRes, signalsRes] = await Promise.all([
          fetch(`${config.apiUrl}/news`),
          fetch(`${config.apiUrl}/signals`),
        ]);

        const [newsData, signalData] = await Promise.all([
          newsRes.json(),
          signalsRes.json(),
        ]);

        if (cancelled) {
          return;
        }

        const nextNews = Array.isArray(newsData) ? newsData : [];
        const nextSignals = Array.isArray(signalData) ? signalData : [];

        if (nextNews.length > 0 || newsRef.current.length === 0) {
          setNews(nextNews);
        }

        if (nextSignals.length > 0 || signalsRef.current.length === 0) {
          setSignals(nextSignals);
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
  }, []);

  function selectAllSources() {
    setSourceMode("all");
    setSelectedSources(availableSources);
  }

  function clearSources() {
    setSourceMode("custom");
    setSelectedSources([]);
  }

  function toggleSource(source: string) {
    setSourceMode("custom");
    setSelectedSources((current) => {
      const base = sourceMode === "all" ? availableSources : current;

      if (base.includes(source)) {
        return base.filter((item) => item !== source);
      }

      return [...base, source];
    });
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#f6f6ef",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "12px 16px 10px",
          borderBottom: "1px solid #dcdcdc",
          backgroundColor: "#f6f6ef",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#666666",
                marginBottom: 4,
              }}
            >
              {ui.headerTag}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                lineHeight: 1.1,
                color: "#000000",
                fontWeight: 700,
              }}
            >
              {ui.headerTitle}
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "nowrap",
              flex: "1 1 360px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                flex: "1 1 auto",
                fontSize: 11,
                lineHeight: 1.35,
                color: "#666666",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span>{ui.headerDescription}</span>
              <span style={{ marginLeft: 8, color: "#999999", flexShrink: 0 }}>
                {isRefreshing ? ui.refreshing : ui.upToDate}
              </span>
            </div>
            <a
              href={config.adminUrl}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #d0d0c8",
                backgroundColor: "#ffffff",
                color: "#000000",
                borderRadius: 999,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                textDecoration: "none",
                flexShrink: 0,
              }}
              aria-label="Go to admin console"
              title="管理台"
            >
              管理台
            </a>
            <button
              type="button"
              onClick={() => setLang((current) => (current === "en" ? "zh" : "en"))}
              style={{
                border: "1px solid #d0d0c8",
                backgroundColor: "#f6f6ef",
                color: "#000000",
                borderRadius: 999,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
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
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#f6f6ef",
        }}
      >
        {/* 左边：新闻 - Hacker News 风格 */}
        <section
          style={{
            flex: 1,
            minWidth: 0,
            borderRight: "1px solid #dcdcdc",
            padding: 16,
            backgroundColor: "#f6f6ef",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, color: "#000000", fontWeight: "bold", lineHeight: 1.2 }}>
              {ui.newsTitle}
            </h2>
            <div style={{ fontSize: 11, color: "#666666", lineHeight: 1.2 }}>
              {ui.newsSubtitle}
            </div>
          </div>

          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              border: "1px solid #dcdcdc",
              borderRadius: 8,
              backgroundColor: "#fafaf3",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 11, color: "#666666", lineHeight: 1.35 }}>
                <div style={{ fontWeight: 600, color: "#000000", marginBottom: 2 }}>{ui.sourceFilterTitle}</div>
                <div>{ui.sourceFilterHint}</div>
              </div>
              <div style={{ fontSize: 11, color: "#666666", whiteSpace: "nowrap" }}>
                {sourceMode === "all"
                  ? `${availableSources.length} ${ui.sourceCountLabel}`
                  : `${selectedSources.length}/${availableSources.length} ${ui.sourceCountLabel}`}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 10,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={selectAllSources}
                style={{
                  border: "1px solid #cfcfc2",
                  borderRadius: 999,
                  padding: "4px 10px",
                  backgroundColor: sourceMode === "all" ? "#000000" : "#ffffff",
                  color: sourceMode === "all" ? "#ffffff" : "#000000",
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
                  border: "1px solid #cfcfc2",
                  borderRadius: 999,
                  padding: "4px 10px",
                  backgroundColor: sourceMode === "custom" && selectedSources.length === 0 ? "#000000" : "#ffffff",
                  color: sourceMode === "custom" && selectedSources.length === 0 ? "#ffffff" : "#000000",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {ui.clearSources}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {availableSources.map((source) => {
                const checked = sourceMode === "all" || selectedSources.includes(source);

                return (
                  <label
                    key={source}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: "1px solid #d0d0c8",
                      backgroundColor: checked ? "#000000" : "#ffffff",
                      color: checked ? "#ffffff" : "#000000",
                      fontSize: 11,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    title={source}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSource(source)}
                      style={{ accentColor: "#000000" }}
                    />
                    <span>{formatSourceLabel(source)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {visibleNews.map((n, i) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginBottom: 12,
                  padding: "12px 12px 12px 0",
                  borderBottom: i === visibleNews.length - 1 ? "none" : "1px dashed #cccccc",
                  lineHeight: 1.35,
                  textDecoration: "none",
                  color: "inherit",
                  borderRadius: 4,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f3e8";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#666666", minWidth: 18 }}>
                    {n.rank}.
                  </span>
                  <div style={{ fontSize: 14, flex: 1, minWidth: 0, color: "#000000" }}>
                    <span style={{ wordBreak: "break-word" }}>{n.title}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#666666", marginTop: 6 }}>
                  <span title={n.domain}>{n.domain}</span> ·{" "}
                  <span title={n.source}>{formatSourceLabel(n.source)}</span> · {n.age}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 6,
                    fontSize: 11,
                    color: "#666666",
                  }}
                >
                  <span>
                    {n.points} {ui.pointsLabel}
                  </span>
                  <span>
                    {n.comments} {ui.commentsLabel}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    lineHeight: 1.45,
                    color: "#444444",
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
                  color: "#666666",
                  fontStyle: "italic",
                  border: "1px dashed #cccccc",
                  borderRadius: 4,
                  fontSize: 11,
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
            padding: 12,
            backgroundColor: "#f6f6ef",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, color: "#000000", fontWeight: "bold", lineHeight: 1.2 }}>
              {ui.signalsTitle}
            </h2>
            <div style={{ fontSize: 10, color: "#666666", lineHeight: 1.2 }}>
              {ui.signalsSubtitle}
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {signals.map((s, i) => {
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
                    padding: "9px 0",
                    borderBottom: i === signals.length - 1 ? "none" : "1px dashed #cccccc",
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
                    <span style={{ fontWeight: 600, color: "#000000", fontSize: 13 }}>{s.asset}</span>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 3,
                        backgroundColor: color.text,
                        color: "white",
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lang === "zh"
                        ? s.direction === "bullish"
                          ? "看涨"
                          : s.direction === "bearish"
                            ? "看跌"
                            : "中性"
                        : s.direction.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: "#666666", marginTop: 4, fontSize: 11, lineHeight: 1.35 }}>{s.reason}</div>
                </div>
              );
            })}
            {signals.length === 0 && (
              <div
                style={{
                  padding: 14,
                  textAlign: "center",
                  color: "#666666",
                  fontStyle: "italic",
                  border: "1px dashed #cccccc",
                  borderRadius: 4,
                  fontSize: 11,
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
