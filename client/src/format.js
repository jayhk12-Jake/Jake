// 서버는 대부분의 화폐 시계열을 "백만 USD(USD millions)" 단위로 내려줍니다.
export function formatUsdFromMillions(millions) {
  if (millions == null || Number.isNaN(millions)) return "—";
  const trillions = millions / 1_000_000;
  if (Math.abs(trillions) >= 1) {
    return `$${trillions.toFixed(2)}T`;
  }
  const billions = millions / 1000;
  return `$${billions.toFixed(1)}B`;
}

export function formatIndex(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

export function formatPct(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return dateStr;
}
