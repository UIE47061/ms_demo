import { expect, test } from "@playwright/test";

test("正式產物在 repository 子路徑可導覽、重新整理及下載資料", async ({
  page,
  baseURL,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && response.url().startsWith(baseURL!))
      failures.push(response.url());
  });
  for (const path of [
    "/",
    "/guide",
    "/demo",
    "/app/home",
    "/app/footprint",
    "/app/missions",
    "/app/leaderboard",
    "/app/profile",
    "/app/travel-scan",
    "/app/trash-scan",
    "/app/assistant",
    "/app/trips",
    "/agent",
    "/admin/alerts",
    "/admin/dashboard",
    "/admin/analytics",
    "/admin/people",
    "/admin/devices",
    "/admin/reports",
    "/admin/rewards",
    "/admin/integrations",
  ]) {
    await page.goto(`${baseURL}#${path}`);
    await page.reload();
    expect(failures, `載入 ${path} 的資源與執行錯誤`).toEqual([]);
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /\bDemo\b|\bMock\b|示範|模擬|展示|示意|範例|本機|未連接/i,
    );
  }
  await page.goto(`${baseURL}#/admin/analytics`);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "主管洞察", exact: true }),
  ).toBeVisible();
  await page.getByLabel("檢視身分").selectOption("administrator");
  const workbook = page.getByRole("link", { name: "下載初始 Excel" });
  await expect(workbook).toHaveAttribute(
    "href",
    new URL("bi/Eco-Sensing-PowerBI-Seed.xlsx", baseURL).pathname,
  );
  const file = await page.request.get((await workbook.getAttribute("href"))!);
  expect(file.status()).toBe(200);
  expect((await file.body()).subarray(0, 2).toString()).toBe("PK");
  expect(failures).toEqual([]);
  await page.goto(`${baseURL}#/app/home`);
  await page
    .getByRole("link", { name: "跳至主要內容", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/#\/app\/home$/);
  await expect(page.locator("#employee-content")).toBeFocused();
});

test("場景可重播、沒有自動入帳，減少動態效果偏好會停止動畫", async ({
  page,
  baseURL,
}) => {
  await page.goto(baseURL!);
  const initial = await page.evaluate(() =>
    localStorage.getItem("eco-sensing-demo-v1"),
  );
  await page.getByRole("button", { name: "播放行動場景", exact: true }).click();
  await expect(page.locator(".office-world")).toHaveClass(/is-playing/);
  expect(
    await page.evaluate(() => localStorage.getItem("eco-sensing-demo-v1")),
  ).toBe(initial);
  await page.getByRole("button", { name: "重新播放", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".scene-train")
      .evaluateAll((els) =>
        els.every((el) => getComputedStyle(el).animationName === "none"),
      ),
  ).toBe(true);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/guide",
      "/app/home",
      "/app/assistant",
      "/app/trips",
      "/agent",
      "/admin/alerts",
      "/admin/dashboard",
    ]) {
      await page.goto(`${baseURL}#${path}`);
      await page.reload();
      await expect(page.locator("main h1").first()).toBeVisible();
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width && (r.right > innerWidth + 1 || r.left < -1);
          })
          .slice(0, 10)
          .map((el) => ({
            tag: el.tagName,
            cls: el.getAttribute("class"),
            x: el.getBoundingClientRect().x,
            w: el.getBoundingClientRect().width,
          })),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}: ${JSON.stringify(overflow)}`,
      ).toBe(true);
      if (path === "/app/home") {
        const art = await page
          .locator(".quick-scans .action-art")
          .first()
          .boundingBox();
        expect(art!.height).toBeGreaterThan(70);
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [path, name] of [
    ["/", "landing-desktop"],
    ["/admin/dashboard", "dashboard-desktop"],
    ["/admin/analytics", "analytics-desktop"],
  ]) {
    await page.goto(`${baseURL}#${path}`);
    await page.reload();
    await expect(page.locator("main h1").first()).toBeVisible();
    await page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}#/app/home`);
  await page.reload();
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.screenshot({
    path: "test-results/screenshots/app-mobile.png",
    fullPage: false,
    animations: "disabled",
  });
});
