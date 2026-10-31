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
| `/guide`              | 五段手動行動旅程                  |
| `/app/home`           | 植物、EXP、碳幣、活動與掃描入口   |
| `/app/footprint`      | 總覽／分日紀錄、期間與來源篩選    |
| `/app/travel-scan`    | 憑證選擇、資訊確認與差旅登錄      |
| `/app/trash-scan`     | 回收流程、重量確認與入帳          |
| `/app/missions`       | 任務進度、領獎與碳魔王挑戰        |
| `/app/leaderboard`    | 個人／部門排行榜                  |
| `/app/trips`          | Outlook 出差待辦、排除與恢復      |
| `/agent`              | Eco-Agent 桌面離座提醒與任務同步  |
| `/admin/alerts`       | 異常詳情、處理註記與通知偏好      |
| `/app/assistant`      | App 內個人問答與任務建議          |
| `/app/profile`        | 成就、個人設定與資料重設          |
| `/admin/dashboard`    | 企業總覽、異常與部門分析          |
| `/admin/analytics`    | 排放分析、問答、Power BI 檔案交換 |
| `/admin/people`       | 員工與部門查詢                    |
| `/admin/devices`      | 設備查詢與事件接收                |
| `/admin/reports`      | 報告設定、預覽與列印 PDF          |
| `/admin/rewards`      | 兌換申請審核                      |
| `/admin/integrations` | Microsoft 服務流程與角色          |

## 手機操作

員工端使用首頁、碳足跡、任務、我的四項底部導覽。排行榜從任務或我的進入；個人頁直接呈現植物、成就與三項個人數據。差旅、回收流程隱藏全站導覽，關閉時可保留或放棄未提交資料；草稿只保留於同一瀏覽器分頁，圖片預覽不保留，提交與重設時清除。

登錄成功不會自動領獎；符合資格時可在完成畫面直接領取，與任務頁共用防重複規則。「我的」中的通知與摘要開關可調整首頁提醒與摘要；「我的 → 工作空間與資料」可切換企業端、開始導覽或重設資料。

## 資料與服務

資料保留於瀏覽器 localStorage，跨頁共用；不同瀏覽器或網域各自獨立。資料基準日為 2026/10/27。既有儲存格式保留相容；「重設資料」會還原活動、任務、獎勵與旅程狀態。

本專案沒有後端、資料庫或 API 金鑰。人物與事件使用本機初始資料；上傳圖片僅供預覽，憑證流程載入預設欄位，不對任意圖片執行 OCR。Microsoft AI、IoT、Outlook 與 Eco-Agent 的頁面用於操作與架構預覽，尚未連接服務或控制實體設備；Teams 只保留為可選主管通知通路。問答由目前事件與任務計算。碳幣、EXP 與挑戰進度不折抵排放。

Power BI／Fabric 支援真正的 Excel／CSV 檔案交換。可由分析頁匯出目前篩選結果，或下載 `public/bi/` 中的初始 Excel；在 Power BI 建立報表後，將網址存回分析頁即可開啟。報表權限由 Microsoft 帳號決定，檔案是手動快照，不會自動同步。完整匯入步驟見 [匯入說明](public/bi/匯入說明.md)。

## 檔案組織

- `src/`：頁面、共用元件、資料、統計與樣式。
- `public/bi/`：使用中的 Power BI 來源檔及匯入指南。
- `tests/`：跨頁互動與響應式驗收。
- `scripts/`：`npm run export:bi-data` 可重建 CSV。
- `docs/`：設計系統與主要畫面截圖。

新版畫面：[入口](docs/screenshots/landing-desktop.png)、[員工端](docs/screenshots/app-mobile.png)、[企業總覽](docs/screenshots/dashboard-desktop.png)、[碳排分析](docs/screenshots/analytics-desktop.png)。員工頁面：[任務](docs/screenshots/employee-missions.png)、[足跡](docs/screenshots/employee-footprint.png)、[個人](docs/screenshots/employee-profile.png)、[小幫手](docs/screenshots/employee-assistant.png)、[差旅確認](docs/screenshots/employee-travel-confirm.png)、[回收完成](docs/screenshots/employee-recycle-complete.png)。設計與動畫規則見 [設計系統](docs/DESIGN_SYSTEM.md)。

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

## Microsoft 決賽版操作

從 `/guide` 開始五段旅程：Outlook 出差待辦 → 車票與 AI 核算 → 回收 → Eco-Agent 桌面提醒 → Power BI 主管洞察。所有步驟手動操作，不會自動提交事件或領獎。

- Outlook：依工作空間行程資料呈現時間與地點；「不是出差」不新增事件與獎勵，可恢復。登錄完成後行程改為已登錄，再次開啟同一行程不會重複提交。
- 差旅：修改日期、起訖站、里程與參考比例，估算結果唯讀。比例由既有資料集的 165 km／5.8 kg CO₂e 換算，不是官方係數；起訖站不會自動查詢里程。確認後將計算依據寫入事件說明，沿用原事件格式。
- Eco 小幫手：保留三個依個人資料計算的問題；離座提醒移至 `/agent`。提醒的暫緩與領獎沿用共用狀態，每項獎勵一次為限。
- 主管：企業端預設部門彙總。工具列「檢視身分」切換為管理員後可查看個人名單、事件、設備設定與兌換。此切換只改呈現，不是登入、授權或 RLS；公開靜態資料仍可被直接讀取。
- Power BI：主管 CSV 為部門／來源彙總；管理員保留逐筆 CSV、初始 Excel 與完整匯入包。報表以設定的外部連結開啟，不宣稱即時同步或嵌入。
- 異常：設備警告／離線與來源占比超過 50% 的觀察項目，可檢視並標記已處理。處理註記不修改設備狀態或排放。Email／Teams 只儲存偏好，不寄送訊息。

行程、身分視角、異常註記及通知偏好儲存在既有呈現層 sessionStorage；舊欄位相容，共用重設會一併清除。不新增後端、資料庫、API Key 或 Microsoft 服務呼叫。

主要畫面：[Outlook 待辦](docs/screenshots/outlook-mobile.png)、[Eco-Agent 桌面提醒](docs/screenshots/agent-desktop.png)、[異常追蹤](docs/screenshots/alerts-desktop.png)。
