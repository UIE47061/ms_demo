import { publicAsset } from "../../utils/assets";
import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useDemo } from "../../store/demo";
import type { CarbonEvent } from "../../types";
import {
  biCsv,
  buildBiTables,
  validatePowerBiReportUrl,
  type BiTable,
} from "../../utils/biExport";
export const REPORT_LINK_KEY = "eco-sensing-powerbi-report-url-v1";
export function PowerBiAccess({
  events,
  scope,
}: {
  events: CarbonEvent[];
  scope: string;
}) {
  const { state, notify } = useDemo();
  const [url, setUrl] = useState(() => {
    try {
      return (
        validatePowerBiReportUrl(localStorage.getItem(REPORT_LINK_KEY) || "") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [saved, setSaved] = useState(url);
  const [error, setError] = useState("");
  function download(table: BiTable, filename: string) {
    const blob = new Blob([biCsv(table)], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    notify(
      `已匯出 ${table.rows.length} 筆資料；匯入 Power BI 後可建立真正的報表`,
    );
  }
  function save() {
    const clean = validatePowerBiReportUrl(url);
    if (!clean) {
      setError(
        "請貼上 https://app.powerbi.com 的報表網址，例如 /groups/.../reports/...。",
      );
      return;
    }
    try {
      localStorage.setItem(REPORT_LINK_KEY, clean);
      setSaved(clean);
      setUrl(clean);
      setError("");
      notify("報表網址已儲存；開啟時仍需 Microsoft 登入與權限");
    } catch {
      setError("此瀏覽器無法儲存網址，請直接在 Power BI 開啟報表。");
    }
  }
  return (
    <section
      className="powerbi-access"
      aria-label="實際 Power BI 與 Fabric 資料交換"
    >
      <div className="powerbi-access-heading">
        <div>
          <span className="service-kicker gold">
            在真正的 MICROSOFT 平台查看
          </span>
          <h2>把這份資料，帶進 Power BI。</h2>
          <p>
            下載資料、匯入工作區，再開啟你建立的報表。這裡是檔案交換，尚未自動同步。
          </p>
        </div>
        <a
          className="btn-secondary"
          href={saved || "https://app.powerbi.com/"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {saved ? "開啟已設定的 Power BI 報表" : "開啟 Power BI"}
          <ExternalLink size={14} />
        </a>
      </div>
      <div className="bi-export-actions">
        <button
          className="btn"
          onClick={() =>
            download(buildBiTables(events).events, "EcoEvents.csv")
          }
        >
          <Download size={15} />
          下載目前篩選事件 CSV
        </button>
        <a
          className="btn-secondary"
          href={publicAsset("/bi/Eco-Sensing-PowerBI-Seed.xlsx")}
          download
        >
          <Download size={15} />
          下載初始 Excel
        </a>
        <button
          className="btn-secondary"
          onClick={() =>
            download(buildBiTables(state.events).monthly, "EcoMonthlyTrend.csv")
          }
        >
          全公司六個月趨勢 CSV
        </button>
      </div>
      <p className="bi-scope">
        目前事件：{scope} · {events.length} 筆。Excel 為初始 56
        筆活動；需要最新操作資料請下載 CSV。
      </p>
      <details className="bi-setup">
        <summary>匯入步驟與報表網址設定</summary>
        <div className="bi-setup-grid">
          <div>
            <h3>瀏覽器版 Power BI</h3>
            <ol>
              <li>下載 Excel，或下載目前事件 CSV。</li>
              <li>
                在 Power BI 的工作區新增語意模型，從 Excel／Text-CSV 選取資料。
              </li>
              <li>以 EcoEvents 建立部門、來源與日期圖表；另列避免排放。</li>
              <li>儲存報表後，把報表網址貼到右側。</li>
            </ol>
            <a
              className="text-link"
              href={publicAsset("/bi/匯入說明.md")}
              target="_blank"
              rel="noopener noreferrer"
            >
              查看完整欄位與圖表設定
            </a>
            <div className="bi-external-links">
              <a
                href="https://app.fabric.microsoft.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                開啟 Fabric <ExternalLink size={12} />
              </a>
              <a
                href={publicAsset("/bi/Eco-Sensing-PowerBI-Fabric.zip")}
                download
              >
                下載完整匯入包
              </a>
            </div>
          </div>
          <div>
            <label>
              已建立的 Power BI 報表網址
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://app.powerbi.com/groups/.../reports/..."
                aria-label="Power BI 報表網址"
                maxLength={2048}
              />
            </label>
            {error && (
              <p role="alert" className="bi-url-error">
                {error}
              </p>
            )}
            <div className="bi-url-actions">
              <button className="btn-secondary" onClick={save}>
                儲存報表網址
              </button>
              {saved && (
                <button
                  className="text-link"
                  onClick={() => {
                    try {
                      localStorage.removeItem(REPORT_LINK_KEY);
                    } catch {}
                    setSaved("");
                    setUrl("");
                    notify("已清除報表網址");
                  }}
                >
                  清除連結
                </button>
              )}
            </div>
            <p>
              已儲存的網址僅用於開啟報表，尚未驗證其內容或存取權限。檔案匯入後是快照；網站新增活動不會自動更新雲端報表。
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
