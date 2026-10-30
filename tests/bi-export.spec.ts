import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
test("Power BI 下載使用目前篩選快照並保留數值", async ({ page }) => {
  await page.goto("/admin/analytics");
  await page.getByLabel("部門篩選", { exact: true }).selectOption("產品設計部");
  await page.getByLabel("日期範圍").selectOption("week");
  const current = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("eco-sensing-demo-v1")!),
  );
  const scoped = current.events.filter(
    (e: any) => e.department === "產品設計部" && e.date >= "2026-10-24",
  );
  const ready = page.waitForEvent("download");
  await page.getByRole("button", { name: "下載目前篩選事件 CSV" }).click();
  const file = await ready;
  expect(file.suggestedFilename()).toBe("EcoEvents.csv");
  const csv = await fs.readFile((await file.path())!, "utf8");
  expect(csv).toContain("emission_kg_co2e");
  expect(csv).toContain("avoided_kg_co2e");
  expect(csv.split("\r\n").filter(Boolean)).toHaveLength(scoped.length + 1);
  expect(csv).not.toContain("工程研發部");
  expect(csv).toContain(String(scoped[0].emission));
  const excel = page.waitForEvent("download");
  await page.getByRole("link", { name: "下載初始 Excel" }).click();
  const x = await excel;
  const bytes = await fs.readFile((await x.path())!);
  expect(bytes.subarray(0, 2).toString()).toBe("PK");
});
test("報表網址可設定、重整保留並直接開啟，不接受任意網站", async ({ page }) => {
  await page.goto("/admin/analytics");
  await page.getByText("匯入步驟與報表網址設定", { exact: true }).click();
  await page.getByLabel("Power BI 報表網址").fill("https://example.com");
  await page.getByRole("button", { name: "儲存報表網址" }).click();
  await expect(page.getByRole("alert")).toContainText("app.powerbi.com");
  const url =
    "https://app.powerbi.com/groups/me/reports/example-report/ReportSection";
  await page.getByLabel("Power BI 報表網址").fill(url);
  await page.getByRole("button", { name: "儲存報表網址" }).click();
  await expect(
    page.getByRole("link", { name: "開啟已設定的 Power BI 報表" }),
  ).toHaveAttribute("href", url);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "開啟已設定的 Power BI 報表" }),
  ).toHaveAttribute("href", url);
  await page.getByText("匯入步驟與報表網址設定", { exact: true }).click();
  await page.getByRole("button", { name: "清除連結" }).click();
  await expect(
    page.getByRole("link", { name: "開啟 Power BI", exact: true }),
  ).toHaveAttribute("href", "https://app.powerbi.com/");
});
