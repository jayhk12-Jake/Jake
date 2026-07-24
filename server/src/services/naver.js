import fetch from "node-fetch";
import iconv from "iconv-lite";
import * as cheerio from "cheerio";
import { withCache } from "./cache.js";

// 비공식 소스: 네이버 금융 거래량 상위 페이지를 HTML 파싱합니다.
// 네이버가 마크업을 변경하면 셀렉터가 깨질 수 있습니다. 실패 시 상위 라우트에서
// 에러로 처리되어 프론트엔드가 "데이터를 불러올 수 없음" 상태를 보여줍니다.
const NAVER_URL = "https://finance.naver.com/sise/sise_quant.naver";
const TTL_MS = 30 * 60 * 1000; // 30분 캐시

export async function fetchDomesticTopVolume(limit = 10) {
  const { value } = await withCache(`naver:top-volume:${limit}`, TTL_MS, async () => {
    const res = await fetch(NAVER_URL, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error(`네이버 금융 요청 실패: HTTP ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    const html = iconv.decode(Buffer.from(buffer), "euc-kr");
    const $ = cheerio.load(html);

    const rows = [];
    $("table.type_2 tr").each((_, el) => {
      const cells = $(el).find("td");
      if (cells.length < 11) return;
      const name = $(cells[1]).text().trim();
      if (!name) return;
      const link = $(cells[1]).find("a").attr("href") || "";
      const codeMatch = link.match(/code=(\w+)/);
      rows.push({
        rank: rows.length + 1,
        code: codeMatch ? codeMatch[1] : null,
        name,
        price: parseNumber($(cells[2]).text()),
        changePct: parseNumber($(cells[4]).text()),
        volume: parseNumber($(cells[5]).text()),
      });
    });

    if (rows.length === 0) {
      throw new Error("네이버 금융 페이지 구조를 파싱하지 못했습니다 (셀렉터 변경 가능성)");
    }
    return rows.slice(0, limit);
  });
  return value;
}

function parseNumber(text) {
  const cleaned = text.replace(/,/g, "").replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
