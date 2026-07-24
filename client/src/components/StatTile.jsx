export default function StatTile({ label, value, deltaPct, asOf }) {
  let deltaClass = "neutral";
  let icon = "→";
  if (deltaPct != null && !Number.isNaN(deltaPct)) {
    if (deltaPct > 0) {
      deltaClass = "good";
      icon = "▲";
    } else if (deltaPct < 0) {
      deltaClass = "bad";
      icon = "▼";
    }
  }

  return (
    <div className="card stat-tile">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {deltaPct != null && (
        <div className={`delta ${deltaClass}`}>
          <span aria-hidden="true">{icon}</span>
          <span>{Math.abs(deltaPct).toFixed(2)}%</span>
        </div>
      )}
      {asOf && <div className="as-of">기준일: {asOf}</div>}
    </div>
  );
}
