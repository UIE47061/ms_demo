import type { CarbonEvent, Device } from "../types";
import { categories, sum } from "./stats";
export interface WorkspaceAlert {
  id: string;
  title: string;
  detail: string;
  kind: "device" | "source";
  value: string;
  rule: string;
}
export function workspaceAlerts(
  devices: Device[],
  events: CarbonEvent[],
  scope = "all",
): WorkspaceAlert[] {
  const rows: WorkspaceAlert[] = devices
    .filter((d) => d.status !== "在線")
    .map((d) => ({
      id: `device:${d.id}`,
      title: `${d.name} · ${d.status === "警告" ? "電量偏低" : "連線中斷"}`,
      detail: `${d.location} · 辦公室共用設備`,
      kind: "device",
      value: d.status === "警告" ? `${d.battery}%` : "離線",
      rule:
        d.status === "警告"
          ? "設備狀態為警告，建議安排電池與感測巡檢。"
          : "設備狀態為離線，建議檢查網路與供電。",
    }));
  const top = categories(events).sort((a, b) => b.value - a.value)[0];
  const total = sum(events);
  if (total > 0 && top.value / total > 0.5)
    rows.push({
      id: `source:${top.key}:${scope}`,
      title: `${top.name}占比超過一半`,
      detail: "依目前期間與部門範圍計算",
      kind: "source",
      value: `${((top.value / total) * 100).toFixed(1)}%`,
      rule: "來源占比高於 50% 時列為觀察項目；不表示排放超標。",
    });
  return rows;
}
