import { describe, expect, it } from "vitest";
import { createSeed, employees, missions } from "../data/seed";
import { addEvent, claimReward } from "../store/demo";
import { categories, selectEvents, sum } from "./stats";
import type { CarbonEvent } from "../types";
const event: CarbonEvent = {
  id: "test-event",
  employeeId: "e01",
  department: "產品設計部",
  source: "travel",
  title: "臺灣高鐵差旅",
  date: "2026-10-27T14:30:00",
  emission: 5.8,
  avoided: 0,
  mock: true,
  detail: "測試",
};
describe("共用工作空間資料與聚合", () => {
  it("符合固定種子資料量與所有來源覆蓋", () => {
    const s = createSeed();
    expect(s.events.length).toBeGreaterThanOrEqual(20);
    expect(employees).toHaveLength(12);
    expect(new Set(employees.map((e) => e.department)).size).toBe(4);
    expect(new Set(s.events.map((e) => e.source)).size).toBe(4);
    expect(new Set(s.events.map((e) => e.date.slice(0, 10))).size).toBe(7);
    expect(s.devices).toHaveLength(8);
    expect(s.redemptions).toHaveLength(3);
    expect(missions).toHaveLength(6);
  });
  it("單一事件同步個人與企業加總，重複提交不入帳", () => {
    const s = createSeed(),
      next = addEvent(s, event);
    expect(sum(next.events) - sum(s.events)).toBeCloseTo(5.8);
    expect(
      sum(next.events.filter((e) => e.employeeId === "e01")) -
        sum(s.events.filter((e) => e.employeeId === "e01")),
    ).toBeCloseTo(5.8);
    expect(addEvent(next, event)).toBe(next);
    expect(next.progress.transit).toBe(1);
  });
  it("獎勵需達標且僅可領取一次，排放不受影響", () => {
    const s = createSeed();
    expect(claimReward(s, "transit")).toBe(s);
    const registered = addEvent(s, event);
    const next = claimReward(registered, "transit");
    expect(next.coins).toBe(s.coins + 80);
    expect(next.exp).toBe(s.exp + 120);
    expect(next.events).toBe(registered.events);
    expect(claimReward(next, "transit")).toBe(next);
  });
  it("非大眾運輸差旅不推進大眾運輸任務", () => {
    expect(
      addEvent(createSeed(), { ...event, title: "計程車差旅" }).progress
        .transit,
    ).toBe(0);
  });
  it("避免排放獨立統計，分類總和與排放總計一致", () => {
    const s = createSeed();
    const totals = categories(s.events);
    expect(totals.reduce((a, c) => a + c.value, 0)).toBeCloseTo(sum(s.events));
    const next = addEvent(s, {
      ...event,
      source: "waste",
      emission: 0.12,
      avoided: 0.35,
    });
    expect(sum(next.events) - sum(s.events)).toBeCloseTo(0.12);
    expect(sum(next.events, "avoided") - sum(s.events, "avoided")).toBeCloseTo(
      0.35,
    );
  });
  it("日期與部門篩選不改動原始資料，重設還原一致初始值", () => {
    const s = createSeed();
    const scoped = selectEvents(s.events, "產品設計部", "week");
    expect(
      scoped.every(
        (e) => e.department === "產品設計部" && e.date >= "2026-10-24",
      ),
    ).toBe(true);
    expect(scoped.length).toBeLessThan(s.events.length);
    expect(createSeed()).toEqual(s);
  });
});
