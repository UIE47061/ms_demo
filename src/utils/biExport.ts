import { employees, history, sourceMeta } from "../data/seed";
import type { CarbonEvent, Source } from "../types";
export type BiCell = string | number | boolean | null;
export interface BiTable {
  name: string;
  headers: string[];
  rows: BiCell[][];
}
export function buildBiTables(events: CarbonEvent[]): {
  events: BiTable;
  monthly: BiTable;
} {
  const eventTable: BiTable = {
    name: "EcoEvents",
    headers: [
      "event_id",
      "event_date",
      "occurred_at_local",
      "event_month",
      "employee_id",
      "employee_name",
      "department",
      "source_key",
      "source_name",
      "activity",
      "emission_kg_co2e",
      "avoided_kg_co2e",
      "detail",
      "mock_data",
    ],
    rows: events.map((e) => [
      e.id,
      e.date.slice(0, 10),
      e.date.slice(0, 19),
      e.date.slice(0, 7),
      e.employeeId,
      employees.find((p) => p.id === e.employeeId)?.name || e.employeeId,
      e.department,
      e.source,
      sourceMeta[e.source].label,
      e.title,
      e.emission,
      e.avoided,
      e.detail,
      true,
    ]),
  };
  const keys = Object.keys(sourceMeta) as Source[];
  const monthly: BiTable = {
    name: "EcoMonthlyTrend",
    headers: [
      "month_start",
      "source_key",
      "source_name",
      "emission_kg_co2e",
      "avoided_kg_co2e",
      "data_layer",
      "coverage_note",
      "mock_data",
    ],
    rows: [
      ...history.flatMap((h, i) =>
        keys.map(
          (k) =>
            [
              `2026-${String(i + 5).padStart(2, "0")}-01`,
              k,
              sourceMeta[k].label,
              h[k],
              null,
              "history_summary",
              "全公司歷史月度彙總；未提供部門分布",
              true,
            ] as BiCell[],
        ),
      ),
      ...keys.map((k) => {
        const rows = events.filter((e) => e.source === k);
        return [
          "2026-10-01",
          k,
          sourceMeta[k].label,
          Number(rows.reduce((a, e) => a + e.emission, 0).toFixed(6)),
          Number(rows.reduce((a, e) => a + e.avoided, 0).toFixed(6)),
          "current_events",
          "2026/10/01–10/27 呈現事件彙總",
          true,
        ] as BiCell[];
      }),
    ],
  };
  return { events: eventTable, monthly };
}
export function biCsv(table: BiTable): string {
  const cell = (v: BiCell) => {
    if (v === null) return "";
    if (typeof v === "number") {
      if (!Number.isFinite(v)) throw Error("匯出數值必須有限");
      return String(v);
    }
    if (typeof v === "boolean") return v ? "true" : "false";
    const literal = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${literal.replace(/"/g, '""')}"`;
  };
  return (
    "\uFEFF" +
    [table.headers, ...table.rows]
      .map((row) => row.map(cell).join(","))
      .join("\r\n") +
    "\r\n"
  );
}
export function validatePowerBiReportUrl(value: string): string | null {
  try {
    const u = new URL(value.trim());
    if (
      u.protocol !== "https:" ||
      u.hostname !== "app.powerbi.com" ||
      u.port ||
      u.username ||
      u.password
    )
      return null;
    if (
      !/^\/groups\/[^/]+\/reports\/[^/]+/.test(u.pathname) &&
      u.pathname !== "/reportEmbed"
    )
      return null;
    if (u.pathname === "/reportEmbed" && !u.searchParams.get("reportId"))
      return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function buildDepartmentBiTable(events: CarbonEvent[]): BiTable {
  const groups = new Map<string, CarbonEvent[]>();
  for (const e of events) {
    const key = `${e.department}|${e.source}`;
    groups.set(key, [...(groups.get(key) || []), e]);
  }
  return {
    name: "EcoDepartmentSummary",
    headers: [
      "department",
      "source_name",
      "emission_kg_co2e",
      "avoided_kg_co2e",
      "activity_count",
    ],
    rows: [...groups.values()].map((rows) => [
      rows[0].department,
      sourceMeta[rows[0].source].label,
      Number(rows.reduce((a, e) => a + e.emission, 0).toFixed(6)),
      Number(rows.reduce((a, e) => a + e.avoided, 0).toFixed(6)),
      rows.length,
    ]),
  };
}

// Secure embed keeps Power BI account permissions; no public publish link or token.
export function powerBiEmbedUrl(value: string): string | null {
  const clean = validatePowerBiReportUrl(value);
  if (!clean) return null;
  const url = new URL(clean);
  const guid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const path = url.pathname.match(
    /^\/groups\/([^/]+)\/reports\/([^/]+)(?:\/([^/]+))?/,
  );
  const reportId = url.searchParams.get("reportId") || path?.[2];
  if (!reportId || !guid.test(reportId)) return null;
  const embed = new URL("https://app.powerbi.com/reportEmbed");
  embed.searchParams.set("reportId", reportId);
  embed.searchParams.set("autoAuth", "true");
  const groupId = url.searchParams.get("groupId") || path?.[1];
  if (groupId && guid.test(groupId)) embed.searchParams.set("groupId", groupId);
  const tenant = url.searchParams.get("ctid");
  if (tenant && guid.test(tenant)) embed.searchParams.set("ctid", tenant);
  const page = url.searchParams.get("pageName") || path?.[3];
  if (page && /^[a-z0-9_-]{1,100}$/i.test(page))
    embed.searchParams.set("pageName", page);
  return embed.toString();
}

// Open the full Power BI service for sign-in, even when an embed URL was saved.
export function powerBiOpenUrl(value: string): string | null {
  const clean = validatePowerBiReportUrl(value);
  if (!clean) return null;
  if (new URL(clean).pathname !== "/reportEmbed") return clean;
  const normalized = powerBiEmbedUrl(clean);
  if (!normalized) return "https://app.powerbi.com/";
  const params = new URL(normalized).searchParams;
  const group = params.get("groupId") || "me";
  const page = params.get("pageName");
  const open = new URL(
    `https://app.powerbi.com/groups/${group}/reports/${params.get("reportId")}${page ? `/${page}` : ""}`,
  );
  const tenant = params.get("ctid");
  if (tenant) open.searchParams.set("ctid", tenant);
  return open.toString();
}
