// FRED(https://fred.stlouisfed.org) 시리즈 ID 매핑.
// 일부 ID(특히 중앙은행 대차대조표/M2 계열)는 FRED에서 개편/중단될 수 있으므로,
// 데이터가 비정상적으로 보이면 아래 ID를 FRED 사이트에서 검색해 갱신하세요.

export const FED_NET_LIQUIDITY = {
  fedAssets: "WALCL", // Fed 총자산 (주간, 백만 달러)
  tga: "WTREGEN", // 재무부 일반계정 (TGA, 주간, 백만 달러)
  rrp: "RRPONTSYD", // 익일 역레포 (일간, 십억 달러)
};

// 주요국 중앙은행 총자산 (자국 통화 기준). USD 환산을 위해 fxSeries 필요.
export const CENTRAL_BANKS = [
  { id: "fed", label: "Fed (미국)", series: "WALCL", unit: "USD_MM", fxSeries: null },
  { id: "ecb", label: "ECB (유럽)", series: "ECBASSETSW", unit: "EUR_MM", fxSeries: "DEXUSEU", fxDirection: "multiply" },
  { id: "boj", label: "BOJ (일본)", series: "JPNASSETS", unit: "JPY_100M", fxSeries: "DEXJPUS", fxDirection: "divide" },
  { id: "pboc", label: "PBOC (중국)", series: "CHNASSETS", unit: "CNY_MM", fxSeries: "DEXCHUS", fxDirection: "divide" },
];

// 글로벌 M2 (자국 통화 기준, 백만 단위 통일 가정). USD 환산 필요.
export const GLOBAL_M2 = [
  { id: "us", label: "미국", series: "M2SL", unit: "USD_BN", fxSeries: null },
  { id: "eu", label: "유로존", series: "MYAGM2EZM196N", unit: "EUR_MM", fxSeries: "DEXUSEU", fxDirection: "multiply" },
  { id: "cn", label: "중국", series: "MYAGM2CNM189N", unit: "CNY_MM", fxSeries: "DEXCHUS", fxDirection: "divide" },
  { id: "jp", label: "일본", series: "MYAGM2JPM189N", unit: "JPY_MM", fxSeries: "DEXJPUS", fxDirection: "divide" },
];

export const DXY_SERIES = "DTWEXBGS"; // ICE DXY 자체는 FRED 미제공. 무역가중 달러지수(Broad)로 대체.

export const FX_PAIRS = [
  { id: "usdkrw", label: "USD/KRW", series: "DEXKOUS", invert: false },
  { id: "usdjpy", label: "USD/JPY", series: "DEXJPUS", invert: false },
  { id: "eurusd", label: "EUR/USD", series: "DEXUSEU", invert: false },
  { id: "usdcny", label: "USD/CNY", series: "DEXCHUS", invert: false },
];
