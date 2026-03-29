"use client";

import { useEffect, useState } from "react";

type News = {
  title: string;
  source: string;
  time: string;
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* 左边：新闻 */}
      <div style={{ flex: 1, borderRight: "1px solid #ccc", padding: 20 }}>
        <h2>🌍 Global News</h2>
        <div style={{ overflowY: "auto", height: "90%" }}>
          {news.map((n, i) => (
            <div key={i} style={{ marginBottom: 15 }}>
              <div style={{ fontWeight: "bold" }}>{n.title}</div>
              <div style={{ fontSize: 12, color: "gray" }}>
                {n.source} · {n.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右边：信号 */}
      <div style={{ flex: 1, padding: 20 }}>
        <h2>📈 Investment Signals</h2>
        {signals.map((s, i) => (
          <div
            key={i}
            style={{
              marginBottom: 15,
              padding: 10,
              borderRadius: 8,
              background:
                s.direction === "bullish"
                  ? "#e6ffed"
                  : s.direction === "bearish"
                    ? "#ffe6e6"
                    : "#f5f5f5",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{s.asset}</div>
            <div>{s.reason}</div>
            <div style={{ fontSize: 12 }}>
              {s.direction.toUpperCase()}
            </div>
          </div>
        ))}
        {signals.length === 0 && (
          <div style={{ color: "gray", fontStyle: "italic" }}>
            No signals generated from current news
          </div>
        )}
      </div>
    </div>
  );
}
