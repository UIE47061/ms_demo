import { expect, it } from "vitest";
import { estimateTravel } from "./travel";
import { TRAVEL_REFERENCE_RATE } from "../data/microsoftDemo";
import { createSeed } from "../data/seed";
import { buildDepartmentBiTable } from "./biExport";
import { workspaceAlerts } from "./insights";
import { supervisorAnswer } from "./experience";
it("旅程由里程與比例計算，無效依據不產出數值", () => {
  expect(estimateTravel(165, TRAVEL_REFERENCE_RATE)).toBe(5.8);
  expect(estimateTravel(235, TRAVEL_REFERENCE_RATE)).toBe(8.26);
  expect(estimateTravel(0, TRAVEL_REFERENCE_RATE)).toBeNull();
  expect(estimateTravel(20, NaN)).toBeNull();
  expect(estimateTravel(20, -1)).toBeNull();
});
it("主管匯出彙總保留總量，沒有個人欄位與活動標題", () => {
  const events = createSeed().events;
  const table = buildDepartmentBiTable(events);
  expect(table.headers).not.toContain("employee_id");
  expect(table.headers).not.toContain("employee_name");
  expect(table.headers).not.toContain("activity");
  expect(table.rows.reduce((a, row) => a + Number(row[2]), 0)).toBeCloseTo(
    events.reduce((a, e) => a + e.emission, 0),
  );
});
it("主管回答不附個人證據，最新資料以日期彙總", () => {
  const events = createSeed().events;
  for (const q of [0, 1, 2])
    expect(supervisorAnswer(q, events, "全公司").eventIds).toEqual([]);
  expect(supervisorAnswer(2, events, "全公司").heading).toContain("部門彙總");
});

it("不同部門期間的來源觀察有獨立處理註記，共用設備仍是同一個項目", () => {
  const s = createSeed();
  const a = workspaceAlerts(s.devices, s.events, "全公司:month");
  const b = workspaceAlerts(s.devices, s.events, "產品:week");
  expect(a.find((x) => x.kind === "source")!.id).not.toBe(
    b.find((x) => x.kind === "source")!.id,
  );
  expect(a.find((x) => x.kind === "device")!.id).toBe(
    b.find((x) => x.kind === "device")!.id,
  );
});
