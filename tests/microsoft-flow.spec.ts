import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
const stateKey = "eco-sensing-demo-v1";
const read = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), stateKey);

test("Outlook 待辦可排除、恢復，未登錄前不增加事件與獎勵", async ({ page }) => {
  await page.goto("/app/home");
  const initial = await read(page);
  await expect(
    page.getByRole("region", { name: "Outlook 出差待辦" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "不是出差", exact: true }).click();
  expect(await read(page)).toEqual(initial);
  await page.goto("/app/trips");
  await expect(page.getByText("非出差行程", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "恢復出差待辦" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "恢復出差待辦" }).click();
  await expect(
    page.getByRole("link", { name: "登錄車票", exact: true }),
  ).toBeVisible();
  expect(await read(page)).toEqual(initial);
});

test("Outlook 連到車票，事實修改會重算唯讀結果，行程只登錄一次", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/trips");
  const initial = await read(page);
  await page.getByRole("link", { name: "登錄車票", exact: true }).click();
  await expect(page.locator(".calendar-context")).toContainText("Outlook");
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await expect(page.getByTestId("travel-emission")).toHaveText("5.80");
  await page.screenshot({
    path: "test-results/screenshots/ms-travel-confirm-mobile.png",
    fullPage: false,
  });
  await expect(page.getByLabel("估算碳排（kg CO₂e・待確認數值）")).toHaveCount(
    0,
  );
  await page.getByText("調整票價、里程與估算比例", { exact: true }).click();
  await page.getByLabel("里程（km）", { exact: true }).fill("235");
  await expect(page.getByTestId("travel-emission")).toHaveText("8.26");
  await page.getByRole("button", { name: "確認登錄", exact: true }).click();
  await expect(page.getByText("已人工確認", { exact: true })).toBeVisible();
  const next = await read(page);
  expect(next.events).toHaveLength(initial.events.length + 1);
  expect(next.events[0].emission).toBe(8.26);
  expect(next.events[0].detail).toContain("Eco-Sensing v1");
  await page.goto("/app/trips");
  await page.reload();
  await expect(page.getByText("已登錄", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "登錄車票", exact: true }),
  ).toHaveCount(0);
  await page.goto("/app/travel-scan?trip=outlook-trip-001");
  await expect(page.getByRole("button", { name: "讀取憑證資訊" })).toHaveCount(
    0,
  );
  expect((await read(page)).events).toHaveLength(initial.events.length + 1);
});

test("Eco 小幫手與桌面提醒分工，休眠只領一次並同步 App", async ({ page }) => {
  await page.goto("/app/assistant");
  const initial = await read(page);
  await expect(page.locator("main")).not.toContainText("Teams");
  await expect(page.locator(".teams-window")).toHaveCount(0);
  await page.locator(".personal-question-list button").first().click();
  await expect(page.locator(".personal-agent .agent-answer")).toBeVisible();
  await page.getByRole("link", { name: /Eco-Agent 桌面提醒/ }).click();
  await expect(page).toHaveURL(/\/agent$/);
  await page.getByRole("button", { name: "我還要用", exact: true }).click();
  expect(await read(page)).toEqual(initial);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "等你方便時，再休息一下。" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "一鍵休眠" }).dblclick();
  await expect(
    page.getByRole("button", { name: "本任務獎勵已領取" }),
  ).toBeDisabled();
  await page.reload();
  expect((await read(page)).coins).toBe(initial.coins + 40);
  expect((await read(page)).events).toHaveLength(initial.events.length);
  await page.getByRole("link", { name: "回到員工 App" }).click();
  await expect(page.locator(".agent-shortcut")).toContainText("節能任務已完成");
  await page.goto("/app/missions");
  await expect(page.getByTestId("boss-hp")).toHaveText("83 / 100");
});

test("主管預設只有彙總，匯出無姓名，切換管理員可保留完整功能", async ({
  page,
}) => {
  await page.goto("/admin/dashboard");
  await expect(page.getByLabel("檢視身分")).toHaveValue("manager");
  await expect(page.locator("main .events-panel")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("林沐青");
  await page.goto("/admin/people");
  await expect(
    page.getByRole("button", { name: "員工名單", exact: true }),
  ).toHaveCount(0);
  await page.goto("/admin/analytics");
  await page.getByLabel("部門篩選", { exact: true }).selectOption("產品設計部");
  await page.getByRole("button", { name: "最近一天排放多少？" }).click();
  await expect(page.locator(".data-agent .answer-evidence")).toHaveCount(0);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "下載部門彙總 CSV", exact: true })
    .click();
  const file = await download;
  const csv = await fs.readFile((await file.path())!, "utf8");
  expect(csv).not.toContain("employee_name");
  expect(csv).not.toContain("employee_id");
  expect(csv).not.toContain("林沐青");
  expect(csv).not.toContain("工程研發部");
  expect(csv).toContain("產品設計部");
  await expect(
    page.getByRole("link", { name: "下載初始 Excel", exact: true }),
  ).toHaveCount(0);
  await page.goto("/admin/devices");
  await expect(
    page.getByRole("heading", { name: "切換管理員視角" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "切換為管理員" }).click();
  await expect(page.locator(".device-table tbody tr")).toHaveCount(8);
  await page.goto("/admin/people");
  await page.getByRole("button", { name: "員工名單", exact: true }).click();
  await page.getByLabel("搜尋姓名或部門").fill("林沐青");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "查看", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("林沐青");
  await page.getByRole("button", { name: "關閉對話框" }).click();
  await page.getByLabel("檢視身分").selectOption("manager");
  await expect(page.locator("body")).not.toContainText("林沐青");
  await expect(
    page.getByRole("button", { name: "員工名單", exact: true }),
  ).toHaveCount(0);
});

test("異常處理與通知偏好會保存，不改動設備與排放；重設恢復新狀態", async ({
  page,
}) => {
  await page.goto("/admin/alerts");
  const initial = await read(page);
  await page.getByLabel("部門篩選", { exact: true }).selectOption("產品設計部");
  await page.getByLabel("日期範圍").selectOption("week");
  await expect(page.locator(".alert-detail")).toContainText("10/24–10/27");
  await page.getByRole("button", { name: "標記已處理", exact: true }).click();
  await page.getByLabel("主管通知通路").selectOption("teams");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "重新開啟", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("主管通知通路")).toHaveValue("teams");
  expect(await read(page)).toEqual(initial);
  await page.getByLabel("檢視身分").selectOption("administrator");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "重設資料", exact: true }).click();
  await expect(page.getByLabel("檢視身分")).toHaveValue("manager");
  await expect(page.getByLabel("主管通知通路")).toHaveValue("email");
  await expect(
    page.getByRole("button", { name: "標記已處理", exact: true }),
  ).toBeVisible();
  await page.goto("/app/trips");
  await expect(
    page.getByRole("link", { name: "登錄車票", exact: true }),
  ).toBeVisible();
});

test("新流程各頁面於四種寬度沒有溢出，主要頁面保存截圖", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/guide",
      "/app/home",
      "/app/trips",
      "/app/assistant",
      "/agent",
      "/admin/analytics",
      "/admin/alerts",
      "/admin/people",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1").first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}`,
      ).toBe(true);
      if (
        width === 390 &&
        ["/app/home", "/app/trips", "/app/assistant"].includes(route)
      )
        await page.screenshot({
          path: `test-results/screenshots/ms-${route.split("/").pop()}-mobile.png`,
        });
      if (
        width === 1440 &&
        ["/agent", "/admin/analytics", "/admin/alerts"].includes(route)
      )
        await page.screenshot({
          path: `test-results/screenshots/ms-${route.split("/").pop()}-desktop.png`,
          fullPage: true,
        });
    }
  }
  expect(errors).toEqual([]);
});
