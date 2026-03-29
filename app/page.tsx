"use client";

import { useEffect, useState } from "react";

type News = {
  title: string;
  source: string;
  time: string;
  url?: string;
};

type Signal = {
  asset: string;
  direction: "bullish" | "bearish" | "neutral";
  reason: string;
};

// 可扩展的信号规则配置
interface SignalRule {
  // 匹配关键词（小写）
  keyword: string;
  // 输出信号
  signal: Omit<Signal, "reason"> & { reasonTemplate: string };
}

// 在这里添加/修改规则即可，不需要改逻辑
const SIGNAL_RULES: SignalRule[] = [
  {
    keyword: "oil",
    signal: {
      asset: "Crude Oil",
      direction: "bullish",
      reasonTemplate: "Oil-related news → Market attention",
    },
  },
  {
    keyword: "inflation",
    signal: {
      asset: "Gold",
      direction: "bullish",
      reasonTemplate: "Inflation expectations → Inflation hedge",
    },
  },
  {
    keyword: "rate",
    signal: {
      asset: "NASDAQ",
      direction: "bearish",
      reasonTemplate: "Interest rate concerns → Growth stock pressure",
    },
  },
  {
    keyword: "gold",
    signal: {
      asset: "Gold",
      direction: "bullish",
      reasonTemplate: "Gold-specific news → Market momentum",
    },
  },
  {
    keyword: "nasdaq",
    signal: {
      asset: "NASDAQ",
      direction: "bullish",
      reasonTemplate: "NASDAQ-specific news → Tech sector momentum",
    },
  },
];

// 根据新闻生成信号，同一资产只保留一个信号
function generateSignals(newsList: News[]): Signal[] {
  // 使用 Map 自动去重：key = asset name，同一资产只保留最后一个匹配
  const signalMap = new Map<string, Signal>();

  for (const news of newsList) {
    const text = news.title.toLowerCase();

    for (const rule of SIGNAL_RULES) {
      if (text.includes(rule.keyword)) {
        const { asset, direction, reasonTemplate } = rule.signal;
        // 覆盖同资产的旧信号，保证始终只有一个
        signalMap.set(asset, {
          asset,
          direction,
          reason: reasonTemplate,
        });
      }
    }
  }

  // 转换为数组返回
  return Array.from(signalMap.values());
}

export default function Home() {
  const [news, setNews] = useState<News[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    async function load() {
      const newsRes = await fetch("https://smart-trading-api.vercel.app/news");
      const newsData = await newsRes.json();

      // 根据新闻本地生成信号，自动去重（同一资产只保留一个）
      const generatedSignals = generateSignals(newsData);

      setNews(newsData);
      setSignals(generatedSignals);
    }

    load();

    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#f6f6ef",
      }}
    >
      <header
        style={{
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
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: i === news.length - 1 ? "none" : "1px dashed #cccccc",
                  lineHeight: 1.3,
                }}
              >
                <div style={{ fontSize: 14 }}>
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#000000",
                        textDecoration: "none",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {n.title}
                    </a>
                  ) : (
                    <span style={{ color: "#000000" }}>{n.title}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#666666", marginTop: 4 }}>
                  {n.source}
                  {n.url && " · "}
                  {n.time}
                </div>
              </div>
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
              // 专业交易系统配色
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
                  key={i}
                  style={{
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom: i === signals.length - 1 ? "none" : "1px dashed #cccccc",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
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
