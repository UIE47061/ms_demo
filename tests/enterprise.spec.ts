import { test, expect, type Page } from "@playwright/test";

// Exercise an actual HTTPS document context while serving only local test files.
async function httpsWorkspace(page: Page, baseURL: string) {
  await page.route("https://eco-sensing.test/**", async (route) => {
    const url = new URL(route.request().url());
    const local = new URL(baseURL);
    url.protocol = local.protocol;
    url.host = local.host;
    await route.fulfill({
      response: await route.fetch({ url: url.toString() }),
    });
  });
  await page.goto("https://eco-sensing.test/admin/powerbi");
}

test("連續變更部門、日期與視角不遺失篩選", async ({ page }) => {
  await page.goto("/admin/analytics");
  await page.evaluate(() => {
    for (const [label, value] of [
      ["部門篩選", "產品設計部"],
      ["日期範圍", "week"],
    ]) {
      const select = document.querySelector<HTMLSelectElement>(
        `select[aria-label="${label}"]`,
      )!;
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    Array.from(
      document.querySelectorAll<HTMLButtonElement>(".analysis-tabs button"),
    )
      .find((button) => button.textContent === "資料問答")!
      .click();
  });
  await expect(page.getByLabel("部門篩選", { exact: true })).toHaveValue(
    "產品設計部",
  );
  await expect(page.getByLabel("日期範圍")).toHaveValue("week");
  await expect(
    page.getByRole("button", { name: "資料問答", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".analysis-scope")).toContainText(
    "產品設計部 · 2026/10/24–10/27",
  );
  await page.reload();
  await expect(page.locator(".analysis-scope")).toContainText(
    "產品設計部 · 2026/10/24–10/27",
  );
});

test("企業導覽聚焦主要工作，次要工具可用且可用鍵盤關閉", async ({ page }) => {
  await page.goto("/admin/dashboard");
  const nav = page.getByRole("navigation", { name: "企業端導覽", exact: true });
  await expect(nav.getByRole("link")).toHaveText([
    "總覽",
    "分析",
    "Power BI 報表",
    "異常追蹤",
    "ESG 報告",
  ]);
  await expect(page.locator(".sidebar")).not.toContainText(
    /Microsoft 流程|行動旅程導覽|使用說明|切換至員工端|重設資料/,
  );
  await expect(
    page.getByRole("link", { name: "部門參與", exact: true }),
  ).not.toBeVisible();
  await page.locator(".management-nav > summary").click();
  await page.getByRole("link", { name: "部門參與", exact: true }).click();
  await expect(page).toHaveURL(/admin\/people/);
  const trigger = page.getByRole("button", {
    name: "工作空間選項",
    exact: true,
  });
  await trigger.click();
  const tools = page.getByRole("group", { name: "工作空間選項", exact: true });
  await expect(tools.getByRole("link", { name: "整合架構" })).toHaveAttribute(
    "href",
    "/admin/integrations",
  );
  await expect(
    tools.getByRole("link", { name: "切換至員工端" }),
  ).toHaveAttribute("href", "/app/home");
  await expect(
    tools.getByRole("link", { name: "行動旅程導覽" }),
  ).toHaveAttribute("href", "/guide");
  await page.keyboard.press("Escape");
  await expect(tools).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await tools.getByRole("button", { name: "使用說明" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "關閉對話框" }).click();
  await trigger.click();
  await page.locator("main h1").click();
  await expect(tools).toHaveCount(0);
});

test("分析一次顯示一個視角，篩選與 Power BI 匯出範圍沿用且不改動資料", async ({
  page,
}) => {
  await page.goto("/admin/analytics");
  const initial = await page.evaluate(() =>
    localStorage.getItem("eco-sensing-demo-v1"),
  );
  await expect(page.locator(".data-agent")).toHaveCount(0);
  await page.getByLabel("部門篩選", { exact: true }).selectOption("工程研發部");
  await page.getByLabel("日期範圍").selectOption("week");
  await page.getByRole("button", { name: "部門比較", exact: true }).click();
  await expect(page.getByRole("img", { name: "部門排放比較圖" })).toBeVisible();
  await expect(page.getByRole("img", { name: /排放趨勢圖/ })).toHaveCount(0);
  await page.getByRole("button", { name: "資料問答", exact: true }).click();
  await expect(page.locator(".data-agent .answer-source")).toContainText(
    "工程研發部 · 2026/10/24–10/27",
  );
  await expect(page.getByRole("img", { name: "部門排放比較圖" })).toHaveCount(
    0,
  );
  await page.getByRole("link", { name: "前往報表 →" }).click();
  await expect(page.getByLabel("部門篩選", { exact: true })).toHaveValue(
    "工程研發部",
  );
  await expect(page.getByLabel("日期範圍")).toHaveValue("week");
  await page.getByRole("button", { name: "資料與設定", exact: true }).click();
  await expect(page.locator(".bi-scope")).toContainText(
    "工程研發部 · 2026/10/24–10/27",
  );
  await expect(
    page.getByRole("button", { name: "下載目前篩選事件 CSV" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("eco-sensing-demo-v1")),
  ).toBe(initial);
});

test("Power BI 報表需主動開啟才載入，支援修改、持久保存與清除", async ({
  page,
  baseURL,
}) => {
  const report = "11111111-2222-3333-4444-555555555555";
  const url = `https://app.powerbi.com/groups/me/reports/${report}/ReportSection`;
  let requests = 0;
  await page.route("https://app.powerbi.com/**", (route) => {
    requests++;
    return route.fulfill({
      contentType: "text/html",
      body: "<html><body>Account required</body></html>",
    });
  });
  await httpsWorkspace(page, baseURL!);
  await page.getByLabel("Power BI 報表網址").fill("https://example.com/report");
  await page.getByRole("button", { name: "儲存報表網址" }).click();
  await expect(page.getByRole("alert")).toContainText("app.powerbi.com");
  await page.getByLabel("Power BI 報表網址").fill(url);
  await page.getByRole("button", { name: "儲存報表網址" }).click();
  await expect(
    page.getByRole("link", { name: "在 Power BI 開啟", exact: true }),
  ).toHaveAttribute("href", url);
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(requests).toBe(0);
  await page.reload();
  await page.getByRole("button", { name: "在此檢視報表" }).click();
  await expect(page.locator('iframe[title="Power BI 報表"]')).toHaveAttribute(
    "src",
    `https://app.powerbi.com/reportEmbed?reportId=${report}&autoAuth=true&pageName=ReportSection`,
  );
  await expect(page.locator("iframe")).not.toHaveAttribute(
    "allow",
    /fullscreen/,
  );
  await expect(
    page.getByRole("link", { name: "另開 Power BI 登入" }),
  ).toHaveAttribute("href", url);
  await expect.poll(() => requests).toBe(1);
  await page.getByRole("button", { name: "重新載入報表" }).click();
  await expect.poll(() => requests).toBe(2);
  await page.getByRole("button", { name: "變更報表", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByLabel("Power BI 報表網址")).toHaveValue(url);
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await page.getByRole("button", { name: "資料與設定", exact: true }).click();
  await page.getByText("清除報表連結", { exact: true }).click();
  await page
    .getByRole("button", { name: "清除已設定連結", exact: true })
    .click();
  await page.getByRole("button", { name: "報表", exact: true }).click();
  await expect(page.getByLabel("Power BI 報表網址")).toHaveValue("");
  await expect(
    page.getByRole("link", { name: "在 Power BI 開啟", exact: true }),
  ).toHaveCount(0);
});

test("HTTP 不載入登入框，另開連結將 embed 網址轉成完整報表", async ({
  page,
}) => {
  const report = "11111111-2222-3333-4444-555555555555";
  await page.goto("/admin/powerbi");
  await page
    .getByLabel("Power BI 報表網址")
    .fill(
      `https://app.powerbi.com/reportEmbed?reportId=${report}&autoAuth=true&pageName=ReportSection`,
    );
  await page.getByRole("button", { name: "儲存報表網址" }).click();
  await expect(
    page.getByRole("button", { name: "在此檢視報表" }),
  ).toBeDisabled();
  await expect(page.locator(".embed-environment-note")).toContainText(
    "需要 HTTPS",
  );
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "在 Power BI 開啟", exact: true }),
  ).toHaveAttribute(
    "href",
    `https://app.powerbi.com/groups/me/reports/${report}/ReportSection`,
  );
  await page.getByRole("button", { name: "資料與設定", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "開啟已設定的 Power BI 報表" }),
  ).toHaveAttribute(
    "href",
    `https://app.powerbi.com/groups/me/reports/${report}/ReportSection`,
  );
});

test("HTTPS 環境缺少加密功能時保留另開入口", async ({ page, baseURL }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "crypto", { value: undefined }),
  );
  await httpsWorkspace(page, baseURL!);
  await page
    .getByLabel("Power BI 報表網址")
    .fill(
      "https://app.powerbi.com/groups/me/reports/11111111-2222-3333-4444-555555555555",
    );
  await page.getByRole("button", { name: "儲存報表網址" }).click();
  await expect(
    page.getByRole("button", { name: "在此檢視報表" }),
  ).toBeDisabled();
  await expect(page.locator(".embed-environment-note")).toContainText(
    "加密功能",
  );
  await expect(
    page.getByRole("link", { name: "在 Power BI 開啟", exact: true }),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("企業端桌面與窄螢幕布局可操作，側欄與工具選單不遮擋", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["dashboard", "analytics", "powerbi"]) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} @ ${width}`,
      ).toBe(true);
      if (width === 1440)
        await page.screenshot({
          path: `test-results/screenshots/enterprise-${route}-desktop.png`,
          fullPage: true,
          animations: "disabled",
        });
    }
    await page
      .getByRole("button", { name: "工作空間選項", exact: true })
      .click();
    const box = await page
      .getByRole("group", { name: "工作空間選項" })
      .boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    if (width < 850) {
      await page.getByRole("button", { name: "開啟企業導覽" }).click();
      await expect(
        page.getByRole("dialog", { name: "企業端導覽選單" }),
      ).toBeVisible();
      await page.locator(".management-nav > summary").click();
      await page.getByRole("link", { name: "部門參與", exact: true }).click();
      await expect(
        page.getByRole("dialog", { name: "企業端導覽選單" }),
      ).toHaveCount(0);
    }
  }
});
