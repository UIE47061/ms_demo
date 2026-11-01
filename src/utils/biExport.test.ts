import { describe, expect, it } from "vitest";
import { createSeed } from "../data/seed";
import {
  buildBiTables,
  biCsv,
  powerBiEmbedUrl,
  powerBiOpenUrl,
  validatePowerBiReportUrl,
} from "./biExport";
import { selectEvents, sum } from "./stats";
describe("Power BI 與 Fabric 資料交換", () => {
  it("保留原始事件與數值，月度與歷史分層不重複入帳", () => {
    const state = createSeed();
    const tables = buildBiTables(state.events);
    expect(tables.events.rows).toHaveLength(56);
    expect(tables.monthly.rows).toHaveLength(24);
    expect(
      tables.events.rows.reduce((n, r) => n + Number(r[10]), 0),
    ).toBeCloseTo(sum(state.events));
    expect(
      tables.monthly.rows
        .filter((r) => r[5] === "current_events")
        .reduce((n, r) => n + Number(r[3]), 0),
    ).toBeCloseTo(sum(state.events));
    expect(
      tables.monthly.rows
        .filter((r) => r[5] === "history_summary")
        .every((r) => r[4] === null),
    ).toBe(true);
    expect(state).toEqual(createSeed());
  });
  it("事件匯出遵循篩選，新增與修改後的值可完整輸出", () => {
    const events = selectEvents(createSeed().events, "產品設計部", "week");
    const table = buildBiTables(events).events;
    expect(table.rows).toHaveLength(events.length);
    expect(table.rows.every((r) => r[6] === "產品設計部")).toBe(true);
    const added = {
      ...events[0],
      id: "new",
      emission: 8.25,
      title: "高鐵差旅「確認」",
    };
    expect(buildBiTables([added, ...events]).events.rows[0]).toContain(8.25);
    expect(table.headers).toContain("avoided_kg_co2e");
  });
  it("CSV 保留 UTF-8、引號、換行與數值型別，公式樣式文字安全轉義", () => {
    const csv = biCsv({
      name: "T",
      headers: ["name", "value", "empty"],
      rows: [
        ['臺北,"車票"\n第二行', 8.25, null],
        ["=1+1", 0, true],
      ],
    });
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"臺北,""車票""\n第二行",8.25,');
    expect(csv).toContain('"\'=1+1",0,true');
    expect(() =>
      biCsv({ name: "T", headers: ["value"], rows: [[Infinity]] }),
    ).toThrow();
  });
  it("只接受 Microsoft Power BI 的 HTTPS 報表網址", () => {
    expect(
      validatePowerBiReportUrl(
        "https://app.powerbi.com/groups/me/reports/example/ReportSection",
      ),
    ).toBeTruthy();
    expect(
      validatePowerBiReportUrl(
        "https://app.powerbi.com/reportEmbed?reportId=example",
      ),
    ).toBeTruthy();
    for (const u of [
      "javascript:alert(1)",
      "https://example.com",
      "https://app.powerbi.com.evil.test/groups/me/reports/a",
      "https://user:pw@app.powerbi.com/groups/me/reports/a",
      "http://app.powerbi.com/groups/me/reports/a",
      "https://app.powerbi.com/view?r=public",
      "https://app.powerbi.com/reportEmbed",
    ])
      expect(validatePowerBiReportUrl(u)).toBeNull();
  });
});

describe("Power BI 安全內嵌網址", () => {
  const report = "11111111-2222-3333-4444-555555555555";
  const group = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  it("另開登入使用完整服務網址，保留報表、租用戶與頁面，不沿用 embed 登入框", () => {
    expect(
      powerBiOpenUrl(
        `https://app.powerbi.com/reportEmbed?reportId=${report}&groupId=${group}&ctid=${group}&pageName=ReportSection&autoAuth=true`,
      ),
    ).toBe(
      `https://app.powerbi.com/groups/${group}/reports/${report}/ReportSection?ctid=${group}`,
    );
    expect(
      powerBiOpenUrl(`https://app.powerbi.com/reportEmbed?reportId=${report}`),
    ).toBe(`https://app.powerbi.com/groups/me/reports/${report}`);
    const normal = `https://app.powerbi.com/groups/${group}/reports/${report}/ReportSection?experience=power-bi`;
    expect(powerBiOpenUrl(normal)).toBe(normal);
    expect(
      powerBiOpenUrl("https://example.com/reportEmbed?reportId=" + report),
    ).toBeNull();
    expect(
      powerBiOpenUrl("https://app.powerbi.com/reportEmbed?reportId=invalid"),
    ).toBe("https://app.powerbi.com/");
  });
  it("從報表路徑保留識別碼、工作區、頁面與租用戶，但不轉送其他參數", () => {
    const result = new URL(
      powerBiEmbedUrl(
        `https://app.powerbi.com/groups/${group}/reports/${report}/ReportSection02?ctid=${group}&token=secret&filter=x`,
      )!,
    );
    expect(result.origin + result.pathname).toBe(
      "https://app.powerbi.com/reportEmbed",
    );
    expect(Object.fromEntries(result.searchParams)).toEqual({
      reportId: report,
      autoAuth: "true",
      groupId: group,
      ctid: group,
      pageName: "ReportSection02",
    });
  });
  it("支援我的工作區與 secure embed，拒絕非報表或無效識別碼", () => {
    expect(
      new URL(
        powerBiEmbedUrl(`https://app.powerbi.com/groups/me/reports/${report}`)!,
      ).searchParams.has("groupId"),
    ).toBe(false);
    expect(
      new URL(
        powerBiEmbedUrl(
          `https://app.powerbi.com/reportEmbed?reportId=${report}&groupId=${group}`,
        )!,
      ).searchParams.get("groupId"),
    ).toBe(group);
    for (const value of [
      "https://example.com/reportEmbed?reportId=" + report,
      "https://app.powerbi.com/groups/me/reports/not-a-guid",
      "https://app.powerbi.com/view?r=public",
      "javascript:alert(1)",
    ])
      expect(powerBiEmbedUrl(value)).toBeNull();
  });
});
