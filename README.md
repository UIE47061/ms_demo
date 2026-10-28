# Eco-Sensing

員工行動碳足跡、植物成長與企業永續工作空間。React、TypeScript、Vite；繁體中文，員工端手機優先，企業端桌面優先。

## 啟動與檢查

Node.js 22.12 以上。

```sh
npm ci
npm run dev
```

開啟終端機顯示的網址（預設 http://localhost:5173）。

```sh
npm run build
npm run typecheck
npm test
npm run test:e2e
npm run preview
```

端對端測試會自動啟動 4173 埠；macOS 優先使用已安裝的 Chrome。其他環境先執行 `npx playwright install chromium`，亦可設定 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`。測試產物位於 `test-results/`，不納入版本控制。

## 工作空間

| 路徑                  | 功能                              |
| --------------------- | --------------------------------- |
| `/`                   | 產品入口、員工端與企業端          |
| `/guide`              | 四段手動行動旅程                  |
| `/app/home`           | 植物、EXP、碳幣、活動與掃描入口   |
| `/app/footprint`      | 來源篩選、排放趨勢與活動紀錄      |
| `/app/travel-scan`    | 憑證選擇、資訊確認與差旅登錄      |
| `/app/trash-scan`     | 回收流程、重量確認與入帳          |
| `/app/missions`       | 任務進度、領獎與碳魔王挑戰        |
| `/app/leaderboard`    | 個人／部門排行榜                  |
| `/app/assistant`      | Teams 提醒流程與個人問答          |
| `/app/profile`        | 成就、個人設定與資料重設          |
| `/admin/dashboard`    | 企業總覽、異常與部門分析          |
| `/admin/analytics`    | 排放分析、問答、Power BI 檔案交換 |
| `/admin/people`       | 員工與部門查詢                    |
| `/admin/devices`      | 設備查詢與事件接收                |
| `/admin/reports`      | 報告設定、預覽與列印 PDF          |
| `/admin/rewards`      | 兌換申請審核                      |
| `/admin/integrations` | Microsoft 服務流程與角色          |

## 資料與服務

資料保留於瀏覽器 localStorage，跨頁共用；不同瀏覽器或網域各自獨立。資料基準日為 2026/10/27。既有儲存格式保留相容；「重設資料」會還原活動、任務、獎勵與旅程狀態。

本專案沒有後端、資料庫或 API 金鑰。人物與事件使用本機初始資料；上傳圖片僅供預覽，憑證流程載入預設欄位，不對任意圖片執行 OCR。Microsoft AI、IoT、Teams 的頁面用於操作與架構預覽，尚未連接服務或控制實體設備。問答由目前事件與任務計算。碳幣、EXP 與挑戰進度不折抵排放。

Power BI／Fabric 支援真正的 Excel／CSV 檔案交換。可由分析頁匯出目前篩選結果，或下載 `public/bi/` 中的初始 Excel；在 Power BI 建立報表後，將網址存回分析頁即可開啟。報表權限由 Microsoft 帳號決定，檔案是手動快照，不會自動同步。完整匯入步驟見 [匯入說明](public/bi/匯入說明.md)。

## 檔案組織

- `src/`：頁面、共用元件、資料、統計與樣式。
- `public/bi/`：使用中的 Power BI 來源檔及匯入指南。
- `tests/`：跨頁互動與響應式驗收。
- `scripts/`：`npm run export:bi-data` 可重建 CSV。
- `docs/`：設計系統與主要畫面截圖。

新版畫面：[入口](docs/screenshots/landing-desktop.png)、[員工端](docs/screenshots/app-mobile.png)、[企業總覽](docs/screenshots/dashboard-desktop.png)、[碳排分析](docs/screenshots/analytics-desktop.png)。設計與動畫規則見 [設計系統](docs/DESIGN_SYSTEM.md)。

建置產物與測試暫存不納入版本控制；重複試算表輸出與舊版截圖已移除。原始開發規格及清理前的輸出曾備份至 `/private/tmp/eco-sensing-cleanup-20261028.zip`；該檔只用於本機回復，不會發布。

## GitHub Pages

已加入 `.github/workflows/deploy.yml`，參考 [BIMGO 的部署流程](https://github.com/UIE47061/BIMGO/blob/main/.github/workflows/deploy.yml)，並依 [Vite 官方部署方式](https://vite.dev/guide/static-deploy.html#github-pages) 改用 `dist`。

1. 將此專案推送至你自己的 GitHub repository 的 `main` 分支。
2. 到 repository 的 **Settings → Pages → Source** 選 **GitHub Actions**。
3. Push 後會執行型別檢查、單元測試、建置並部署；亦可在 Actions 手動執行。
4. 完成網址以部署工作顯示的 `page_url` 為準。

`configure-pages` 的 `base_path` 會設定 Vite 子路徑，支援一般 repository、帳號首頁及自訂網域。正式產物使用 HashRouter，例如 `/ms_demo/#/app/home`；重新整理深層頁面不需伺服器 rewrite。開發環境維持一般路徑，舊的 `/demo` 導覽路徑仍相容。

本機驗證子路徑：

```sh
PAGES_BASE_PATH=/eco-sensing/ npm run build
npm run test:pages
```

沒有設定 Git remote 或推送到參考用的 BIMGO repository。學校帳號的報表網址留在你的瀏覽器，不寫入公開原始碼；發布網域首次開啟時，需重新貼上報表連結。
