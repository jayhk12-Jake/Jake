// 개발 환경에서는 비워두고 vite의 /api 프록시를 사용합니다.
// 프론트/백엔드를 다른 도메인에 배포할 경우 빌드 시 VITE_API_BASE=https://api.example.com 지정.
const API_BASE = import.meta.env.VITE_API_BASE || "";

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `요청 실패: ${path}`);
  }
  return json;
}

export const api = {
  netLiquidity: () => get("/api/net-liquidity"),
  centralBanks: () => get("/api/central-banks"),
  globalM2: () => get("/api/global-m2"),
  dxyFx: () => get("/api/dxy-fx"),
  topVolume: () => get("/api/stocks/top-volume"),
};
