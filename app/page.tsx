"use client";

import { useEffect, useState } from "react";

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

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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

      setNews(Array.isArray(newsData) ? newsData : []);
      setSignals(Array.isArray(signalData) ? signalData : []);
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
          padding: "20px 20px 14px",
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
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#666666",
                marginBottom: 6,
              }}
            >
              Smart Trading Space
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                lineHeight: 1.1,
                color: "#000000",
                fontWeight: 700,
              }}
            >
              Live market news and signals
            </h1>
          </div>
          <div
            style={{
              maxWidth: 380,
              fontSize: 12,
              lineHeight: 1.5,
              color: "#666666",
            }}
          >
            A lightweight trading dashboard that keeps headlines and signals in
            separate lanes, so the page stays readable at a glance.
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
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "#000000", fontWeight: "bold" }}>
              🌍 Global News
            </h2>
            <div style={{ marginTop: 4, fontSize: 11, color: "#666666" }}>
              Live feed refreshed every 5 seconds
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
                  <span>{n.points} points</span>
                  <span>{n.comments} comments</span>
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
            padding: 16,
            backgroundColor: "#f6f6ef",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "#000000", fontWeight: "bold" }}>
              📈 Investment Signals
            </h2>
            <div style={{ marginTop: 4, fontSize: 11, color: "#666666" }}>
              Signals inferred from the headlines above
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
                    marginBottom: 12,
                    padding: "12px 0",
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
                    <span style={{ fontWeight: 600, color: "#000000", fontSize: 14 }}>{s.asset}</span>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 3,
                        backgroundColor: color.text,
                        color: "white",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.direction.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: "#666666", marginTop: 4, fontSize: 12, lineHeight: 1.4 }}>{s.reason}</div>
                </div>
              );
            })}
            {signals.length === 0 && (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "#666666",
                  fontStyle: "italic",
                  border: "1px dashed #cccccc",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                No signals generated from current news
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
