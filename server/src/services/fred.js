import fetch from "node-fetch";
import { withCache } from "./cache.js";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";
const TTL_MS = 6 * 60 * 60 * 1000; // 6시간 캐시 (FRED 데이터는 일/주/월 단위 갱신)

export class FredError extends Error {}

/**
 * FRED 시리즈의 관측치를 가져옵니다.
 * @param {string} seriesId
 * @param {{limit?: number}} opts
 * @returns {Promise<{date: string, value: number}[]>}
 */
export async function fetchSeries(seriesId, { limit = 260 } = {}) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new FredError("FRED_API_KEY가 설정되지 않았습니다. server/.env를 확인하세요.");
  }

  const { value } = await withCache(`fred:${seriesId}:${limit}`, TTL_MS, async () => {
    const url = new URL(FRED_BASE);
    url.searchParams.set("series_id", seriesId);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("sort_order", "desc");
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) {
      throw new FredError(`FRED API 오류 (${seriesId}): HTTP ${res.status}`);
    }
    const json = await res.json();
    if (!json.observations) {
      throw new FredError(`FRED API 응답에 observations가 없습니다 (${seriesId})`);
    }
    return json.observations
      .filter((o) => o.value !== ".")
      .map((o) => ({ date: o.date, value: Number(o.value) }))
      .reverse(); // 오래된 -> 최신 순으로 정렬
  });

  return value;
}

export function latestOf(observations) {
  if (!observations || observations.length === 0) return null;
  return observations[observations.length - 1];
}

export function previousOf(observations) {
  if (!observations || observations.length < 2) return null;
  return observations[observations.length - 2];
}
