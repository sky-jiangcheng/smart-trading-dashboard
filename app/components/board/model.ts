export type NewsItem = {
  id: string;
  rank: number;
  title: string;
  url: string;
  domain: string;
  sourceUrl?: string;
  source: string;
  points: number;
  comments: number;
  age: string;
  publishedAt: string | null;
  summary: string;
  dimensions?: string[];
  dimensionLabel?: string;
  dimensionLabelZh?: string;
  dimensionTone?: string;
  relatedAssets?: string[];
  whyItMatters?: string;
};

export type SignalItem = {
  asset: string;
  direction: "bullish" | "bearish" | "neutral";
  reason: string;
  dimension?: string;
  dimensionLabel?: string;
  dimensionLabelZh?: string;
  tone?: string;
  relatedAssets?: string[];
  relatedNewsIds?: string[];
  whyItMatters?: string;
  confidence?: number;
};

export type SourceItem = {
  url: string;
  label: string;
};

export type ThresholdItem = {
  symbol: string;
  name: string;
  category: "stock" | "currency" | "futures" | "crypto" | "macro";
  currentValue: number;
  thresholdValue: number;
  direction: "above" | "below";
  unit: string;
  note: string;
  marketSymbol: string;
  priority: "P0" | "P1" | "P2";
  tags: string[];
  updatedAt: string;
};

export type Lang = "en" | "zh";

export type BoardSectionId = "overview" | "news" | "signals" | "dimensions" | "reports" | "sources" | "standards";

export type BoardDimensionSummary = {
  key: string;
  label: string;
  labelZh: string;
  state: "hot" | "warming" | "cooling" | "neutral";
  description: string;
  tone: string;
  newsCount: number;
  signalCount: number;
  thresholdCount: number;
  representativeAssets: string[];
};

export type BoardPayload = {
  marketState: "risk" | "warming" | "neutral";
  marketStateLabel?: string;
  marketStateLabelZh?: string;
  marketStateTone?: "risk" | "warming" | "neutral";
  marketStateSummary?: string;
  generatedAt: string;
  topNews: Array<NewsItem>;
  topSignals: SignalItem[];
  dimensions: BoardDimensionSummary[];
  reportBriefs: Array<{
    label: string;
    labelZh: string;
    value: string;
    meta: string;
  }>;
};

export type DimensionCard = {
  key: string;
  label: string;
  tone: string;
  description: string;
  newsCount: number;
  signalCount: number;
  thresholdCount: number;
  state: "hot" | "warming" | "cooling" | "neutral";
  representativeAssets: string[];
};

export type BoardNavItem = {
  id: BoardSectionId;
  label: string;
  hint: string;
  meta: string;
};

export type MarketStateMeta = {
  label: string;
  summary: string;
  tone: "danger" | "positive" | "muted";
};

export type BoardUiCopy = (typeof COPY)["en"];

export const BOARD_SECTION_IDS: BoardSectionId[] = ["overview", "news", "signals", "dimensions", "reports", "sources", "standards"];

export const SOURCE_STORAGE_KEY = "investment-dashboard:selected-sources";
export const LANGUAGE_STORAGE_KEY = "investment-dashboard:language";
export const DATA_CACHE_KEY = "investment-dashboard:data-cache";
export const DATA_CACHE_TTL_MS = 2 * 60 * 1000;

export const SOURCE_LABEL_OVERRIDES: Array<[RegExp, string]> = [
  [/cnbc/i, "CNBC"],
  [/marketwatch/i, "MarketWatch"],
  [/chinanews|中国新闻网/i, "中国新闻网"],
  [/people|人民网/i, "人民网"],
  [/chinadaily|中国日报/i, "中国日报"],
  [/36kr|36氪/i, "36氪"],
];

export const THRESHOLD_CATEGORY_LABELS: Record<ThresholdItem["category"], string> = {
  stock: "股票",
  currency: "货币",
  futures: "期货",
  crypto: "加密货币",
  macro: "宏观",
};

export const THRESHOLD_PRIORITY_LABELS: Record<ThresholdItem["priority"], string> = {
  P0: "核心",
  P1: "重点",
  P2: "观察",
};

export const COPY: Record<
  Lang,
  {
    headerTag: string;
    headerTitle: string;
    headerDescription: string;
    railTitle: string;
    railDescription: string;
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
    headerTitle: "Markets",
    headerDescription:
      "Breaking headlines, key levels, and the stories moving risk sentiment.",
    railTitle: "Masthead",
    railDescription: "Top stories and market context.",
    refreshing: "Refreshing",
    upToDate: "Up to date",
    adminLabel: "Admin",
    adminAriaLabel: "Go to admin console",
    newsTitle: "News",
    newsSubtitle: "Headlines, context, and updates.",
    newsCountLabel: "items",
    signalsTitle: "Markets",
    signalsSubtitle: "Positioning, notable moves, and watchpoints.",
    signalsCountLabel: "signals",
    pointsLabel: "points",
    commentsLabel: "comments",
    noSignals: "No signals generated from current news",
    noNews: "No news matches the selected sources",
    sourceFilterTitle: "Sources",
    sourceFilterHint: "Filter the feed by source.",
    chinaGroupLabel: "China",
    globalGroupLabel: "Global",
    selectAllSources: "Select all",
    clearSources: "Clear",
    sourceCountLabel: "sources",
    toggleLabel: "中文",
  },
  zh: {
    headerTag: "Smart Trading Space",
    headerTitle: "市场",
    headerDescription:
      "把正在驱动风险偏好的头条、关键位置和市场语境放在同一页。",
    railTitle: "导视",
    railDescription: "头条与市场语境。",
    refreshing: "刷新中",
    upToDate: "已更新",
    adminLabel: "管理台",
    adminAriaLabel: "进入管理台",
    newsTitle: "新闻",
    newsSubtitle: "头条、语境与更新。",
    newsCountLabel: "条",
    signalsTitle: "市场",
    signalsSubtitle: "站位、异动与观察点。",
    signalsCountLabel: "条信号",
    pointsLabel: "热度",
    commentsLabel: "评论",
    noSignals: "当前新闻暂无可生成的信号",
    noNews: "当前所选来源暂无新闻",
    sourceFilterTitle: "来源",
    sourceFilterHint: "按来源筛选新闻流。",
    chinaGroupLabel: "中国",
    globalGroupLabel: "国际",
    selectAllSources: "全选",
    clearSources: "清空",
    sourceCountLabel: "个来源",
    toggleLabel: "EN",
  },
};

export function isChineseSource(source: string) {
  return /[\u4e00-\u9fff]/.test(source) || /中国|人民网|中国日报|中国新闻网|财联社|澎湃|新华|36kr/i.test(source);
}

export function getThresholdStatus(item: ThresholdItem) {
  const triggered = item.direction === "above" ? item.currentValue >= item.thresholdValue : item.currentValue <= item.thresholdValue;
  const distance = item.direction === "above" ? item.currentValue - item.thresholdValue : item.thresholdValue - item.currentValue;
  const percent = item.thresholdValue === 0 ? 0 : (distance / Math.abs(item.thresholdValue)) * 100;

  return {
    triggered,
    distance,
    percent,
  };
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function normalizeThresholdItem(item: Partial<ThresholdItem> & { symbol: string; name: string }): ThresholdItem {
  return {
    symbol: item.symbol,
    name: item.name,
    category: item.category || "stock",
    currentValue: Number.isFinite(Number(item.currentValue)) ? Number(item.currentValue) : 0,
    thresholdValue: Number.isFinite(Number(item.thresholdValue)) ? Number(item.thresholdValue) : 0,
    direction: item.direction === "below" ? "below" : "above",
    unit: item.unit || "USD",
    note: item.note || "",
    marketSymbol: item.marketSymbol || item.symbol,
    priority: item.priority === "P0" || item.priority === "P2" ? item.priority : "P1",
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

export function getFallbackDimensionDefs(isZh: boolean) {
  return [
    {
      key: "macro",
      label: "Macro",
      labelZh: "宏观",
      tone: "#7dd3fc",
      keywords: ["macro", "yield", "rate", "fed", "cpi", "pmi", "利率", "通胀", "宏观"],
      description: isZh ? "利率、通胀、政策和期限结构" : "Rates, inflation, policy, and curve structure",
      representativeAssets: ["US10Y", "DXY", "SPX"],
    },
    {
      key: "liquidity",
      label: "Liquidity",
      labelZh: "流动性",
      tone: "#5eead4",
      keywords: ["liquidity", "flow", "funding", "volume", "流动性", "资金"],
      description: isZh ? "资金深度、融资条件与成交密度" : "Funding depth, financing conditions, and market depth",
      representativeAssets: ["QQQ", "BTC", "SPX"],
    },
    {
      key: "valuation",
      label: "Valuation",
      labelZh: "估值",
      tone: "#c4b5fd",
      keywords: ["valuation", "multiple", "pe", "pb", "eps", "估值"],
      description: isZh ? "再定价、压缩与溢价水平" : "Re-rating, compression, and premium levels",
      representativeAssets: ["AAPL", "NVDA", "QQQ"],
    },
    {
      key: "risk",
      label: "Risk",
      labelZh: "风险",
      tone: "#fca5a5",
      keywords: ["risk", "vix", "drawdown", "hedge", "风险", "波动"],
      description: isZh ? "波动、避险与仓位防御" : "Volatility, hedging, and defensive positioning",
      representativeAssets: ["VIX", "GLD", "SPX"],
    },
    {
      key: "event",
      label: "Event",
      labelZh: "事件",
      tone: "#fdba74",
      keywords: ["event", "policy", "guidance", "earnings", "事件", "政策", "财报"],
      description: isZh ? "政策、财报和突发催化" : "Policy, earnings, and event-driven catalysts",
      representativeAssets: ["AAPL", "TSLA", "NVDA"],
    },
    {
      key: "flow",
      label: "Flow",
      labelZh: "资金流",
      tone: "#93c5fd",
      keywords: ["flow", "funds", "order", "资金", "流入", "流出"],
      description: isZh ? "钱往哪里走，交易如何跟进" : "Where money is moving and how participation follows",
      representativeAssets: ["SPX", "BTC", "XAU"],
    },
  ];
}
