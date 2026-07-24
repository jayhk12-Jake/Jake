export default function ChartTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="tooltip-card">
      <div className="t-date">{label}</div>
      {payload.map((p) => (
        <div className="tooltip-row" key={p.dataKey}>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: p.color }} />
            {p.name}
          </span>
          <strong>{formatValue ? formatValue(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}
