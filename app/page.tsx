"use client";

import { useEffect, useRef, useState } from "react";
import { config } from "../../lib/config";

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
    toggleLabel: "EN",
  },
};

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lang, setLang] = useState<Lang>("en");
  const newsRef = useRef<NewsItem[]>([]);
  const signalsRef = useRef<SignalItem[]>([]);
  const ui = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    newsRef.current = news;
  }, [news]);

  useEffect(() => {
    signalsRef.current = signals;
  }, [signals]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsRefreshing(true);

      try {
        const [newsRes, signalsRes] = await Promise.all([
          fetch("https://smart-trading-api.vercel.app/news"),
          fetch("https://smart-trading-api.vercel.app/signals"),
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
              flexWrap: "wrap",
              maxWidth: 390,
            }}
          >
            <div
              style={{
                fontSize: 11,
                lineHeight: 1.35,
                color: "#666666",
                maxWidth: 300,
              }}
            >
              {ui.headerDescription}
              <span style={{ marginLeft: 8, color: "#999999" }}>
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

          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {news.map((n, i) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginBottom: 12,
                  padding: "12px 12px 12px 0",
                  borderBottom: i === news.length - 1 ? "none" : "1px dashed #cccccc",
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
                  {n.domain} · {n.source} · {n.age}
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
