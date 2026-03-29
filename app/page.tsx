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

export default function Home() {
  const [news, setNews] = useState<News[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    // mock 新闻
    setNews([
      { title: "Oil supply disruption in Middle East", source: "Reuters", time: "2m ago" },
      { title: "Fed signals potential rate hike", source: "Bloomberg", time: "5m ago" },
      { title: "AI sector continues rapid growth", source: "TechCrunch", time: "10m ago" },
    ]);

    // mock 信号
    setSignals([
      { asset: "Crude Oil", direction: "bullish", reason: "Supply disruption" },
      { asset: "NASDAQ", direction: "bearish", reason: "Rate hike pressure" },
      { asset: "Gold", direction: "bullish", reason: "Inflation hedge" },
    ]);
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
      </div>
    </div>
  );
}