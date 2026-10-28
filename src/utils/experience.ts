import { CURRENT_USER, missions, sourceMeta } from "../data/seed";
import { claimReward } from "../store/demo";
import type { CarbonEvent, DemoState } from "../types";
import { categories, departmentStats, n, selectEvents, sum } from "./stats";
export function growth(state: DemoState) {
  const claimed = missions.filter((m) => state.claimed.includes(m.id)).length;
  return {
    claimed,
    total: missions.length,
    hp: Math.round(100 * (1 - claimed / missions.length)),
    level: Math.floor(state.exp / 500) + 1,
  };
}
export function completePowerMission(state: DemoState) {
  if (state.claimed.includes("power")) return state;
  return claimReward(
    { ...state, progress: { ...state.progress, power: 1 } },
    "power",
  );
}
export interface DemoAnswer {
  heading: string;
  text: string;
  source: string;
  eventIds: string[];
}
export const personalQuestions = [
  "本週主要排放來源",
  "我還能完成哪些任務",
  "最新登錄的活動",
] as const;
export const managerQuestions = [
  "哪個部門排放最高？",
  "哪個來源占比最高？",
  "最新事件貢獻多少排放？",
] as const;
export function personalAnswer(index: number, state: DemoState): DemoAnswer {
  const events = state.events.filter((e) => e.employeeId === CURRENT_USER);
  const week = selectEvents(events, "全部部門", "week");
  const source = `林沐青 · 10/24–10/27 · ${week.length} 筆活動紀錄`;
  if (index === 0) {
    if (week.length && sum(week) === 0)
      return {
        heading: "本週估算排放為零",
        text: "目前事件的估算排放皆為 0，不判定主要排放來源。",
        source,
        eventIds: [],
      };
    const c = categories(week).sort((a, b) => b.value - a.value)[0];
    return {
      heading: week.length ? `${c.name}是本週主要來源` : "本週尚無活動",
      text: week.length
        ? `${c.name}共 ${n(c.value, 2)} kg CO₂e，占本週估算排放 ${sum(week) ? n((c.value / sum(week)) * 100) : "0.0"}%。這是來源分布，不代表相較上週增加。`
        : "新增差旅或回收事件後，就能在這裡查看。",
      source,
      eventIds: week
        .filter((e) => e.source === c.key)
        .slice(0, 3)
        .map((e) => e.id),
    };
  }
  if (index === 1) {
    const available = missions.filter((m) => !state.claimed.includes(m.id));
    return {
      heading: available.length
        ? `還有 ${available.length} 項任務可參與`
        : "本輪任務已全部完成",
      text: available.length
        ? available.map((m) => `${m.title}（${m.coins} 碳幣）`).join("；")
        : "你已領取本輪所有獎勵，可在個人頁查看成就。",
      source: "目前任務狀態 · 每項獎勵僅能領取一次",
      eventIds: [],
    };
  }
  const latest = events.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    heading: latest?.title || "尚無活動",
    text: latest
      ? `${latest.date.slice(0, 16).replace("T", " ")} · ${sourceMeta[latest.source].label} · ${n(latest.emission, 2)} kg CO₂e。`
      : "可由首頁登錄差旅或回收活動。",
    source: `個人活動紀錄 · ${events.length} 筆活動紀錄`,
    eventIds: latest ? [latest.id] : [],
  };
}
export function managerAnswer(
  index: number,
  events: CarbonEvent[],
  scope: string,
): DemoAnswer {
  const source = `${scope} · ${events.length} 筆活動紀錄 · kg CO₂e`;
  if (!events.length)
    return {
      heading: "目前範圍沒有事件",
      text: "請調整篩選範圍，或新增一筆活動紀錄。",
      source,
      eventIds: [],
    };
  if (index < 2 && sum(events) === 0)
    return {
      heading: "目前範圍估算排放為零",
      text: "目前事件的估算排放皆為 0，不判定最高部門或來源。",
      source,
      eventIds: [],
    };
  if (index === 0) {
    const groups = departmentStats(events);
    const max = Math.max(...groups.map((d) => d.value));
    const top = groups.filter((d) => d.value === max);
    return {
      heading: `${top.map((d) => d.name).join("、")}${top.length > 1 ? "並列最高" : "排放最高"}`,
      text: `估算排放 ${n(max, 2)} kg CO₂e。僅比較當前篩選範圍，不作為個人績效依據。`,
      source,
      eventIds: events
        .filter((e) =>
          top.some((d) => d.name === e.department.replace("部", "")),
        )
        .slice(0, 3)
        .map((e) => e.id),
    };
  }
  if (index === 1) {
    const groups = categories(events);
    const max = Math.max(...groups.map((c) => c.value));
    const top = groups.filter((c) => c.value === max);
    return {
      heading: `${top.map((c) => c.name).join("、")}占比最高`,
      text: `${n(max, 2)} kg CO₂e，占範圍內總排放 ${sum(events) ? n((max / sum(events)) * 100) : "0.0"}%。`,
      source,
      eventIds: events
        .filter((e) => top.some((c) => c.key === e.source))
        .slice(0, 3)
        .map((e) => e.id),
    };
  }
  const latest = events.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    heading: latest.title,
    text: `此筆事件估算排放 ${n(latest.emission, 2)} kg CO₂e，占目前總排放 ${sum(events) ? n((latest.emission / sum(events)) * 100) : "0.0"}%；避免排放另列 ${n(latest.avoided, 2)} kg CO₂e，未抵銷排放。`,
    source,
    eventIds: [latest.id],
  };
}
