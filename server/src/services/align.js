// 서로 다른 주기(일/주/월)의 FRED 시계열을 기준 시계열의 날짜에 맞춰
// "직전 관측치 유지(forward-fill)" 방식으로 정렬합니다.
export function alignToBase(baseObservations, otherObservations) {
  const sorted = [...otherObservations].sort((a, b) => a.date.localeCompare(b.date));
  return baseObservations.map((baseObs) => {
    let latest = null;
    for (const obs of sorted) {
      if (obs.date > baseObs.date) break;
      latest = obs;
    }
    return { date: baseObs.date, value: latest ? latest.value : null };
  });
}

export function convertUnit(value, unit) {
  // 모든 값을 "백만 달러/유로/엔/위안" 등 자국통화 단위로 정규화 후 아래서 USD 억 단위(100M)로 환산
  switch (unit) {
    case "USD_MM":
      return value; // 이미 백만 달러
    case "USD_BN":
      return value * 1000; // 십억 -> 백만
    case "EUR_MM":
      return value; // 백만 유로 (환율 곱해 USD 환산은 별도)
    case "JPY_100M":
      return value * 100; // 억엔 -> 백만엔
    case "JPY_MM":
      return value;
    case "CNY_MM":
      return value;
    default:
      return value;
  }
}

export function toUsdMillions(localMillions, fxValue, fxDirection) {
  if (fxValue == null) return null;
  if (fxDirection === "multiply") return localMillions * fxValue; // 예: EUR -> USD (DEXUSEU = USD per EUR)
  if (fxDirection === "divide") return localMillions / fxValue; // 예: JPY -> USD (DEXJPUS = JPY per USD)
  return localMillions;
}
