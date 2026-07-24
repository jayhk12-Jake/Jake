async function get(path) {
  const res = await fetch(path);
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
