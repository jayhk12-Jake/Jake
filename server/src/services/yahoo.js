import fetch from "node-fetch";
import { withCache } from "./cache.js";

// 비공식 소스: Yahoo Finance의 screener 엔드포인트. 공식 API가 아니므로
// 언제든 구조/차단 정책이 바뀔 수 있습니다. 실패 시 상위 라우트에서 에러로 처리됩니다.
const YAHOO_SCREENER_URL =
  "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved";
const TTL_MS = 30 * 60 * 1000; // 30분 캐시

export async function fetchGlobalTopVolume(limit = 10) {
  const { value } = await withCache(`yahoo:top-volume:${limit}`, TTL_MS, async () => {
    const url = new URL(YAHOO_SCREENER_URL);
    url.searchParams.set("formatted", "true");
    url.searchParams.set("lang", "en-US");
    url.searchParams.set("region", "US");
    url.searchParams.set("scrIds", "most_actives");
    url.searchParams.set("count", String(limit));

    const res = await fetch(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Yahoo Finance 요청 실패: HTTP ${res.status}`);
    }
    const json = await res.json();
    const quotes = json?.finance?.result?.[0]?.quotes || [];
    if (quotes.length === 0) {
      throw new Error("Yahoo Finance 응답에서 종목 목록을 찾지 못했습니다");
    }
    return quotes.slice(0, limit).map((q, i) => ({
      rank: i + 1,
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice?.raw ?? null,
      changePct: q.regularMarketChangePercent?.raw ?? null,
      volume: q.regularMarketVolume?.raw ?? null,
    }));
  });
  return value;
}
