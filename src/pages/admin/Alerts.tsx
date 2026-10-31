import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminFilters } from "./Dashboard";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
import { workspaceAlerts } from "../../utils/insights";
import { daily, selectEvents, sum, n } from "../../utils/stats";
import { TrendChart } from "../../components/charts";
import { Empty } from "../../components/ui";
import { departments } from "../../data/seed";
export function Alerts() {
  const [params, setParams] = useSearchParams();
  const { state } = useDemo();
  const { presentation, updatePresentation } = useExperience();
  const [dept, setDept] = useState(
    departments.includes(params.get("dept") as (typeof departments)[number])
      ? params.get("dept")!
      : "全部部門",
  );
  const [period, setPeriod] = useState(
    params.get("period") === "week" ? "week" : "month",
  );
  const events = selectEvents(state.events, dept, period);
  const alerts = workspaceAlerts(state.devices, events, `${dept}:${period}`);
  const selected = alerts.find((a) => a.id === params.get("id")) || alerts[0];
  const done = selected && presentation.resolvedAlerts.includes(selected.id);
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="service-kicker gold">
            MICROSOFT FABRIC · ACTIVATOR 工作流程
          </span>
          <h1>異常追蹤</h1>
          <p>查看原因、參照範圍，保留處理狀態。</p>
        </div>
        <AdminFilters {...{ dept, setDept, period, setPeriod }} />
      </div>
      <div className="alert-workspace">
        <nav aria-label="異常項目">
          {alerts.map((a) => (
            <button
              key={a.id}
              aria-pressed={selected.id === a.id}
              onClick={() => setParams({ dept, period, id: a.id })}
            >
              <b>{a.title}</b>
              <small>
                {presentation.resolvedAlerts.includes(a.id)
                  ? "已處理"
                  : "待處理"}
              </small>
            </button>
          ))}
        </nav>
        {selected ? (
          <section className="alert-detail">
            <span className="micro-label">
              {selected.kind === "device" ? "共用設備狀態" : "部門來源觀察"}
            </span>
            <h2>{selected.title}</h2>
            <div className="alert-value">{selected.value}</div>
            <p>{selected.detail}</p>
            <div className="notice">
              <span>{selected.rule}</span>
            </div>
            <dl className="detail-list">
              <div>
                <dt>資料範圍</dt>
                <dd>
                  {dept} · {period === "week" ? "10/24–10/27" : "10/01–10/27"}
                </dd>
              </div>
              <div>
                <dt>範圍估算排放</dt>
                <dd>{n(sum(events))} kg CO₂e</dd>
              </div>
            </dl>
            <TrendChart data={daily(events)} compact />
            <p className="fine-print">
              圖表反映上述部門範圍，不代表個別設備用電趨勢。
            </p>
            <div className="alert-detail-actions">
              <button
                className={done ? "btn-secondary" : "btn"}
                onClick={() =>
                  updatePresentation({
                    resolvedAlerts: done
                      ? presentation.resolvedAlerts.filter(
                          (id) => id !== selected.id,
                        )
                      : [...presentation.resolvedAlerts, selected.id],
                  })
                }
              >
                {done ? "重新開啟" : "標記已處理"}
              </button>
              <Link className="text-link" to="/admin/analytics">
                回到主管洞察 →
              </Link>
            </div>
            {done && (
              <p role="status" className="resolution-note">
                已保存處理註記，設備狀態與排放紀錄維持原值。
              </p>
            )}
          </section>
        ) : (
          <Empty text="目前沒有需要追蹤的項目。" />
        )}
      </div>
      <section className="notification-preference">
        <div>
          <h2>主管通知通路</h2>
          <p>通知偏好只保留於工作空間，不會發送訊息。</p>
        </div>
        <select
          aria-label="主管通知通路"
          value={presentation.notificationChannel}
          onChange={(e) =>
            updatePresentation({
              notificationChannel: e.target.value as "email" | "teams" | "none",
            })
          }
        >
          <option value="email">Email</option>
          <option value="teams">Microsoft Teams</option>
          <option value="none">只在工作空間查看</option>
        </select>
      </section>
    </>
  );
}
