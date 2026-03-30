"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "@/lib/config";
import HeroSection from "./HeroSection";
import InsightsSidebar from "./InsightsSidebar";
import NewsSection from "./NewsSection";
import ReadingRail from "./ReadingRail";
import SignalsSection from "./SignalsSection";
import {
  BOARD_SECTION_IDS,
  COPY,
  DATA_CACHE_KEY,
  DATA_CACHE_TTL_MS,
  LANGUAGE_STORAGE_KEY,
  SOURCE_LABEL_OVERRIDES,
  SOURCE_STORAGE_KEY,
  type BoardNavItem,
  getFallbackDimensionDefs,
  getThresholdStatus,
  isChineseSource,
  normalizeThresholdItem,
  type BoardPayload,
  type BoardSectionId,
  type DimensionCard,
  type Lang,
  type MarketStateMeta,
  type NewsItem,
  type SignalItem,
  type SourceItem,
  type ThresholdItem,
} from "./model";

const BOARD_SCROLL_OFFSET_FALLBACK = 156;

type FallbackDimension = ReturnType<typeof getFallbackDimensionDefs>[number];
type DimensionSourceItem =
  | {
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
    }
  | FallbackDimension;

export default function BoardClient() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [sourceCatalog, setSourceCatalog] = useState<SourceItem[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdItem[]>([]);
  const [boardData, setBoardData] = useState<BoardPayload | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [newsLimit, setNewsLimit] = useState<number>(200);
  const [lang, setLang] = useState<Lang>("en");
  const [sourceMode, setSourceMode] = useState<"all" | "custom">("all");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sourceSearch, setSourceSearch] = useState("");
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [activeBoardSection, setActiveBoardSection] = useState<BoardSectionId>("overview");
  const [sourcePrefsLoaded, setSourcePrefsLoaded] = useState(false);
  const newsRef = useRef<NewsItem[]>([]);
  const signalsRef = useRef<SignalItem[]>([]);
  const isZh = lang === "zh";
  const ui = COPY[lang];
  const numberFormatter = new Intl.NumberFormat(isZh ? "zh-CN" : "en-US");

  const safeText = useCallback((value: unknown, fallback = "") => {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }, []);

  const safeStringArray = useCallback((value: unknown) => {
    return Array.isArray(value)
      ? value.map((item) => safeText(item)).filter(Boolean)
      : [];
  }, [safeText]);

  const normalizeBoardNewsItem = useCallback((item: unknown, fallback?: NewsItem): NewsItem | undefined => {
    if (!item || typeof item !== "object") {
      return fallback;
    }

    const candidate = item as Partial<NewsItem>;
    const title = safeText(candidate.title, fallback?.title || "");
    if (!title) {
      return fallback;
    }

    return {
      id: safeText(candidate.id, fallback?.id || title),
      rank: Number.isFinite(Number(candidate.rank)) ? Number(candidate.rank) : fallback?.rank || 0,
      title,
      url: safeText(candidate.url, fallback?.url || "#"),
      domain: safeText(candidate.domain, fallback?.domain || ""),
      sourceUrl: safeText(candidate.sourceUrl, fallback?.sourceUrl || "") || undefined,
      source: safeText(candidate.source, fallback?.source || ""),
      points: Number.isFinite(Number(candidate.points)) ? Number(candidate.points) : fallback?.points || 0,
      comments: Number.isFinite(Number(candidate.comments)) ? Number(candidate.comments) : fallback?.comments || 0,
      age: safeText(candidate.age, fallback?.age || ""),
      publishedAt: safeText(candidate.publishedAt, fallback?.publishedAt || "") || null,
      summary: safeText(candidate.summary, fallback?.summary || ""),
      dimensions: safeStringArray(candidate.dimensions),
      dimensionLabel: safeText(candidate.dimensionLabel, fallback?.dimensionLabel || "") || undefined,
      dimensionLabelZh: safeText(candidate.dimensionLabelZh, fallback?.dimensionLabelZh || "") || undefined,
      dimensionTone: safeText(candidate.dimensionTone, fallback?.dimensionTone || "") || undefined,
      relatedAssets: safeStringArray(candidate.relatedAssets),
      whyItMatters: safeText(candidate.whyItMatters, fallback?.whyItMatters || "") || undefined,
    };
  }, [safeStringArray, safeText]);

  const normalizeBoardSignalItem = useCallback((item: unknown, fallback?: SignalItem): SignalItem | undefined => {
    if (!item || typeof item !== "object") {
      return fallback;
    }

    const candidate = item as Partial<SignalItem>;
    const asset = safeText(candidate.asset, fallback?.asset || "");
    if (!asset) {
      return fallback;
    }

    const direction =
      candidate.direction === "bullish" || candidate.direction === "bearish" || candidate.direction === "neutral"
        ? candidate.direction
        : fallback?.direction || "neutral";

    return {
      asset,
      direction,
      reason: safeText(candidate.reason, fallback?.reason || ""),
      dimension: safeText(candidate.dimension, fallback?.dimension || "") || undefined,
      dimensionLabel: safeText(candidate.dimensionLabel, fallback?.dimensionLabel || "") || undefined,
      dimensionLabelZh: safeText(candidate.dimensionLabelZh, fallback?.dimensionLabelZh || "") || undefined,
      tone: safeText(candidate.tone, fallback?.tone || "") || undefined,
      relatedAssets: safeStringArray(candidate.relatedAssets),
      relatedNewsIds: safeStringArray(candidate.relatedNewsIds),
      whyItMatters: safeText(candidate.whyItMatters, fallback?.whyItMatters || "") || undefined,
      confidence: Number.isFinite(Number(candidate.confidence)) ? Number(candidate.confidence) : fallback?.confidence,
    };
  }, [safeStringArray, safeText]);

  const normalizeSourceItem = useCallback((item: unknown): SourceItem | null => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const candidate = item as Partial<SourceItem>;
    const url = safeText(candidate.url);
    const label = safeText(candidate.label, url);
    if (!url || !label) {
      return null;
    }

    return { url, label };
  }, [safeText]);

  const normalizeNewsItem = useCallback((item: unknown, index: number): NewsItem | null => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const candidate = item as Partial<NewsItem>;
    const title = safeText(candidate.title);
    const source = safeText(candidate.source, safeText(candidate.domain, "Unknown"));
    if (!title) {
      return null;
    }

    return {
      id: safeText(candidate.id, `${source}-${title}-${index}`),
      rank: Number.isFinite(Number(candidate.rank)) ? Number(candidate.rank) : index + 1,
      title,
      url: safeText(candidate.url, "#"),
      domain: safeText(candidate.domain),
      sourceUrl: safeText(candidate.sourceUrl) || undefined,
      source,
      points: Number.isFinite(Number(candidate.points)) ? Number(candidate.points) : 0,
      comments: Number.isFinite(Number(candidate.comments)) ? Number(candidate.comments) : 0,
      age: safeText(candidate.age, "just now"),
      publishedAt: safeText(candidate.publishedAt) || null,
      summary: safeText(candidate.summary),
      dimensions: safeStringArray(candidate.dimensions),
      dimensionLabel: safeText(candidate.dimensionLabel) || undefined,
      dimensionLabelZh: safeText(candidate.dimensionLabelZh) || undefined,
      dimensionTone: safeText(candidate.dimensionTone) || undefined,
      relatedAssets: safeStringArray(candidate.relatedAssets),
      whyItMatters: safeText(candidate.whyItMatters) || undefined,
    } satisfies NewsItem;
  }, [safeStringArray, safeText]);

  const normalizeSignalItem = useCallback((item: unknown): SignalItem | undefined => {
    return normalizeBoardSignalItem(item);
  }, [normalizeBoardSignalItem]);

  const dedupeByKey = useCallback(<T,>(items: T[], getKey: (item: T) => string) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = getKey(item);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

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
  const sourceStats = availableSources.map((source) => {
    const count = sourceCounts[source.url] || sourceCounts[source.label] || 0;

    return {
      ...source,
      count,
      hasNews: count > 0,
    };
  });
  const groupedSources = {
    china: sourceStats.filter((source) => isChineseSource(source.label) || isChineseSource(source.url)),
    global: sourceStats.filter((source) => !(isChineseSource(source.label) || isChineseSource(source.url))),
  };
  const visibleNews =
    sourceMode === "all" ? news : news.filter((item) => selectedSources.includes(item.sourceUrl || item.source));
  const displayNews = [...visibleNews]
    .sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      const diff = bTime - aTime;
      if (diff !== 0) {
        return diff;
      }

      return a.rank - b.rank;
    })
    .slice(0, newsLimit);
  const newsById = new Map(displayNews.map((item) => [item.id, item]));
  const visibleSourceCount = sourceMode === "all" ? availableSourceUrls.length : selectedSources.length;
  const filteredSources = sourceStats.filter((source) => {
    if (!sourceSearchTerm) {
      return true;
    }

    return `${source.label} ${source.url}`.toLowerCase().includes(sourceSearchTerm);
  });

  function getSourceCount(source: { url: string; label: string }) {
    return sourceCounts[source.url] || sourceCounts[source.label] || 0;
  }

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

  function formatRelativeAge(item: Pick<NewsItem, "publishedAt" | "age">) {
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

    return item.age;
  }

  function formatSnapshotTime(value?: string) {
    if (!value) {
      return isZh ? "刚刚" : "just now";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return isZh ? "刚刚" : "just now";
    }

    const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
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

  function findThresholdForSignal(asset: string) {
    const normalized = asset.toLowerCase();

    return thresholds.find((item) => {
      const haystack = `${item.symbol} ${item.name} ${item.category}`.toLowerCase();
      return (
        haystack.includes(normalized)
        || normalized.includes(item.symbol.toLowerCase())
        || normalized.includes(item.name.toLowerCase())
      );
    });
  }

  const hydrateCachedData = useCallback(() => {
    try {
      const cached = window.localStorage.getItem(DATA_CACHE_KEY);
      if (!cached) {
        return;
      }

      const parsed = JSON.parse(cached);
      if (!parsed || typeof parsed !== "object") {
        return;
      }

      if (typeof parsed.savedAt === "number" && Date.now() - parsed.savedAt > DATA_CACHE_TTL_MS) {
        return;
      }

      if (Array.isArray(parsed.news)) {
        const cachedNews: unknown[] = parsed.news;
        const filteredCachedNews = cachedNews
          .map((item, index) => normalizeNewsItem(item, index))
          .filter(Boolean) as NewsItem[];
        const normalizedCachedNews: NewsItem[] = dedupeByKey(
          filteredCachedNews,
          (item) => item.id,
        );
        setNews(normalizedCachedNews);
      }

      if (Array.isArray(parsed.signals)) {
        const cachedSignals: unknown[] = parsed.signals;
        const filteredCachedSignals = cachedSignals
          .map((item) => normalizeSignalItem(item))
          .filter(Boolean) as SignalItem[];
        const normalizedCachedSignals: SignalItem[] = dedupeByKey(
          filteredCachedSignals,
          (item) => `${item.asset}-${item.reason}`,
        );
        setSignals(normalizedCachedSignals);
      }

      if (Array.isArray(parsed.sourceCatalog)) {
        const cachedSources: unknown[] = parsed.sourceCatalog;
        const filteredCachedSources = cachedSources
          .map((item) => normalizeSourceItem(item))
          .filter(Boolean) as SourceItem[];
        setSourceCatalog(
          dedupeByKey(
            filteredCachedSources,
            (item) => item.url,
          ),
        );
      }

      if (Array.isArray(parsed.thresholds)) {
        const restoredThresholds = parsed.thresholds.filter(
          (item: unknown): item is ThresholdItem =>
            Boolean(item)
            && typeof item === "object"
            && typeof (item as ThresholdItem).symbol === "string"
            && typeof (item as ThresholdItem).name === "string",
        );
        setThresholds(restoredThresholds.map((item: ThresholdItem) => normalizeThresholdItem(item)));
      }
    } catch {
      // Ignore malformed cache entries.
    }
  }, [dedupeByKey, normalizeNewsItem, normalizeSignalItem, normalizeSourceItem]);

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

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures.
    }
  }, [isZh, lang]);

  useEffect(() => {
    hydrateCachedData();
  }, [hydrateCachedData]);

  useEffect(() => {
    try {
      const storedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLang === "en" || storedLang === "zh") {
        setLang(storedLang);
      }
    } catch {
      // Ignore storage failures.
    }
  }, [dedupeByKey, normalizeNewsItem, normalizeSignalItem, normalizeSourceItem]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SOURCE_STORAGE_KEY);
      if (!stored) {
        setSourcePrefsLoaded(true);
        return;
      }

      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        setSourceMode(parsed.mode === "custom" ? "custom" : "all");
        setSelectedSources(
          Array.isArray(parsed.sources)
            ? parsed.sources.filter((value: unknown) => typeof value === "string")
            : [],
        );
      }
    } catch {
      // Ignore malformed saved preferences.
    } finally {
      setSourcePrefsLoaded(true);
    }
  }, [dedupeByKey, normalizeNewsItem, normalizeSignalItem, normalizeSourceItem]);

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
        return availableSourceUrls;
      }

      return normalized.filter((source) => availableSourceUrls.includes(source));
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
    const sections = BOARD_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );

    if (sections.length === 0) {
      return;
    }

    const getScrollOffset = () => {
      const topbar = document.querySelector(".board-topbar");
      if (!(topbar instanceof HTMLElement)) {
        return BOARD_SCROLL_OFFSET_FALLBACK;
      }

      return Math.ceil(topbar.getBoundingClientRect().height) + 16;
    };

    const updateActiveSection = () => {
      const scrollLine = window.scrollY + getScrollOffset() + 24;
      let nextSection = sections[0]?.id as BoardSectionId | undefined;

      sections.forEach((section) => {
        if (section.offsetTop <= scrollLine) {
          nextSection = section.id as BoardSectionId;
        }
      });

      if (nextSection) {
        setActiveBoardSection(nextSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [dedupeByKey, normalizeNewsItem, normalizeSignalItem, normalizeSourceItem]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsRefreshing(true);

      try {
        const [newsRes, signalsRes, sourcesRes, thresholdsRes, settingsRes, boardRes] = await Promise.all([
          fetch(`${config.apiUrl}/news`),
          fetch(`${config.apiUrl}/signals`),
          fetch(`${config.apiUrl}/sources`),
          fetch(`${config.apiUrl}/thresholds`),
          fetch(`${config.apiUrl}/settings`),
          fetch(`${config.apiUrl}/board`),
        ]);

        const [newsData, signalData, sourceData, thresholdData, settingsData, boardJson] = await Promise.all([
          newsRes.json(),
          signalsRes.json(),
          sourcesRes.json(),
          thresholdsRes.json(),
          settingsRes.json(),
          boardRes.json(),
        ]);

        if (cancelled) {
          return;
        }

        const rawNews: unknown[] = Array.isArray(newsData) ? newsData : [];
        const normalizedNews = rawNews
          .map((item, index) => normalizeNewsItem(item, index))
          .filter((item): item is NewsItem => Boolean(item));
        const nextNews = dedupeByKey(normalizedNews, (item) => item.id);

        const rawSignals: unknown[] = Array.isArray(signalData) ? signalData : [];
        const normalizedSignals = rawSignals
          .map((item) => normalizeSignalItem(item))
          .filter((item): item is SignalItem => Boolean(item));
        const nextSignals = dedupeByKey(normalizedSignals, (item) => `${item.asset}-${item.reason}`);

        const rawSources: unknown[] = Array.isArray(sourceData?.sources) ? sourceData.sources : [];
        const normalizedSources = rawSources
          .map((item) => normalizeSourceItem(item))
          .filter((item): item is SourceItem => Boolean(item));
        const nextSources = dedupeByKey(normalizedSources, (item) => item.url);
        const nextThresholds = Array.isArray(thresholdData?.thresholds) ? thresholdData.thresholds : [];
        const nextNewsLimit = Number(settingsData?.newsLimit);

        if (nextNews.length > 0 || newsRef.current.length === 0) {
          setNews(nextNews);
        }

        if (nextSignals.length > 0 || signalsRef.current.length === 0) {
          setSignals(nextSignals);
        }

        if (nextSources.length > 0) {
          setSourceCatalog(nextSources);
        }

        const normalizedThresholds = nextThresholds.filter(
          (item: unknown): item is ThresholdItem => {
            return (
              Boolean(item)
              && typeof item === "object"
              && typeof (item as ThresholdItem).symbol === "string"
              && typeof (item as ThresholdItem).name === "string"
            );
          },
        );
        setThresholds(normalizedThresholds.map((item: ThresholdItem) => normalizeThresholdItem(item)));

        if ([50, 100, 200].includes(nextNewsLimit)) {
          setNewsLimit(nextNewsLimit);
        }

        if (boardJson && typeof boardJson === "object") {
          setBoardData(boardJson as BoardPayload);
        }

        try {
          window.localStorage.setItem(
            DATA_CACHE_KEY,
            JSON.stringify({
              savedAt: Date.now(),
              news: nextNews,
              signals: nextSignals,
              sourceCatalog: nextSources,
              thresholds: nextThresholds,
            }),
          );
        } catch {
          // Ignore cache write failures.
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
  }, [dedupeByKey, normalizeNewsItem, normalizeSignalItem, normalizeSourceItem]);

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

  const signalDirectionCounts = {
    bullish: signals.filter((item) => item.direction === "bullish").length,
    bearish: signals.filter((item) => item.direction === "bearish").length,
    neutral: signals.filter((item) => item.direction === "neutral").length,
  };
  const triggeredThresholdCount = thresholds.filter((item) => getThresholdStatus(item).triggered).length;
  const highPriorityThresholdCount = thresholds.filter((item) => item.priority === "P0").length;

  const newsMatchesDimension = (item: NewsItem, dimensionKey: string) =>
    Array.isArray(item.dimensions) && item.dimensions.includes(dimensionKey);
  const signalMatchesDimension = (item: SignalItem, dimensionKey: string) => {
    if (item.dimension === dimensionKey) {
      return true;
    }

    return (
      Array.isArray(item.relatedNewsIds)
      && item.relatedNewsIds.some((id) => newsById.get(id)?.dimensions?.includes(dimensionKey))
    );
  };

  const filteredBoardNews = activeDimension ? displayNews.filter((item) => newsMatchesDimension(item, activeDimension)) : displayNews;
  const filteredBoardSignals = activeDimension ? signals.filter((item) => signalMatchesDimension(item, activeDimension)) : signals;
  const boardTopNews = normalizeBoardNewsItem(boardData?.topNews?.[0], displayNews[0]);
  const boardTopSignal = normalizeBoardSignalItem(boardData?.topSignals?.[0], signals[0]);
  const topSignal = activeDimension ? filteredBoardSignals[0] ?? signals[0] : boardTopSignal ?? signals[0];
  const topNews = activeDimension ? filteredBoardNews[0] ?? displayNews[0] : boardTopNews ?? displayNews[0];
  const leadFollowUps = filteredBoardNews
    .filter((item) => item.id !== topNews?.id)
    .slice(0, 4);
  const excludedLeadNewsIds = [topNews?.id, ...leadFollowUps.map((item) => item.id)].filter(Boolean) as string[];

  function countNewsByKeywords(keywords: string[]) {
    if (keywords.length === 0) {
      return 0;
    }

    return displayNews.filter((item) => {
      const text = `${item.title} ${item.summary} ${item.source} ${item.domain}`.toLowerCase();
      return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    }).length;
  }

  function countSignalsByKeywords(keywords: string[]) {
    if (keywords.length === 0) {
      return 0;
    }

    return signals.filter((item) => {
      const text = `${item.asset} ${item.reason}`.toLowerCase();
      const matchedThreshold = findThresholdForSignal(item.asset);
      const thresholdText = matchedThreshold
        ? `${matchedThreshold.symbol} ${matchedThreshold.name} ${matchedThreshold.category}`.toLowerCase()
        : "";
      return keywords.some(
        (keyword) => text.includes(keyword.toLowerCase()) || thresholdText.includes(keyword.toLowerCase()),
      );
    }).length;
  }

  const fallbackDimensionDefs = getFallbackDimensionDefs(isZh);
  const fallbackDimensionMap = Object.fromEntries(fallbackDimensionDefs.map((item) => [item.key, item])) as Record<
    string,
    (typeof fallbackDimensionDefs)[number]
  >;
  const normalizedBoardDimensions =
    Array.isArray(boardData?.dimensions)
      ? boardData.dimensions
          .filter((item): item is NonNullable<BoardPayload["dimensions"]>[number] => Boolean(item) && typeof item === "object")
          .map((item) => ({
            key: safeText(item.key, "general"),
            label: safeText(item.label, "General"),
            labelZh: safeText(item.labelZh, "综合"),
            state: item.state,
            description: safeText(item.description, isZh ? "等待更多上下文。" : "Waiting for more context."),
            tone: safeText(item.tone, "#94a3b8"),
            newsCount: Number.isFinite(Number(item.newsCount)) ? Number(item.newsCount) : 0,
            signalCount: Number.isFinite(Number(item.signalCount)) ? Number(item.signalCount) : 0,
            thresholdCount: Number.isFinite(Number(item.thresholdCount)) ? Number(item.thresholdCount) : 0,
            representativeAssets: safeStringArray(item.representativeAssets),
          }))
      : [];
  const dimensionSource: DimensionSourceItem[] =
    normalizedBoardDimensions.length > 0 ? normalizedBoardDimensions : fallbackDimensionDefs;
  const dimensionCards: DimensionCard[] = dimensionSource.map((card) => {
    const keywords = "keywords" in card ? card.keywords || [] : [];
    const newsCount = "newsCount" in card ? card.newsCount : countNewsByKeywords(keywords);
    const signalCount = "signalCount" in card ? card.signalCount : countSignalsByKeywords(keywords);
    const thresholdCount =
      "thresholdCount" in card
        ? card.thresholdCount
        : thresholds.filter((item) => {
            const haystack =
              `${item.symbol} ${item.name} ${item.category} ${item.note} ${item.marketSymbol} ${item.tags.join(" ")}`.toLowerCase();
            return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
          }).length;

    const state =
      "state" in card && card.state
        ? card.state
        : signalCount + thresholdCount >= 5
          ? "hot"
          : signalCount + newsCount >= 3
            ? "warming"
            : thresholdCount >= 2
              ? "cooling"
              : "neutral";

    return {
      key: card.key,
      label: isZh ? card.labelZh : card.label,
      tone: card.tone,
      description: card.description,
      newsCount,
      signalCount,
      thresholdCount,
      state,
      representativeAssets: card.representativeAssets || fallbackDimensionMap[String(card.key)]?.representativeAssets || [],
    };
  });
  const activeDimensionCard = dimensionCards.find((item) => item.key === activeDimension) || null;

  const normalizedReportBriefs =
    Array.isArray(boardData?.reportBriefs)
      ? boardData.reportBriefs
          .filter((item): item is NonNullable<BoardPayload["reportBriefs"]>[number] => Boolean(item) && typeof item === "object")
          .map((item) => ({
            label: safeText(isZh ? item.labelZh : item.label, isZh ? "简报" : "Brief"),
            value: safeText(item.value, "--"),
            meta: safeText(item.meta, isZh ? "等待更新" : "Awaiting update"),
          }))
          .filter((item) => item.value)
      : [];

  const reportBriefs =
    normalizedReportBriefs.length > 0
      ? normalizedReportBriefs
      : [
          {
            label: isZh ? "市场脉冲" : "Market Pulse",
            value: `${signalDirectionCounts.bullish}/${signalDirectionCounts.bearish}`,
            meta: isZh ? "看涨 / 看跌 结构" : "Bullish vs bearish balance",
          },
          {
            label: isZh ? "阈值压力" : "Threshold Pressure",
            value: `${triggeredThresholdCount}/${thresholds.length}`,
            meta: isZh ? "已触发 / 总阈值" : "Triggered vs total",
          },
          {
            label: isZh ? "高优先级" : "High Priority",
            value: `${highPriorityThresholdCount}`,
            meta: isZh ? "P0 阈值总数" : "Count of P0 thresholds",
          },
          {
            label: isZh ? "阅读覆盖" : "Coverage",
            value: `${displayNews.length}`,
            meta: isZh ? "当前筛选后新闻数" : "News items currently in view",
          },
        ];

  function scrollToBoardSection(sectionId: BoardSectionId) {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    setActiveBoardSection(sectionId);
    const topbar = document.querySelector(".board-topbar");
    const offset = topbar instanceof HTMLElement
      ? Math.ceil(topbar.getBoundingClientRect().height) + 16
      : BOARD_SCROLL_OFFSET_FALLBACK;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - offset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }

  const marketStateMeta: MarketStateMeta = (() => {
    const state = boardData?.marketState || "neutral";
    if (state === "risk") {
      return {
        label: isZh ? boardData?.marketStateLabelZh || "风险偏高" : boardData?.marketStateLabel || "Risk-Off",
        summary:
          boardData?.marketStateSummary
          || (isZh ? "空头信号占优，市场需要更谨慎地阅读。" : "Bearish pressure is leading and the tape deserves caution."),
        tone: "danger",
      } as const;
    }
    if (state === "warming") {
      return {
        label: isZh ? boardData?.marketStateLabelZh || "偏暖" : boardData?.marketStateLabel || "Warming",
        summary:
          boardData?.marketStateSummary
          || (isZh ? "偏多信号增加，市场语气正在改善。" : "Constructive signals are rising and tone is improving."),
        tone: "positive",
      } as const;
    }
    return {
      label: isZh ? boardData?.marketStateLabelZh || "平衡" : boardData?.marketStateLabel || "Balanced",
      summary:
        boardData?.marketStateSummary
        || (isZh ? "信号混合，市场在等待更清晰的方向。" : "Signals are mixed and the market is waiting for cleaner leadership."),
      tone: "muted",
    } as const;
  })();

  const boardNavItems: BoardNavItem[] = [
    {
      id: "overview" as const,
      label: isZh ? "首页" : "Home",
      hint: isZh ? "头条、市场与快照" : "Lead, market, and snapshot",
      meta: marketStateMeta.label,
    },
    {
      id: "news" as const,
      label: ui.newsTitle,
      hint: ui.newsSubtitle,
      meta: `${numberFormatter.format(displayNews.length)} ${ui.newsCountLabel}`,
    },
    {
      id: "signals" as const,
      label: ui.signalsTitle,
      hint: ui.signalsSubtitle,
      meta: `${numberFormatter.format(signals.length)} ${ui.signalsCountLabel}`,
    },
    {
      id: "dimensions" as const,
      label: isZh ? "镜头" : "Lens",
      hint: isZh ? "从投资维度读市场" : "Read the market through investable lenses",
      meta: `${numberFormatter.format(dimensionCards.length)} ${isZh ? "个镜头" : "lenses"}`,
    },
    {
      id: "reports" as const,
      label: isZh ? "摘要" : "Digest",
      hint: isZh ? "关键数字与摘要" : "Key numbers and digest",
      meta: `${numberFormatter.format(reportBriefs.length)} ${isZh ? "项" : "items"}`,
    },
    {
      id: "sources" as const,
      label: ui.sourceFilterTitle,
      hint: ui.sourceFilterHint,
      meta: `${visibleSourceCount} ${ui.sourceCountLabel}`,
    },
    {
      id: "standards" as const,
      label: isZh ? "说明" : "Notes",
      hint: isZh ? "如何阅读这页" : "How to read this page",
      meta: isZh ? "编辑说明" : "editor's note",
    },
  ];

  function classifyNews(item: NewsItem) {
    if (item.dimensionLabelZh || item.dimensionLabel) {
      return {
        label: isZh
          ? item.dimensionLabelZh || item.dimensionLabel || "综合"
          : item.dimensionLabel || item.dimensionLabelZh || "General",
        tone: item.dimensionTone || "#94a3b8",
      };
    }

    const text = `${item.title} ${item.summary} ${item.source} ${item.domain}`.toLowerCase();
    const defs = [
      { labelZh: "宏观", labelEn: "Macro", keywords: ["cpi", "pmi", "rate", "yield", "fed", "通胀", "利率", "宏观"], tone: "#7dd3fc" },
      { labelZh: "事件", labelEn: "Event", keywords: ["policy", "guidance", "earnings", "事件", "财报", "政策"], tone: "#fdba74" },
      { labelZh: "流动性", labelEn: "Liquidity", keywords: ["liquidity", "flow", "funding", "volume", "资金", "流动性"], tone: "#5eead4" },
      { labelZh: "风险", labelEn: "Risk", keywords: ["risk", "vix", "volatility", "risk off", "波动", "风险"], tone: "#fca5a5" },
      { labelZh: "估值", labelEn: "Valuation", keywords: ["valuation", "multiple", "pe", "pb", "估值"], tone: "#c4b5fd" },
    ];

    const matched = defs.find((def) => def.keywords.some((keyword) => text.includes(keyword.toLowerCase())));
    return matched
      ? { label: isZh ? matched.labelZh : matched.labelEn, tone: matched.tone }
      : { label: isZh ? "综合" : "General", tone: "#94a3b8" };
  }

  return (
    <div className={`board-cinema-shell ${isZh ? "board-lang-zh" : "board-lang-en"}`}>
      <div className="board-ambient board-ambient-left" />
      <div className="board-ambient board-ambient-right" />
      <div className="board-brand-stage" aria-hidden="true">
        <div className="board-brand-stage-mark">
          <span className="board-brand-stage-ring board-brand-stage-ring-a" />
          <span className="board-brand-stage-ring board-brand-stage-ring-b" />
          <span className="board-brand-stage-ring board-brand-stage-ring-c" />
          <span className="board-brand-stage-core" />
          <span className="board-brand-stage-word">STS</span>
        </div>
      </div>

      <div className="board-shell board-shell-cinema">
        <ReadingRail
          ui={ui}
          isZh={isZh}
          isRefreshing={isRefreshing}
          marketStateMeta={marketStateMeta}
          displayNewsCount={numberFormatter.format(displayNews.length)}
          signalsCount={numberFormatter.format(signals.length)}
          triggeredThresholdCount={numberFormatter.format(triggeredThresholdCount)}
          thresholdsCount={numberFormatter.format(thresholds.length)}
          visibleSourceCount={visibleSourceCount}
          snapshotTime={formatSnapshotTime(boardData?.generatedAt)}
          boardNavItems={boardNavItems}
          activeBoardSection={activeBoardSection}
          onScrollToSection={scrollToBoardSection}
          onToggleLanguage={() => setLang((current) => (current === "en" ? "zh" : "en"))}
        />

        <div className="board-content board-stage">
          <HeroSection
            id="overview"
            isZh={isZh}
            marketStateMeta={marketStateMeta}
            snapshotTime={formatSnapshotTime(boardData?.generatedAt)}
            reportBriefs={reportBriefs}
            activeDimensionCard={activeDimensionCard}
            onClearDimension={() => setActiveDimension(null)}
            topNews={topNews}
            secondaryNews={leadFollowUps}
            topSignal={topSignal}
            formatSourceLabel={formatSourceLabel}
            formatRelativeAge={formatRelativeAge}
          />

          <main className="board-main-grid">
            <div id="dimensions" className="board-grid-anchor" aria-hidden="true" />
            <NewsSection
              id="news"
              ui={ui}
              isZh={isZh}
              excludedNewsIds={excludedLeadNewsIds}
              displayNewsCount={numberFormatter.format(displayNews.length)}
              sourceMode={sourceMode}
              availableSourceCount={numberFormatter.format(availableSourceUrls.length)}
              selectedSourceCount={numberFormatter.format(selectedSources.length)}
              sourceSearch={sourceSearch}
              onSourceSearchChange={setSourceSearch}
              onFocusChina={() => focusSourceGroup("china")}
              onFocusGlobal={() => focusSourceGroup("global")}
              onSelectAllSources={selectAllSources}
              onClearSources={clearSources}
              groupedSources={groupedSources}
              filteredSources={filteredSources}
              selectedSources={selectedSources}
              getSourceCount={getSourceCount}
              formatSourceLabel={formatSourceLabel}
              onToggleSource={toggleSource}
              filteredBoardNews={filteredBoardNews}
              activeDimension={activeDimension}
              formatRelativeAge={formatRelativeAge}
              classifyNews={classifyNews}
              numberFormatter={numberFormatter}
            />

            <div id="reports" className="board-grid-anchor" aria-hidden="true" />
            <SignalsSection
              id="signals"
              ui={ui}
              isZh={isZh}
              signalsCount={numberFormatter.format(signals.length)}
              thresholds={thresholds}
              filteredBoardSignals={filteredBoardSignals}
              activeDimension={activeDimension}
              findThresholdForSignal={findThresholdForSignal}
            />

            <div id="standards" className="board-grid-anchor" aria-hidden="true" />
            <InsightsSidebar
              isZh={isZh}
              dimensionCards={dimensionCards}
              activeDimension={activeDimension}
              onToggleDimension={(key) => setActiveDimension((current) => (current === key ? null : key))}
              reportBriefs={reportBriefs}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
