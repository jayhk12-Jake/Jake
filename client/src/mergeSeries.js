// [{id,label,series:[{date,usdMillions}]}] 형태를 recharts가 쓰는
// [{date, id1: v, id2: v, ...}] 형태로 병합합니다. (날짜는 각 시리즈 최신 구간 기준)
export function mergeByDate(groups) {
  const byDate = new Map();
  for (const group of groups) {
    for (const point of group.series) {
      if (point.usdMillions == null) continue;
      const row = byDate.get(point.date) || { date: point.date };
      row[group.id] = point.usdMillions;
      byDate.set(point.date, row);
    }
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
