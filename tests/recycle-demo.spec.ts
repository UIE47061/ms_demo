import { test, expect } from "@playwright/test";

test("隱藏設定可保存、跨頁套用、解除與重設 Demo 綁定", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/profile");
  const setting = page.getByRole("button", { name: "連接垃圾桶", exact: true });
  await expect(setting).toBeHidden();
  await page.getByText("工作空間與資料", { exact: true }).click();
  await setting.click();
  await expect(page.getByRole("dialog")).toContainText("尚未與實體垃圾桶連線");
  await page.getByLabel("垃圾桶名稱", { exact: true }).fill("家裡的垃圾桶");
  await page.getByLabel("垃圾桶識別碼", { exact: true }).fill("home-bin");
  await page.getByRole("button", { name: "保存垃圾桶設定" }).click();
  await page.reload();
  await page.getByText("工作空間與資料", { exact: true }).click();
  await setting.click();
  await expect(page.getByLabel("垃圾桶識別碼", { exact: true })).toHaveValue("home-bin");
  await page.screenshot({ path: "test-results/screenshots/recycle-bin-settings-mobile.png" });
  await page.getByRole("button", { name: "關閉對話框" }).click();
  await page.goto("/app/trash-scan");
  await expect(page.locator(".qr-stage")).toContainText("家裡的垃圾桶");
  await page.goto("/app/profile");
  await page.getByText("工作空間與資料", { exact: true }).click();
  await setting.click();
  await page.getByRole("button", { name: "解除綁定" }).click();
  await setting.click();
  await expect(page.getByLabel("垃圾桶識別碼", { exact: true })).toHaveValue("bin-01");
  await page.getByRole("button", { name: "保存垃圾桶設定" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "重設工作空間資料" }).click();
  await page.getByText("工作空間與資料", { exact: true }).click();
  await setting.click();
  await expect(page.getByRole("dialog")).toContainText("尚未綁定");
});

test("相機預覽滿一秒後釋放鏡頭才進入工作階段，手動確認才入帳", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    (window as any).cameraLog = { tracks: [], started: 0, stopped: 0 };
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      const log = (window as any).cameraLog;
      log.tracks = stream.getTracks();
      for (const track of log.tracks) {
        const stop = track.stop.bind(track);
        track.stop = () => { log.stopped = performance.now(); stop(); };
      }
      document.querySelector("video")?.addEventListener("playing", () => {
        log.started = performance.now();
      }, { once: true });
      return stream;
    };
  });
  await page.goto("/app/trash-scan");
  const count = await page.evaluate(() => JSON.parse(localStorage.getItem("eco-sensing-demo-v1")!).events.length);
  await page.getByRole("button", { name: "開始回收" }).click();
  await expect(page.getByLabel("垃圾桶掃描相機")).toBeVisible();
  await expect.poll(() => page.getByLabel("垃圾桶掃描相機").evaluate(
    (video: HTMLVideoElement) => video.readyState,
  )).toBeGreaterThanOrEqual(2);
  await page.screenshot({ path: "test-results/screenshots/recycle-camera-mobile.png" });
  await expect(page.getByRole("heading", { name: "已建立工作階段" })).toBeVisible();
  await page.screenshot({ path: "test-results/screenshots/recycle-session-mobile.png" });
  const camera = await page.evaluate(() => {
    const log = (window as any).cameraLog;
    return { elapsed: log.stopped - log.started, states: log.tracks.map((t: MediaStreamTrack) => t.readyState) };
  });
  expect(camera.elapsed).toBeGreaterThanOrEqual(990);
  expect(camera.states).toEqual(["ended"]);
  await expect(page.getByLabel("垃圾桶掃描相機")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "回收結果確認" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("eco-sensing-demo-v1")!).events.length)).toBe(count);
  await page.getByRole("button", { name: "確認碳排入帳" }).click();
  const events = await page.evaluate(() => JSON.parse(localStorage.getItem("eco-sensing-demo-v1")!).events);
  expect(events).toHaveLength(count + 1);
  expect(events[0]).toMatchObject({ mock: true });
  expect(events[0].detail).toContain("預覽模式 · 回收資料使用預設值");
});

test("拒絕相機權限可明確略過繼續 Demo", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await page.goto("/app/trash-scan");
  await page.getByRole("button", { name: "開始回收" }).click();
  await expect(page.getByRole("alert")).toContainText("尚未取得相機權限");
  await expect(page.getByRole("heading", { name: "已建立工作階段" })).toHaveCount(0);
  await page.getByRole("button", { name: "略過相機，繼續流程" }).click();
  await expect(page.getByRole("heading", { name: "回收結果確認" })).toBeVisible();
});

test("取消尚未完成的相機授權後，延遲取得的鏡頭也會釋放", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => new Promise((resolve) => {
      (window as any).resolveCamera = () => {
        const canvas = document.createElement("canvas");
        const stream = canvas.captureStream();
        (window as any).lateCameraTrack = stream.getTracks()[0];
        resolve(stream);
      };
    });
  });
  await page.goto("/app/trash-scan");
  await page.getByRole("button", { name: "開始回收" }).click();
  await page.getByRole("button", { name: "取消掃描" }).click();
  await page.evaluate(() => (window as any).resolveCamera());
  await expect.poll(() => page.evaluate(() => (window as any).lateCameraTrack.readyState)).toBe("ended");
  await expect(page.getByRole("button", { name: "開始回收" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "已建立工作階段" })).toHaveCount(0);
});

test("相機預覽中取消或離開頁面都會釋放鏡頭", async ({ page }) => {
  await page.goto("/app/trash-scan");
  for (const action of ["cancel", "leave"]) {
    await page.getByRole("button", { name: "開始回收" }).click();
    await expect(page.getByLabel("垃圾桶掃描相機")).toBeVisible();
    await page.getByLabel("垃圾桶掃描相機").evaluate((video: HTMLVideoElement) => {
      (window as any).activeTrack = (video.srcObject as MediaStream).getTracks()[0];
    });
    if (action === "cancel") {
      await page.getByRole("button", { name: "取消掃描" }).click();
      await expect(page.getByRole("button", { name: "開始回收" })).toBeVisible();
    } else {
      await page.getByRole("button", { name: "關閉登錄" }).click();
      await page.getByRole("button", { name: "放棄並離開" }).click();
      await expect(page).toHaveURL(/app\/home$/);
    }
    await expect.poll(() => page.evaluate(() => (window as any).activeTrack.readyState)).toBe("ended");
  }
});
