import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Download,
  Leaf,
  Radio,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  chartPalette,
  CompareChart,
  DonutChart,
  TrendChart,
} from "../../components/charts";
import { PowerBiAccess } from "../../components/experience/PowerBiAccess";
import { EventList } from "../../components/Events";
import {
  DataAgent,
  SimulationLabel,
} from "../../components/experience/Microsoft";
import { Metric, Panel, SectionHead } from "../../components/ui";
import { departments, employees, history } from "../../data/seed";
import { useDemo } from "../../store/demo";
import {
  categories,
  daily,
  departmentStats,
  monthly,
  n,
  selectEvents,
  sum,
} from "../../utils/stats";
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
export function Dashboard() {
  const { state } = useDemo();
  const [dept, setDept] = useState("全部部門");
  const [period, setPeriod] = useState("month");
  const events = selectEvents(state.events, dept, period);
  const total = sum(events);
  const participation = new Set(events.map((e) => e.employeeId)).size;
  const completed =
    employees
      .filter((e) => dept === "全部部門" || e.department === dept)
      .reduce((a, e) => a + e.tasks, 0) +
    (dept === "全部部門" || dept === "產品設計部" ? state.claimed.length : 0);
  const previous = history[4];
  const base =
    (previous.waste + previous.elevator + previous.travel + previous.digital) *
    (dept === "全部部門" ? 1 : 0.25);
  const change = (total / base - 1) * 100;
  const online = state.devices.filter((d) => d.status === "在線").length;
  const topSource = categories(events).sort((a, b) => b.value - a.value)[0];
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>企業永續總覽</h1>
          <p>排放、參與及設備狀態。</p>
        </div>
        <Link className="btn-secondary" to="/admin/reports">
          <Download size={16} />
          匯出報告
        </Link>
      </div>
      <div className="overview-intro">
        <div className="live-label">
          <span />
          <small>截至 2026/10/27 · 事件同步更新</small>
        </div>
        <AdminFilters {...{ dept, setDept, period, setPeriod }} />
      </div>
      <section className="dashboard-focus">
        <div className="dashboard-main-kpi">
          <span className="service-kicker">每個人的行動，企業看得見。</span>
          <h2>{period === "month" ? "本月估算總排放" : "本週估算總排放"}</h2>
          <div className="metric-value">
            {n(total)}
            <small>kg CO₂e</small>
          </div>
          <p>
            {period === "month"
              ? `較 9 月彙總 ${change <= 0 ? "減少" : "增加"} ${n(Math.abs(change))}%`
              : "10/24–10/27 事件加總"}{" "}
            · 本機資料
          </p>
          <div className="focus-meta">
            <span>{events.length} 筆事件</span>
            <span>{participation} 位參與員工</span>
          </div>
        </div>
        <div className="dashboard-insight">
          <span className="service-kicker azure">本期值得關注</span>
          <h2>
            {total
              ? `${topSource.name}，是這期的觀察起點。`
              : "目前範圍還沒有排放事件。"}
          </h2>
          <p>
            {total
              ? `占目前範圍估算排放 ${n((topSource.value / total) * 100)}%，共 ${n(topSource.value, 2)} kg CO₂e。下一步可以比較部門與來源，找到適合的行動。`
              : "調整篩選範圍，或從設備接收一筆活動紀錄。"}
          </p>
          <Link className="text-link" to="/admin/analytics">
            用 Data Agent 繼續探索 <ArrowRight size={14} />
          </Link>
          <Link className="focus-alert" to="/admin/devices">
            <CircleAlert size={15} />
            {state.devices.filter((d) => d.status !== "在線").length}{" "}
            項設備需留意 <ChevronRight size={14} />
          </Link>
        </div>
      </section>
      <div className="metrics-grid three supporting-metrics">
        <Metric
          label="參與員工"
          value={n(participation, 0)}
          unit="人"
          icon={<Users size={18} />}
          change={`涵蓋 ${dept === "全部部門" ? 4 : 1} 個部門・共 ${dept === "全部部門" ? 12 : 3} 位員工`}
        />
        <Metric
          label="減碳任務完成"
          value={n(completed, 0)}
          unit="次"
          icon={<Target size={18} />}
          change="含歷史任務基準與本次已領獎任務"
        />
        <Metric
          label="另列避免排放"
          value={n(sum(events, "avoided"), 2)}
          unit="kg CO₂e"
          icon={<TrendingUp size={18} />}
          change="減碳激勵估算・不抵銷總排放"
        />
      </div>
      <div className="dashboard-chart-grid">
        <Panel>
          <SectionHead
            title="碳排放趨勢"
            subtitle={
              period === "month"
                ? "2026 年 5–10 月 · kg CO₂e"
                : "近 7 日的每日排放 · kg CO₂e"
            }
            action={
              <span className="chart-key">
                <i />
                估算排放量
              </span>
            }
          />
          <TrendChart
            data={period === "month" ? monthly(events, dept) : daily(events)}
          />
          <div className="chart-caption">
            <span>5–9 月為歷史彙總；10 月依呈現事件計算。</span>
          </div>
        </Panel>
        <Panel>
          <SectionHead title="排放來源分布" subtitle="依目前篩選範圍計算" />
          <DonutChart data={categories(events)} />
        </Panel>
      </div>
      <div className="dashboard-secondary-grid">
        <Panel>
          <SectionHead
            title="部門碳排比較"
            subtitle="各部門估算排放 · kg CO₂e"
            action={
              <Link to="/admin/analytics" className="text-link">
                詳細分析 <ArrowRight size={13} />
              </Link>
            }
          />
          <CompareChart data={departmentStats(events)} />
        </Panel>
        <Panel className="device-status-panel">
          <SectionHead
            title="設備與異常通知"
            action={
              <Link to="/admin/devices" className="text-link">
                管理設備 <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="device-overview">
            <span className="device-big-icon">
              <Radio size={25} />
            </span>
            <div>
              <b>
                {online}
                <small> / 8</small>
              </b>
              <span>設備在線 · 預設狀態</span>
            </div>
            <span className="status">運作中</span>
          </div>
          {state.devices
            .filter((d) => d.status !== "在線")
            .map((d) => (
              <Link to="/admin/devices" className="alert-row" key={d.id}>
                <span
                  className={
                    d.status === "警告" ? "alert-icon amber" : "alert-icon"
                  }
                >
                  <CircleAlert size={16} />
                </span>
                <div>
                  <b>
                    {d.name}
                    {d.status === "警告" ? "電量偏低" : "連線中斷"}
                  </b>
                  <small>{d.location} · 10:30</small>
                </div>
                <ChevronRight size={15} />
              </Link>
            ))}
        </Panel>
      </div>
      <Panel className="events-panel">
        <SectionHead
          title="最近感測與活動事件"
          subtitle="依事件時間排序 · 最近 5 筆"
          action={
            <Link to="/admin/devices" className="text-link">
              檢視設備 <ArrowRight size={13} />
            </Link>
          }
        />
        <EventList
          table
          events={events
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5)}
        />
      </Panel>
    </>
  );
}
export function Analytics() {
  const { state } = useDemo();
  const [dept, setDept] = useState("全部部門");
  const [period, setPeriod] = useState("month");
  const events = selectEvents(state.events, dept, period);
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>碳排分析</h1>
          <p>依期間與部門比較排放來源。</p>
        </div>
        <AdminFilters {...{ dept, setDept, period, setPeriod }} />
      </div>
      <PowerBiAccess events={events} scope={`${dept} · ${period==='month'?'2026/10/01–10/27':'2026/10/24–10/27'}`}/>
      <DataAgent
        events={events}
        scope={`${dept} · ${period === "month" ? "2026/10/01–10/27" : "2026/10/24–10/27"}`}
      />
      <div className="metrics-grid three">
        <Metric
          label="篩選範圍估算排放"
          value={n(sum(events))}
          unit="kg CO₂e"
          icon={<Leaf size={18} />}
          change={`${events.length} 筆活動紀錄`}
        />
        <Metric
          label="另列避免排放"
          value={n(sum(events, "avoided"), 2)}
          unit="kg CO₂e"
          change="獨立統計，不直接抵銷排放"
        />
        <Metric
          label="參與部門"
          value={n(new Set(events.map((e) => e.department)).size, 0)}
          unit="個"
          change="依當前篩選條件統計"
        />
      </div>
      <div className="dashboard-chart-grid">
        <Panel>
          <SectionHead
            title={period === "month" ? "月份趨勢" : "每日趨勢"}
            subtitle="歷史彙總與當月事件分層呈現 · kg CO₂e"
          />
          <TrendChart
            data={period === "month" ? monthly(events, dept) : daily(events)}
          />
        </Panel>
        <Panel>
          <SectionHead title="排放類別比較" />
          <DonutChart data={categories(events)} />
        </Panel>
      </div>
      <div className="two-cols">
        <Panel>
          <SectionHead title="部門排放分布" />
          <CompareChart data={departmentStats(events)} />
        </Panel>
        <Panel>
          <SectionHead title="來源明細" subtitle="同一份事件資料加總" />
          <div className="category-rows">
            {categories(events).map((c, i) => (
              <div key={c.key}>
                <span>
                  <i style={{ background: chartPalette[i] }} />
                  {c.name}
                </span>
                <b>
                  {n(c.value, 2)} <small>kg CO₂e</small>
                </b>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel className="integration-panel">
        <div>
          <span className="service-kicker azure">
            同一份資料，串起 Microsoft 生態系
          </span>
          <h2>從感測、AI 到 Teams，看看每一步。</h2>
          <p>圖表使用 Recharts 與本機資料，不是真實 Power BI 嵌入。</p>
          <Link className="text-link" to="/admin/integrations">
            探索整合流程 <ArrowRight size={14} />
          </Link>
          <SimulationLabel />
        </div>
      </Panel>
    </>
  );
}
