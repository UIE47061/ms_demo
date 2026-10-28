import { describe, expect, it } from "vitest";
import { createSeed, CURRENT_USER } from "../data/seed";
import {
  completePowerMission,
  growth,
  managerAnswer,
  personalAnswer,
} from "./experience";
import { selectEvents, sum } from "./stats";
import type { CarbonEvent } from "../types";
describe("成長與 Microsoft 呈現層", () => {
  it("任務衍生葉片與魔王 HP，不新增業務資料", () => {
    const s = createSeed();
    expect(growth(s)).toEqual({ claimed: 0, total: 6, hp: 100, level: 2 });
    expect(growth({ ...s, claimed: ["power"] })).toMatchObject({
      claimed: 1,
      hp: 83,
    });
    expect(
      growth({
        ...s,
        claimed: ["transit", "recycle", "print", "power", "cloud", "stairs"],
      }),
    ).toMatchObject({ claimed: 6, hp: 0 });
    expect(
      growth({ ...s, claimed: ["unknown", "power", "power"] }),
    ).toMatchObject({ claimed: 1, hp: 83 });
  });
  it("Teams 沿用領獎規則且只發一次，不改排放事件", () => {
    const s = createSeed();
    const next = completePowerMission(s);
    expect(next.coins).toBe(s.coins + 40);
    expect(next.exp).toBe(s.exp + 60);
    expect(next.events).toBe(s.events);
    expect(next.progress.power).toBe(1);
    expect(completePowerMission(next)).toBe(next);
  });
  it("個人回答只引用本人且遵守週期範圍", () => {
    const s = createSeed();
    const answer = personalAnswer(0, s);
    expect(answer.source).toContain("10/24–10/27");
    expect(
      answer.eventIds.every((id) =>
        s.events.some(
          (e) =>
            e.id === id &&
            e.employeeId === CURRENT_USER &&
            e.date >= "2026-10-24",
        ),
      ),
    ).toBe(true);
    expect(personalAnswer(1, s).heading).toContain("6");
    expect(personalAnswer(1, completePowerMission(s)).heading).toContain("5");
  });
  it("主管回答來自目前篩選，不引用其他部門", () => {
    const s = createSeed();
    const events = selectEvents(s.events, "產品設計部", "week");
    const a = managerAnswer(0, events, "產品設計部 · 本週");
    expect(a.heading).toContain("產品設計");
    expect(a.text).toContain(
      new Intl.NumberFormat("zh-TW", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(sum(events)),
    );
    expect(a.eventIds.every((id) => events.some((e) => e.id === id))).toBe(
      true,
    );
    expect(a.source).toContain(`${events.length} 筆`);
  });
  it("空資料與並列結果不捏造勝出者或資料", () => {
    expect(managerAnswer(0, [], "全部")).toMatchObject({
      heading: "目前範圍沒有事件",
      eventIds: [],
    });
    const base = createSeed().events[0];
    const events: CarbonEvent[] = [
      { ...base, id: "a", department: "產品設計部", emission: 1 },
      { ...base, id: "b", department: "工程研發部", emission: 1 },
    ];
    expect(
      managerAnswer(
        0,
        events.map((e) => ({ ...e, emission: 0 })),
        "全部",
      ).heading,
    ).toContain("為零");
    expect(managerAnswer(0, events, "全部").heading).toContain("並列");
    expect(managerAnswer(0, events, "全部").heading).toContain("工程研發");
  });
});
