import { useEffect, useState } from "react";
import { ChartColumn, ExternalLink, Maximize2, Settings2 } from "lucide-react";
import { AdminFilters } from "./Dashboard";
import { useAnalysisFilters } from "../../hooks/useAnalysisFilters";
import { usePowerBiReport } from "../../hooks/usePowerBiReport";
import { useDemo } from "../../store/demo";
import { PowerBiAccess } from "../../components/experience/PowerBiAccess";
import {
  powerBiEmbedUrl,
  powerBiOpenUrl,
  validatePowerBiReportUrl,
} from "../../utils/biExport";
import { selectEvents, n, sum } from "../../utils/stats";
export function PowerBi() {
  const { state, notify } = useDemo();
  const filters = useAnalysisFilters();
  const { dept, period, params, setParam, scope } = filters;
  const { reportUrl, saveReport, clearReport } = usePowerBiReport();
  const [input, setInput] = useState(reportUrl);
  const [error, setError] = useState("");
  const [embedded, setEmbedded] = useState(false);
  const [embedVersion, setEmbedVersion] = useState(0);
  const tab = params.get("tab") === "data" ? "data" : "report";
  const embedUrl = powerBiEmbedUrl(reportUrl);
  const openUrl = powerBiOpenUrl(reportUrl) || "https://app.powerbi.com/";
  const https = window.location.protocol === "https:";
  const cryptoAvailable =
    window.isSecureContext && Boolean(window.crypto?.subtle);
  const canEmbed = https && cryptoAvailable;
  const events = selectEvents(state.events, dept, period);
  useEffect(() => {
    setInput(reportUrl);
    setError("");
    setEmbedded(false);
  }, [reportUrl]);
  function save() {
    if (!validatePowerBiReportUrl(input)) {
      setError("請貼上 app.powerbi.com 的報表網址或 reportEmbed 網址。");
      return false;
    }
    if (!saveReport(input)) {
      setError("此瀏覽器無法儲存網址，請直接開啟 Power BI。");
      return false;
    }
    setError("");
    setEmbedded(false);
    notify("Power BI 報表入口已儲存");
    return true;
  }
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="service-kicker powerbi-label">
            MICROSOFT POWER BI
          </span>
          <h1>Power BI 報表</h1>
          <p>連結企業報表，集中查看與管理分析資料。</p>
        </div>
        <a
          className="btn"
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {reportUrl ? "在 Power BI 開啟" : "前往 Power BI 工作空間"}
          <ExternalLink size={15} />
        </a>
      </div>
      <div className="analysis-toolbar">
        <div className="analysis-tabs" aria-label="Power BI 檢視">
          <button
            aria-pressed={tab === "report"}
            onClick={() => setParam("tab", "report")}
          >
            報表
          </button>
          <button
            aria-pressed={tab === "data"}
            onClick={() => setParam("tab", "data")}
          >
            資料與設定
          </button>
        </div>
        <AdminFilters {...filters} />
      </div>
      {tab === "report" ? (
        <>
          <div className="powerbi-report-frame">
            <div className="powerbi-report-toolbar">
              <div>
                <ChartColumn size={18} />
                <b>企業永續報表</b>
              </div>
              {reportUrl && (
                <button
                  className="text-link"
                  onClick={() => {
                    setEmbedded(false);
                    setInput(reportUrl);
                    setError("");
                    setParam("edit", "1");
                  }}
                >
                  <Settings2 size={15} />
                  變更報表
                </button>
              )}
            </div>
            {embedded && reportUrl && embedUrl && canEmbed ? (
              <>
                <div className="report-embed-controls">
                  <span>Power BI · 需使用具有報表權限的 Microsoft 帳號</span>
                  <div className="report-embed-actions">
                    <a
                      className="text-link"
                      href={openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      另開 Power BI 登入 <ExternalLink size={14} />
                    </a>
                    <button
                      className="text-link"
                      onClick={() => setEmbedVersion((version) => version + 1)}
                    >
                      重新載入報表
                    </button>
                    <button
                      className="text-link"
                      onClick={() => setEmbedded(false)}
                    >
                      結束內嵌檢視
                    </button>
                  </div>
                </div>
                <iframe
                  title="Power BI 報表"
                  key={embedVersion}
                  src={embedUrl}
                  allowFullScreen
                />
                <p className="report-frame-note">
                  登入沒有反應時，請允許此網站的彈出視窗，或另開 Power BI
                  登入後返回並重新載入報表。內嵌仍可能受瀏覽器與學校帳號政策限制。
                </p>
              </>
            ) : reportUrl && params.get("edit") !== "1" ? (
              <section className="connected-report">
                <div className="powerbi-report-mark">
                  <ChartColumn size={42} />
                </div>
                <span className="service-kicker powerbi-label">
                  POWER BI SERVICE
                </span>
                <h2>報表入口已設定</h2>
                <p>先在 Power BI 登入學校或公司帳號，再返回檢視報表。</p>
                <div>
                  <button
                    className="btn-secondary"
                    disabled={!embedUrl || !canEmbed}
                    onClick={() => setEmbedded(true)}
                  >
                    <Maximize2 size={15} />
                    在此檢視報表
                  </button>
                  <a
                    className="btn"
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    前往 Power BI <ExternalLink size={14} />
                  </a>
                </div>
                {!canEmbed && (
                  <p className="embed-environment-note" role="status">
                    {!https
                      ? "目前網站使用 HTTP，Power BI 內嵌需要 HTTPS。請先另開 Power BI 登入；網站以 HTTPS 開啟後再使用頁內檢視。"
                      : "此瀏覽器無法提供登入所需的加密功能。請另開 Power BI，或使用最新版 Chrome／Edge 重試。"}
                  </p>
                )}
                {!embedUrl && (
                  <small>
                    此連結可另開。內嵌檢視需要網址包含有效的報表識別碼。
                  </small>
                )}
              </section>
            ) : (
              <section className="connect-report">
                <div className="powerbi-report-mark">
                  <ChartColumn size={34} />
                </div>
                <h2>{reportUrl ? "變更企業報表" : "連結你的 Power BI 報表"}</h2>
                <p>貼上既有報表網址，錄製與日常操作都能從這裡進入。</p>
                <label>
                  Power BI 報表網址
                  <input
                    type="url"
                    aria-label="Power BI 報表網址"
                    maxLength={2048}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://app.powerbi.com/groups/…/reports/…"
                  />
                </label>
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
                <div className="connect-report-actions">
                  <button
                    className="btn"
                    onClick={() => {
                      if (save()) setParam("edit", "0");
                    }}
                  >
                    儲存報表網址
                  </button>
                  {reportUrl && (
                    <button
                      className="btn-secondary"
                      onClick={() => setParam("edit", "0")}
                    >
                      取消
                    </button>
                  )}
                  <button
                    className="text-link"
                    onClick={() => setParam("tab", "data")}
                  >
                    先準備分析資料 →
                  </button>
                </div>
              </section>
            )}
          </div>
          <div className="report-data-summary">
            <div>
              <span>目前工作空間資料</span>
              <b>{dept}</b>
            </div>
            <div>
              <span>估算排放</span>
              <b>
                {n(sum(events))}
                <small> kg CO₂e</small>
              </b>
            </div>
            <div>
              <span>活動紀錄</span>
              <b>
                {events.length}
                <small> 筆</small>
              </b>
            </div>
            <button
              className="text-link"
              onClick={() => setParam("tab", "data")}
            >
              匯出與設定 →
            </button>
          </div>
          <p className="report-frame-note">
            上方篩選用於本站統計與匯出；外部報表依 Power BI
            的資料與權限顯示，不會自動同步本站操作。
          </p>
        </>
      ) : (
        <>
          <PowerBiAccess events={events} scope={scope} />
          <details className="enterprise-disclosure">
            <summary>清除報表連結</summary>
            <p>只清除這個瀏覽器保存的連結，不影響 Power BI 中的報表。</p>
            <button
              className="text-link"
              onClick={() => {
                if (clearReport()) {
                  setInput("");
                  setEmbedded(false);
                  notify("已清除報表連結");
                }
              }}
            >
              清除已設定連結
            </button>
          </details>
        </>
      )}
    </>
  );
}
