import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { n } from "../utils/stats";
// Neutral series stay distinct through labels and position; green marks the primary series.
export const chartPalette = ["#a4b5ab", "#c5cbc7", "#26734d", "#697c72"];
const tip = {
  borderRadius: 8,
  border: "1px solid #E6E9E6",
  fontSize: 12,
  boxShadow: "0 3px 12px #1c25210a",
  color: "#1c2521",
};
export function TrendChart({
  data,
  compact = false,
}: {
  data: { name: string; value: number }[];
  compact?: boolean;
}) {
  return (
    <div
      className={`chart ${compact ? "compact" : ""}`}
      role="img"
      aria-label={`排放趨勢圖：${data.map((d) => `${d.name} ${n(d.value)} kg CO₂e`).join("；")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 15, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#edf0ed" />
          <XAxis
            dataKey="name"
            ticks={
              compact
                ? data.filter((_, i) => i % 2 === 0).map((d) => d.name)
                : undefined
            }
            interval={0}
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            tick={{ fontSize: 11, fill: "#737b76" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "#737b76" }}
            width={compact ? 36 : 48}
          />
          <Tooltip
            contentStyle={tip}
            formatter={(v: number) => [`${n(v)} kg CO₂e`, "估算排放"]}
          />
          <Area
            isAnimationActive={false}
            type="linear"
            dataKey="value"
            stroke="#26734d"
            strokeWidth={2}
            fill="#26734d"
            fillOpacity={0.035}
            activeDot={{ r: 4, strokeWidth: 3, stroke: "white" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function DonutChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="donut-wrap">
      <div className="donut" role="img" aria-label="排放來源分布">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="79%"
              outerRadius="95%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={chartPalette[i % 4]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tip}
              formatter={(v: number) => `${n(v)} kg CO₂e`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <b>{n(total, 0)}</b>
          <span>kg CO₂e</span>
        </div>
      </div>
      <div className="chart-legend">
        {data.map((d, i) => (
          <div key={d.name}>
            <span>
              <i style={{ background: chartPalette[i % 4] }} />
              {d.name}
            </span>
            <b>{total ? n((d.value / total) * 100) : "0"}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
export function CompareChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="chart bar-chart" role="img" aria-label="部門排放比較圖">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ right: 64, left: 0, top: 3, bottom: 3 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            interval={0}
            axisLine={false}
            tickLine={false}
            width={87}
            tick={{ fontSize: 12, fill: "#737b76" }}
          />
          <Tooltip
            contentStyle={tip}
            cursor={{ fill: "#f4f6f3" }}
            formatter={(v: number) => [`${n(v)} kg CO₂e`, "估算排放"]}
          />
          <Bar
            dataKey="value"
            barSize={14}
            radius={[0, 2, 2, 0]}
            isAnimationActive={false}
            fill="#7e9c89"
          >
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: number) => n(v)}
              style={{ fill: "#4d5b52", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
