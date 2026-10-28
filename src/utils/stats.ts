import { departments, history, sourceMeta } from "../data/seed";
import type { CarbonEvent, Source } from "../types";
export const n = (value: number, digits = 1) =>
  new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
export const dateTime = (s: string) => s.slice(5, 16).replace("T", " ").replace("-", "/");
export const sum = (
  events: CarbonEvent[],
  field: "emission" | "avoided" = "emission",
) => events.reduce((a, e) => a + e[field], 0);
export function selectEvents(
  events: CarbonEvent[],
  dept = "全部部門",
  period = "month",
) {
  return events.filter(
    (e) =>
      (dept === "全部部門" || e.department === dept) &&
      (period === "month" || e.date.slice(0, 10) >= "2026-10-24"),
  );
}
export function categories(events: CarbonEvent[]) {
  return (Object.keys(sourceMeta) as Source[]).map((key) => ({
    key,
    name: sourceMeta[key].label,
    value: Number(sum(events.filter((e) => e.source === key)).toFixed(2)),
    color: sourceMeta[key].color,
  }));
}
export function daily(events: CarbonEvent[]) {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `10/${21 + i}`,
    value: Number(
      sum(events.filter((e) => e.date.startsWith(`2026-10-${21 + i}`))).toFixed(
        2,
      ),
    ),
  }));
}
export function monthly(events: CarbonEvent[], dept = "全部部門") {
  const factor = dept === "全部部門" ? 1 : 1 / 4;
  return [
    ...history.map((h) => ({
      name: h.month,
      value: (h.waste + h.elevator + h.travel + h.digital) * factor,
    })),
    { name: "10 月", value: sum(events) },
  ];
}
export function departmentStats(events: CarbonEvent[]) {
  return departments.map((name) => ({
    name: name.replace("部", ""),
    value: Number(sum(events.filter((e) => e.department === name)).toFixed(2)),
  }));
}
