import { test, expect } from "@playwright/test";
const key = "eco-sensing-demo-v1";
const state = (page: any) =>
  page.evaluate((k: string) => JSON.parse(localStorage.getItem(k)!), key);
test("差旅編輯、重整、跨端同步、任務防重複領獎及重設", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("link", { name: /進入員工端/ }).click();
  await expect(page).toHaveURL(/app\/home/);
  const initial = await state(page);
  await page.getByRole("link", { name: /掃描差旅憑證/ }).click();
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await expect(
    page.getByRole("heading", { name: "確認旅程資訊" }),
  ).toBeVisible();
  await page.getByLabel("終點").fill("左營");
  await page.getByLabel("估算碳排（kg CO₂e・待確認數值）").fill("8.25");
  await page.getByRole("button", { name: "確認登錄", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "旅程已記錄！" }),
  ).toBeVisible();
  const added = await state(page);
  expect(added.events.length).toBe(initial.events.length + 1);
  expect(added.events[0].emission).toBe(8.25);
  expect(added.events[0].title).toContain("左營");
  expect(added.progress.transit).toBe(1);
  await page.getByRole("link", { name: "查看碳足跡" }).click();
  await expect(page.getByText("臺灣高鐵差旅・臺北 → 左營")).toBeVisible();
  await page.reload();
  expect((await state(page)).events).toHaveLength(initial.events.length + 1);
  await page.goto("/admin/dashboard");
  await expect(page.getByText("臺灣高鐵差旅・臺北 → 左營")).toBeVisible();
  await page.goto("/app/missions");
  const mission = page
    .locator(".mission-list .panel")
    .filter({ hasText: "登錄一次大眾運輸差旅" });
  await mission.getByRole("button", { name: "領取獎勵" }).click();
  const rewarded = await state(page);
  expect(rewarded.coins).toBe(initial.coins + 80);
  expect(rewarded.exp).toBe(initial.exp + 120);
  await expect(mission.getByText("已完成並領獎")).toBeVisible();
  await expect(mission.getByRole("button", { name: "領取獎勵" })).toHaveCount(
    0,
  );
  await page.goto("/app/profile");
  await page.getByText("工作空間與資料", { exact: true }).click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "重設工作空間資料", exact: true })
    .click();
  expect((await state(page)).coins).toBe(rewarded.coins);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "重設工作空間資料", exact: true })
    .click();
  expect(await state(page)).toEqual(initial);
});
test("垃圾桶五階段、取消重試、確認後只新增一次及獎勵", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/trash-scan");
  const initial = await state(page);
  await page.getByRole("button", { name: "開始回收" }).click();
  await page.getByRole("button", { name: "取消掃描" }).click();
  expect((await state(page)).events.length).toBe(initial.events.length);
  await page.getByRole("button", { name: "開始回收" }).click();
  await expect(
    page.getByRole("heading", { name: "回收結果確認" }),
  ).toBeVisible();
  await expect(page.locator(".process-list>div")).toHaveCount(5);
  await page.getByRole("button", { name: "確認碳排入帳" }).dblclick();
  await expect(
    page.getByRole("heading", { name: "回收成功，好事發生。" }),
  ).toBeVisible();
  const next = await state(page);
  expect(next.events.length).toBe(initial.events.length + 1);
  expect(next.events[0].emission).toBe(0.12);
  expect(next.events[0].avoided).toBe(0.35);
  await page.getByRole("link", { name: "前往領取任務獎勵" }).click();
  const mission = page
    .locator(".mission-list .panel")
    .filter({ hasText: "完成一次分類回收" });
  await mission.getByRole("button", { name: "領取獎勵" }).click();
  expect((await state(page)).coins).toBe(initial.coins + 50);
});
test("上傳僅預覽、辨識取消後可重試、表單驗證", async ({ page }) => {
  await page.goto("/app/travel-scan");
  await page.locator("input[type=file]").setInputFiles({
    name: "sample.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="green"/></svg>',
    ),
  });
  await expect(page.getByText(/此圖片僅供本機預覽/)).toBeVisible();
  await page.getByRole("button", { name: "載入預設憑證資訊" }).click();
  await page.getByRole("button", { name: "取消流程" }).click();
  await page.getByRole("button", { name: "載入預設憑證資訊" }).click();
  await expect(
    page.getByRole("heading", { name: "確認旅程資訊" }),
  ).toBeVisible();
  await page.getByLabel("起點", { exact: true }).fill("");
  await page.getByRole("button", { name: "確認登錄", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});
test("企業篩選、設備事件跨端、兌換審核、報告快照與列印", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/dashboard");
  const initial = await state(page);
  const metric = page.locator(".metric-value").first();
  const all = await metric.textContent();
  await page.getByLabel("部門篩選", { exact: true }).selectOption("產品設計部");
  expect(await metric.textContent()).not.toBe(all);
  const month = await metric.textContent();
  await page.getByLabel("日期範圍").selectOption("week");
  expect(await metric.textContent()).not.toBe(month);
  await page.getByRole("link", { name: /IoT 設備/ }).click();
  await page
    .getByRole("button", { name: "接收新事件", exact: true })
    .first()
    .click();
  expect((await state(page)).events.length).toBe(initial.events.length + 1);
  await page.goto("/app/footprint?view=records");
  await expect(page.getByText("智慧垃圾桶 01・接收事件")).toBeVisible();
  await page.goto("/admin/rewards");
  await page.getByRole("button", { name: "核准", exact: true }).first().click();
  await expect(
    page.locator("td .status").filter({ hasText: "已核准" }).first(),
  ).toBeVisible();
  expect((await state(page)).redemptions[0].status).toBe("已核准");
  await page.reload();
  expect((await state(page)).redemptions[0].status).toBe("已核准");
  await page.goto("/admin/reports");
  await page.getByRole("button", { name: "生成報告" }).click();
  await expect(page.locator(".report-document")).toBeVisible();
  for (const text of ["重點發現", "改善建議", "資料範圍與限制"])
    await expect(
      page
        .locator(".report-document")
        .getByRole("heading", { name: new RegExp(text) }),
    ).toBeVisible();
  const current = await state(page);
  const total = current.events.reduce((a: any, e: any) => a + e.emission, 0);
  await expect(page.locator(".report-kpis b").first()).toHaveText(
    new Intl.NumberFormat("zh-TW", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(total),
  );
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".report-document")).toBeVisible();
  await page.pdf({
    path: "test-results/report.pdf",
    format: "A4",
    printBackground: true,
  });
});
test("全部路由與手機及桌面排版沒有橫向溢出", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/app/home",
      "/app/footprint",
      "/app/travel-scan",
      "/app/trash-scan",
      "/app/missions",
      "/app/leaderboard",
      "/app/profile",
      "/admin/dashboard",
      "/admin/analytics",
      "/admin/people",
      "/admin/devices",
      "/admin/reports",
      "/admin/rewards",
    ]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main h1").first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/admin/dashboard");
  await page.screenshot({
    path: "test-results/screenshots/admin-desktop.png",
    fullPage: true,
  });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/screenshots/entry-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/home");
  await page.screenshot({
    path: "test-results/screenshots/employee-mobile.png",
    fullPage: false,
  });
});

test("部門與設備表格保留搜尋、詳情、篩選及手機導覽", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/people");
  await expect(page.locator(".department-table tbody tr")).toHaveCount(4);
  await page.getByRole("button", { name: "查看產品設計部詳情" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/screenshots/people-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "員工名單", exact: true }).click();
  await page.getByLabel("搜尋姓名或部門").fill("林沐青");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "查看", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("產品設計部");
  await page.getByRole("button", { name: "關閉對話框" }).click();
  await page.goto("/admin/devices");
  await expect(page.locator(".device-table tbody tr")).toHaveCount(8);
  await page.getByRole("button", { name: "警告", exact: true }).click();
  await expect(page.locator(".device-table tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "全部", exact: true }).click();
  await page.screenshot({
    path: "test-results/screenshots/devices-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "設備詳情", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("DEV-1");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "開啟企業導覽" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "開啟企業導覽" }).click();
  await page.getByRole("link", { name: "ESG 報告", exact: true }).click();
  await expect(page).toHaveURL(/admin\/reports/);
  await expect(
    page.getByRole("button", { name: "開啟企業導覽" }),
  ).toHaveAttribute("aria-expanded", "false");
});
test("文件式報告設定、個人設定及更多頁面響應式", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin/reports");
  await page.getByLabel("報告月份").selectOption("2026-09");
  await page.getByLabel("部門範圍").selectOption("工程研發部");
  await page.getByLabel("報告類型").selectOption("排放來源摘要");
  await page.getByRole("button", { name: "生成報告" }).click();
  await expect(page.locator(".report-document")).toBeVisible();
  await expect(page.locator(".report-kpis b").first()).toHaveText("615.0");
  await expect(page.locator(".report-document")).toContainText("工程研發部");
  await page.locator(".toast").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "test-results/screenshots/report-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/profile");
  const toggle = page.getByRole("switch", { name: "任務提醒（本機設定）" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  for (const route of ["missions", "leaderboard", "travel-scan", "profile"]) {
    await page.goto(`/app/${route}`);
    await page.screenshot({
      path: `test-results/screenshots/${route}-mobile.png`,
      fullPage: false,
    });
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/app/home",
      "/app/footprint",
      "/app/missions",
      "/app/profile",
      "/admin/dashboard",
      "/admin/devices",
      "/admin/people",
      "/admin/reports",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
});
