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

export default function NetLiquidityChart({ series }) {
  const data = series
    .filter((d) => d.netLiquidity != null)
    .map((d) => ({ date: d.date, netLiquidity: d.netLiquidity }));

  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netLiquidityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="netLiquidity"
            name="Fed 순유동성"
            stroke="var(--series-1)"
            strokeWidth={2}
            fill="url(#netLiquidityFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="data-source-note">
        산식: Fed 총자산(WALCL) − 재무부 일반계정(TGA) − 익일 역레포(ON RRP) · 출처: FRED
      </div>
    </div>
  );
}
