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
  async function load() {
    const newsRes = await fetch("https://smart-trading-api.vercel.app/news");
    const newsData = await newsRes.json();

    const sigRes = await fetch("https://smart-trading-api.vercel.app/signals");
    const sigData = await sigRes.json();

    setNews(newsData);
    setSignals(sigData);
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
      </div>
    </div>
  );
}