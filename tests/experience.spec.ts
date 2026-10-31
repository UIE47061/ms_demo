import { test, expect, type Page } from "@playwright/test";
const key = "eco-sensing-demo-v1";
const read = (page: Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
test("五段導覽使用實際共用狀態，Eco-Agent 只領獎一次且成長同步", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  const initial = await read(page);
  await page.getByRole("button", { name: "開始行動旅程" }).click();
  await expect(page).toHaveURL(/app\/trips/);
  await page.getByRole("link", { name: "登錄車票", exact: true }).click();
  await expect(page).toHaveURL(/travel-scan/);
  await expect(
    page.getByRole("complementary", { name: "行動旅程導覽" }),
  ).toBeVisible();
  expect(await read(page)).toEqual(initial);
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await expect(
    page.getByRole("heading", { name: "確認旅程資訊" }),
  ).toBeVisible();
  await page.getByText("AI 處理流程與資料來源", { exact: true }).click();
  await page.getByText("查看資料來源", { exact: false }).first().click();
  await expect(
    page
      .locator(".dataset-note")
      .getByText("Eco-Sensing 資料集 · v1 · 2026/10/27"),
  ).toBeVisible();
  await page.getByRole("button", { name: "確認登錄", exact: true }).click();
  await page.getByRole("button", { name: "下一段", exact: true }).click();
  await expect(page).toHaveURL(/trash-scan/);
  await page.getByRole("button", { name: "開始回收" }).click();
  await expect(
    page.getByRole("heading", { name: "回收結果確認" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "確認碳排入帳" }).click();
  await page.getByRole("button", { name: "下一段", exact: true }).click();
  await expect(page).toHaveURL(/\/agent/);
  await page.getByRole("button", { name: "一鍵休眠" }).click();
  const rewarded = await read(page);
  expect(rewarded.events.length).toBe(initial.events.length + 2);
  expect(rewarded.coins).toBe(initial.coins + 40);
  expect(rewarded.exp).toBe(initial.exp + 60);
  await expect(
    page.getByRole("button", { name: "本任務獎勵已領取" }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "本任務獎勵已領取" }),
  ).toBeDisabled();
  expect((await read(page)).coins).toBe(initial.coins + 40);
  await page.getByRole("button", { name: "下一段", exact: true }).click();
  await expect(page).toHaveURL(/admin\/analytics/);
  await page.getByRole("button", { name: "哪個來源占比最高？" }).click();
  await expect(page.locator(".data-agent .answer-source")).toContainText(
    `${initial.events.length + 2} 筆活動紀錄`,
  );
  await page.getByRole("button", { name: "完成旅程", exact: true }).click();
  await expect(page.locator(".tour-bar")).toHaveCount(0);
  await page.goto("/app/home");
  await expect(page.getByTestId("growth-leaves")).toHaveText(
    "1 / 6 片行動新葉",
  );
  await page.goto("/app/missions");
  await expect(page.getByTestId("boss-hp")).toHaveText("83 / 100");
});
test("導覽可退回與略過，暫緩不發獎，重設清除呈現狀態", async ({ page }) => {
  await page.goto("/demo");
  const initial = await read(page);
  await page.getByRole("button", { name: "開始行動旅程" }).click();
  await page.getByRole("button", { name: "下一段", exact: true }).click();
  await page.getByRole("button", { name: "上一段" }).click();
  await expect(page).toHaveURL(/app\/trips/);
  await page.getByRole("button", { name: "略過", exact: true }).click();
  await expect(page).toHaveURL(/travel-scan/);
  await page.getByRole("button", { name: "下一段", exact: true }).click();
  await expect(page).toHaveURL(/trash-scan/);
  await page.getByRole("button", { name: "下一段", exact: true }).click();
  await page.getByRole("button", { name: "我還要用", exact: true }).click();
  expect(await read(page)).toEqual(initial);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "等你方便時，再休息一下。" }),
  ).toBeVisible();
  await expect(page.locator(".tour-bar")).toBeVisible();
  await page.goto("/app/profile");
  await page.getByText("工作空間與資料", { exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "重設工作空間資料", exact: true })
    .click();
  await page.goto("/agent");
  await expect(page.locator(".tour-bar")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "午休了，讓螢幕也休息一下。" }),
  ).toBeVisible();
  expect(await read(page)).toEqual(initial);
  await page.goto("/demo");
  await page.getByRole("button", { name: "開始行動旅程" }).click();
  await page.getByRole("button", { name: "退出導覽" }).click();
  await expect(page.locator(".tour-bar")).toHaveCount(0);
  expect(await read(page)).toEqual(initial);
});
test("主管問答隨篩選更新，來源與自訂欄位皆有預設界線", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/analytics");
  await page.getByLabel("檢視身分").selectOption("administrator");
  const initial = await read(page);
  await page.getByLabel("部門篩選", { exact: true }).selectOption("工程研發部");
  await page.getByLabel("日期範圍").selectOption("week");
  const events = initial.events.filter(
    (e: any) => e.department === "工程研發部" && e.date >= "2026-10-24",
  );
  await expect(page.locator(".data-agent .answer-source")).toContainText(
    `工程研發部 · 2026/10/24–10/27 · ${events.length} 筆`,
  );
  await expect(page.locator(".data-agent h3")).toContainText("工程研發");
  await page.getByRole("button", { name: "最新事件貢獻多少排放？" }).click();
  const latest = events.sort((a: any, b: any) =>
    b.date.localeCompare(a.date),
  )[0];
  await expect(page.locator(".data-agent h3")).toHaveText(latest.title);
  await page.goto("/admin/integrations");
  await page.getByRole("button", { name: /身分與權限/ }).click();
  await expect(page.locator(".service-detail")).toContainText(
    "沒有登入或真實身分驗證",
  );
  await page.getByRole("button", { name: /憑證結構化/ }).click();
  await expect(page.locator(".service-detail")).toContainText(
    "選取的圖片不會用於解析",
  );
  await page.goto("/app/travel-scan");
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await page.getByLabel("終點").fill("左營");
  await expect(page.locator(".manual-state")).toContainText("人工修改");
  await page.getByText("AI 處理流程與資料來源", { exact: true }).click();
  await page.locator(".dataset-note summary").click();
  await expect(page.locator(".dataset-note")).toContainText(
    "不宣稱經過 AI 或官方驗證",
  );
});
test("新版入口、App、Microsoft 與導覽在四種寬度正常顯示", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/demo",
      "/app/assistant",
      "/admin/integrations",
      "/admin/analytics",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1").first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, name] of [
    ["/", "entry-desktop"],
    ["/demo", "demo-desktop"],
    ["/admin/dashboard", "admin-desktop"],
    ["/admin/integrations", "integrations-desktop"],
    ["/admin/analytics", "analytics-desktop"],
  ]) {
    await page.goto(route);
    await page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, name] of [
    ["/app/home", "employee-mobile"],
    ["/app/missions", "missions-mobile"],
    ["/app/assistant", "assistant-mobile"],
  ]) {
    await page.goto(route);
    await page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }
  await page.goto("/demo");
  await page.getByRole("button", { name: "開始行動旅程" }).click();
  await page.getByRole("link", { name: "登錄車票", exact: true }).click();
  const cta = await page.locator(".scan-primary").boundingBox();
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  const tour = await page.locator(".tour-bar").boundingBox();
  expect(cta!.y + cta!.height).toBeLessThanOrEqual(844);
  expect(cta!.y).toBeGreaterThan(tour!.y + tour!.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/screenshots/tour-mobile.png" });
  expect(errors).toEqual([]);
});

test("在掃描結果重設時，也清除頁面暫存步驟", async ({ page }) => {
  await page.goto("/app/travel-scan");
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await expect(
    page.getByRole("heading", { name: "確認旅程資訊" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "確認登錄", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "旅程已記錄！" }),
  ).toBeVisible();
  await page.goto("/app/profile");
  await page.getByText("工作空間與資料", { exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "重設工作空間資料", exact: true })
    .click();
  await page.goto("/app/travel-scan");
  await expect(
    page.getByRole("button", { name: "讀取憑證資訊" }),
  ).toBeVisible();
  expect((await read(page)).events).toHaveLength(56);
});
