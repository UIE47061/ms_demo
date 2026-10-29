import { test, expect, type Page } from "@playwright/test";
const storageKey = "eco-sensing-demo-v1";
const read = (page: Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), storageKey);

test("首頁的兩個記錄入口在首屏，四項導覽可到達排行與成長", async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/app/home");
    await expect(page.locator(".bottom-nav > a")).toHaveCount(4);
    for (const name of ["掃描垃圾桶 QR", "掃描差旅憑證"]) {
      const action = page.getByRole("link", { name, exact: true });
      const box = await action.boundingBox();
      const nav = await page.locator(".bottom-nav").boundingBox();
      expect(box!.y + box!.height).toBeLessThan(nav!.y);
    }
    await expect(
      page.locator(".home-focused .chart-panel, .home-focused .event-list"),
    ).toHaveCount(0);
  }
  await page.getByRole("link", { name: "任務", exact: true }).click();
  await expect(page.locator(".boss-challenge")).toBeVisible();
  const challenge = await page.locator(".boss-challenge").boundingBox();
  const filters = await page.locator(".filter-chips").boundingBox();
  expect(challenge!.y + challenge!.height).toBeLessThan(filters!.y);
  await expect(page.locator("details:has(.boss-challenge)")).toHaveCount(0);
  await page.getByRole("link", { name: "查看排行榜" }).click();
  await expect(page).toHaveURL(/leaderboard/);
  await expect(page.locator('.bottom-nav a[href="/app/missions"]')).toHaveClass(
    /active/,
  );
  await page.getByRole("link", { name: "返回任務" }).click();
  await page.getByRole("link", { name: "成長與成就" }).click();
  await expect(page.getByTestId("growth-leaves")).toBeVisible();
  await expect(page.locator(".profile-stats > div")).toHaveCount(3);
  await expect(page.locator(".profile-growth .plant-art")).toBeVisible();
  await expect(page.getByText("綠色初心者", { exact: true })).toBeVisible();
});

test("差旅直接操作、草稿恢復與放棄、原地領獎不重複發放", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/missions");
  const initial = await read(page);
  const mission = page
    .locator(".mission-list .panel")
    .filter({ hasText: "登錄一次大眾運輸差旅" });
  await mission.getByRole("link", { name: "去登錄" }).click();
  await expect(page.locator(".bottom-nav")).toHaveCount(0);
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await page.getByLabel("終點", { exact: true }).fill("左營");
  await page.getByRole("button", { name: "關閉登錄" }).click();
  await page.getByRole("button", { name: "保留並離開" }).click();
  await page.getByRole("link", { name: "掃描差旅憑證", exact: true }).click();
  await expect(page.getByLabel("終點", { exact: true })).toHaveValue("左營");
  await page.getByRole("button", { name: "關閉登錄" }).click();
  await page.getByRole("button", { name: "放棄並離開" }).click();
  await page.getByRole("link", { name: "掃描差旅憑證", exact: true }).click();
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await expect(page.getByLabel("終點", { exact: true })).toHaveValue("臺中");
  await page.screenshot({
    path: "test-results/screenshots/ux-travel-confirm-mobile.png",
  });
  await page.getByRole("button", { name: "確認登錄", exact: true }).click();
  await page.screenshot({
    path: "test-results/screenshots/ux-travel-success-mobile.png",
  });
  await page
    .getByRole("button", { name: "領取 80 碳幣", exact: true })
    .dblclick();
  await expect(page.locator(".inline-reward")).toContainText(
    "本任務獎勵已領取",
  );
  await expect(page).toHaveURL(/travel-scan$/);
  await expect(page.locator(".inline-reward button")).toBeDisabled();
  const rewarded = await read(page);
  expect(rewarded.events).toHaveLength(initial.events.length + 1);
  expect(rewarded.coins).toBe(initial.coins + 80);
  expect(
    rewarded.claimed.filter((id: string) => id === "transit"),
  ).toHaveLength(1);
  await page.goto("/app/missions");
  await expect(mission.getByText("已完成並領獎")).toBeVisible();
  await expect(page.getByTestId("boss-hp")).toHaveText("83 / 100");
});

test("回收草稿重整後可確認，完成畫面領獎與任務頁共用狀態", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/trash-scan");
  const initial = await read(page);
  await page.getByRole("button", { name: "開始回收", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "回收結果確認" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "關閉登錄" }).click();
  await page.getByRole("button", { name: "保留並離開" }).click();
  await page.getByRole("link", { name: "掃描垃圾桶 QR", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "回收結果確認" }),
  ).toBeVisible();
  expect((await read(page)).events).toHaveLength(initial.events.length);
  await page.getByRole("button", { name: "確認碳排入帳" }).dblclick();
  await page
    .getByRole("button", { name: "領取 50 碳幣", exact: true })
    .dblclick();
  await expect(page.locator(".inline-reward")).toContainText(
    "本任務獎勵已領取",
  );
  await expect(page).toHaveURL(/trash-scan$/);
  await expect(page.locator(".inline-reward button")).toBeDisabled();
  expect((await read(page)).coins).toBe(initial.coins + 50);
  expect((await read(page)).events).toHaveLength(initial.events.length + 1);
  await page.locator(".toast").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "test-results/screenshots/ux-recycle-success-mobile.png",
  });
  await page.goto("/app/missions");
  const task = page
    .locator(".mission-list .panel")
    .filter({ hasText: "完成一次分類回收" });
  await expect(task.getByRole("button", { name: "領取獎勵" })).toHaveCount(0);
  await expect(task.getByText("已完成並領獎")).toBeVisible();
});

test("足跡篩選同時套用總覽與分日紀錄，可開啟活動詳情", async ({ page }) => {
  await page.goto("/app/footprint");
  const initial = await read(page);
  await page.getByLabel("來源分類").selectOption("digital");
  await page.getByLabel("足跡期間").selectOption("week");
  const expected = initial.events.filter(
    (e: any) =>
      e.employeeId === "e01" &&
      e.source === "digital" &&
      e.date >= "2026-10-24",
  );
  await page.getByRole("button", { name: "紀錄", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "紀錄", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("來源分類")).toHaveValue("digital");
  await expect(page.getByLabel("足跡期間")).toHaveValue("week");
  const records = page.locator(".record-button");
  await expect(records).toHaveCount(expected.length);
  await records.first().click();
  await expect(page.getByRole("dialog")).toContainText("數位能耗");
  await expect(page.getByRole("dialog")).toContainText("估算排放");
  await page.getByRole("button", { name: "關閉對話框" }).click();
  await page.getByRole("button", { name: "總覽", exact: true }).click();
  await expect(page.locator(".footprint-total")).toContainText("數位能耗");
  await expect(page.locator(".large-number")).toContainText(
    new Intl.NumberFormat("zh-TW", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(
      expected.reduce((total: number, e: any) => total + e.emission, 0),
    ),
  );
  await expect(page.locator(".record-groups")).toHaveCount(0);
});

test("小幫手先選問題再回答，設定影響首頁，重設清除草稿", async ({ page }) => {
  await page.goto("/app/assistant");
  await page.getByRole("button", { name: "問答", exact: true }).click();
  await expect(page.locator(".personal-agent .agent-answer")).toHaveCount(0);
  await page.locator(".personal-question-list button").first().click();
  await expect(page.locator(".personal-agent h3")).toBeVisible();
  await page.goto("/app/profile");
  await page.getByRole("switch", { name: "顯示每日摘要（本機設定）" }).click();
  await page.getByRole("switch", { name: "任務提醒（本機設定）" }).click();
  await page.goto("/app/home");
  await expect(page.locator(".home-footprint, .home-reminder")).toHaveCount(0);
  await page.goto("/app/travel-scan");
  await page.getByRole("button", { name: "讀取憑證資訊" }).click();
  await page.getByLabel("終點", { exact: true }).fill("左營");
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
  await expect(page.locator(".draft-notice")).toHaveCount(0);
});

test("所有員工頁面及展開內容於四種寬度沒有溢出，固定操作不遮擋底部內容", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "home",
      "footprint",
      "missions",
      "leaderboard",
      "profile",
      "assistant",
      "travel-scan",
      "trash-scan",
    ]) {
      await page.goto(`/app/${route}`);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}`,
      ).toBe(true);
      if (route === "travel-scan" || route === "trash-scan") {
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight),
        );
        const primary = await page.locator(".scan-primary").boundingBox();
        const lastContent = await page
          .locator(route === "travel-scan" ? ".scan-alternatives" : ".qr-stage")
          .boundingBox();
        expect(primary!.y + primary!.height).toBeLessThanOrEqual(844);
        expect(lastContent!.y + lastContent!.height).toBeLessThan(primary!.y);
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      if (width === 390)
        await page.screenshot({
          path: `test-results/screenshots/ux-${route}-mobile.png`,
        });
    }
  }
  expect(errors).toEqual([]);
});
