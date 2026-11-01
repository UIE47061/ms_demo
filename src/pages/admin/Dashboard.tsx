import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { CompareChart, TrendChart } from "../../components/charts";
import { EventList } from "../../components/Events";
import { DataAgent } from "../../components/experience/Microsoft";
import { Empty, Metric, Panel, SectionHead } from "../../components/ui";
import { departments, employees } from "../../data/seed";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
import { useAnalysisFilters } from "../../hooks/useAnalysisFilters";
import { usePowerBiReport } from "../../hooks/usePowerBiReport";
import { workspaceAlerts } from "../../utils/insights";
import {
  categories,
  daily,
  departmentStats,
  monthly,
  n,
  selectEvents,
  sum,
} from "../../utils/stats";
import type { CarbonEvent } from "../../types";

export function AdminFilters({
  dept,
  setDept,
  period,
  setPeriod,
}: {
  dept: string;
  setDept: (v: string) => void;
  period: string;
  setPeriod: (v: string) => void;
}) {
  return (
    <div className="admin-filters">
      <label>
        <Users size={15} />
        <select
          aria-label="部門篩選"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          <option>全部部門</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
      <label>
        <CalendarDays size={15} />
        <select
          aria-label="日期範圍"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="month">2026/10/01 – 10/27</option>
          <option value="week">2026/10/24 – 10/27</option>
        </select>
      </label>
    </div>
  );
}
function SourceRows({ events }: { events: CarbonEvent[] }) {
  const total = sum(events);
  return (
    <div className="source-breakdown">
      {categories(events)
        .sort((a, b) => b.value - a.value)
        .map((c) => (
          <div key={c.key}>
            <div>
              <span>{c.name}</span>
              <b>
                {n(c.value, 1)} <small>kg CO₂e</small>
              </b>
            </div>
            <div className="source-bar">
              <i style={{ width: `${total ? (c.value / total) * 100 : 0}%` }} />
            </div>
            <small>{total ? n((c.value / total) * 100) : "0.0"}%</small>
          </div>
        ))}
    </div>
  );
}
function DepartmentRows({
  events,
  dept,
  period,
}: {
  events: CarbonEvent[];
  dept: string;
  period: string;
}) {
  return (
    <div className="table-scroll">
      <table className="overview-departments">
        <thead>
          <tr>
            <th>部門</th>
            <th>
              估算排放 <small>kg CO₂e</small>
            </th>
            <th>參與員工</th>
            <th>活動數</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {departments
            .filter((d) => dept === "全部部門" || d === dept)
            .map((d) => {
              const rows = events.filter((e) => e.department === d);
              return (
                <tr key={d}>
                  <td>
                    <b>{d}</b>
                  </td>
                  <td className="numeric">{n(sum(rows))}</td>
                  <td>{new Set(rows.map((e) => e.employeeId)).size} 人</td>
                  <td>{rows.length}</td>
                  <td>
                    <Link
                      className="text-link"
                      aria-label={`分析${d}`}
                      to={`/admin/analytics?${new URLSearchParams({ dept: d, period, tab: "department" })}`}
                    >
                      分析 <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
export function Dashboard() {
  const { state } = useDemo();
  const { presentation } = useExperience();
  const filters = useAnalysisFilters();
  const { dept, period, query } = filters;
  const events = selectEvents(state.events, dept, period);
  const alerts = workspaceAlerts(state.devices, events, `${dept}:${period}`);
  const pending = alerts.filter(
    (a) => !presentation.resolvedAlerts.includes(a.id),
  );
  const completed =
    employees
      .filter((e) => dept === "全部部門" || e.department === dept)
      .reduce((a, e) => a + e.tasks, 0) +
    (dept === "全部部門" || dept === "產品設計部" ? state.claimed.length : 0);
  const rows = daily(events);
  const trend = period === "week" ? rows.slice(-4) : rows;
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>企業總覽</h1>
          <p>掌握排放、參與與待處理事項。</p>
        </div>
        <Link
          className="btn-secondary powerbi-entry"
          to={`/admin/powerbi?${query}`}
        >
          Power BI 報表 <ArrowRight size={15} />
        </Link>
      </div>
      <div className="overview-filterbar">
        <span>資料截至 2026/10/27</span>
        <AdminFilters {...filters} />
      </div>
      <div className="overview-kpis">
        <Metric label="估算排放" value={n(sum(events))} unit="kg CO₂e" />
        <Metric label="活動紀錄" value={n(events.length, 0)} unit="筆" />
        <Metric
          label="參與員工"
          value={n(new Set(events.map((e) => e.employeeId)).size, 0)}
          unit="人"
        />
        <Metric label="待處理項目" value={n(pending.length, 0)} unit="項" />
      </div>
      <div className="overview-charts">
        <Panel>
          <SectionHead
            title="排放趨勢"
            subtitle={`${period === "week" ? "10/24–10/27" : "10/21–10/27"} · kg CO₂e`}
            action={
              <Link className="text-link" to={`/admin/analytics?${query}`}>
                查看分析 →
              </Link>
            }
          />
          <TrendChart data={trend} />
        </Panel>
        <Panel>
          <SectionHead title="主要排放來源" />
          <SourceRows events={events} />
        </Panel>
      </div>
      <div className="overview-bottom">
        <Panel>
          <SectionHead title="部門概況" />
          <DepartmentRows {...{ events, dept, period }} />
        </Panel>
        <Panel>
          <SectionHead
            title="需要處理"
            action={
              <Link className="text-link" to={`/admin/alerts?${query}`}>
                全部項目 →
              </Link>
            }
          />
          <div className="overview-alert-list">
            {pending.slice(0, 3).map((a) => (
              <Link
                key={a.id}
                to={`/admin/alerts?${query}&id=${encodeURIComponent(a.id)}`}
              >
                <span>
                  <b>{a.title}</b>
                  <small>
                    {a.kind === "device" ? "共用設備" : "來源占比觀察"}
                  </small>
                </span>
                <strong>{a.value}</strong>
                <ArrowRight size={14} />
              </Link>
            ))}
            {!pending.length && <Empty text="目前沒有待處理項目。" />}
          </div>
        </Panel>
      </div>
      <details className="enterprise-disclosure">
        <summary>參與摘要與避免排放</summary>
        <p>
          累計完成任務 {completed} 次；另列避免排放{" "}
          {n(sum(events, "avoided"), 2)} kg CO₂e，不抵銷估算排放。
        </p>
        <Link className="text-link" to="/admin/reports">
          產生 ESG 報告 →
        </Link>
      </details>
      {presentation.adminView === "administrator" && (
        <details className="enterprise-disclosure events-panel">
          <summary>最近活動</summary>
          <EventList
            table
            events={events
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)}
          />
        </details>
      )}
    </>
  );
}
export function Analytics() {
  const { state } = useDemo();
  const { presentation } = useExperience();
  const filters = useAnalysisFilters();
  const { dept, period, params, setParam, query, scope } = filters;
  const { reportUrl } = usePowerBiReport();
  const administrator = presentation.adminView === "administrator";
  const available = administrator
    ? ["source", "department", "questions", "activity"]
    : ["source", "department", "questions"];
  const tab = available.includes(params.get("tab") || "")
    ? params.get("tab")!
    : "source";
  const events = selectEvents(state.events, dept, period);
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>碳排分析</h1>
          <p>選擇來源、部門或問題，聚焦一個觀察。</p>
        </div>
        <Link
          className="btn-secondary powerbi-entry"
          to={`/admin/powerbi?${query}`}
        >
          Power BI 報表 <ArrowRight size={15} />
        </Link>
      </div>
      <div className="analysis-toolbar">
        <div className="analysis-tabs" aria-label="分析檢視">
          {[
            ["source", "來源分析"],
            ["department", "部門比較"],
            ["questions", "資料問答"],
            ...(administrator ? [["activity", "活動明細"]] : []),
          ].map(([key, label]) => (
            <button
              key={key}
              aria-pressed={tab === key}
              onClick={() => setParam("tab", key)}
            >
              {label}
            </button>
          ))}
        </div>
        <AdminFilters {...filters} />
      </div>
      {tab !== "questions" && (
        <div className="analysis-summary">
          <span>
            估算排放 <b>{n(sum(events))}</b> kg CO₂e
          </span>
          <span>{events.length} 筆活動</span>
          <span>避免排放另列 {n(sum(events, "avoided"), 2)} kg CO₂e</span>
        </div>
      )}
      {tab === "source" && (
        <>
          <div className="overview-charts">
            <Panel>
              <SectionHead
                title="排放趨勢"
                subtitle="有活動紀錄的日期 · kg CO₂e"
              />
              <TrendChart
                data={
                  period === "week" ? daily(events).slice(-4) : daily(events)
                }
              />
            </Panel>
            <Panel>
              <SectionHead title="來源分布" />
              <SourceRows events={events} />
            </Panel>
          </div>
          <details className="enterprise-disclosure">
            <summary>查看歷史月份趨勢</summary>
            <p>
              5–9 月為歷史彙總；10 月依目前事件計算，統計期間與資料完整度不同。
            </p>
            <TrendChart data={monthly(events, dept)} />
          </details>
        </>
      )}
      {tab === "department" && (
        <Panel>
          <SectionHead title="部門排放比較" subtitle="kg CO₂e" />
          <CompareChart data={departmentStats(events)} />
          <DepartmentRows {...{ events, dept, period }} />
        </Panel>
      )}
      {tab === "questions" && (
        <>
          <p className="analysis-scope">
            回答範圍：{scope} · {events.length} 筆活動
          </p>
          <DataAgent events={events} scope={scope} />
        </>
      )}
      {tab === "activity" && administrator && (
        <Panel>
          <SectionHead title="活動明細" />
          <EventList
            table
            events={events.slice().sort((a, b) => b.date.localeCompare(a.date))}
          />
        </Panel>
      )}
      <div className="report-shortcut">
        <div>
          <b>使用 Power BI 延伸分析</b>
          <small>
            {reportUrl ? "已連結企業報表" : "連結報表，或匯出目前範圍的資料"}
          </small>
        </div>
        <Link className="text-link" to={`/admin/powerbi?${query}`}>
          前往報表 →
        </Link>
      </div>
    </>
  );
}
