import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import ChartTooltip from "./ChartTooltip.jsx";
import { formatUsdFromMillions } from "../format.js";

const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

export default function StackedAreaChart({ data, groups }) {
  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatUsdFromMillions(v)}
            width={64}
          />
          <Tooltip content={<ChartTooltip formatValue={formatUsdFromMillions} />} />
          {groups.map((g, i) => (
            <Area
              key={g.id}
              type="monotone"
              dataKey={g.id}
              name={g.label}
              stackId="1"
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              fill={SERIES_COLORS[i % SERIES_COLORS.length]}
              fillOpacity={0.55}
              strokeWidth={1.5}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="legend-row">
        {groups.map((g, i) => (
          <span className="legend-item" key={g.id}>
            <span
              className="legend-dot"
              style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
            {g.label}
          </span>
        ))}
      </div>
    </div>
  );
}
