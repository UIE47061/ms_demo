import { Award, Check, ChevronRight, Leaf, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DonutChart, TrendChart } from "../../components/charts";
import { EventList } from "../../components/Events";
import { BossChallenge } from "../../components/experience/Growth";
import { PlantIllustration } from "../../components/experience/Illustrations";
import { TeamsShortcut } from "../../components/experience/Microsoft";
import {
  Button,
  Empty,
  Modal,
  Panel,
  ResetButton,
  SectionHead,
  SourceIcon,
} from "../../components/ui";
import {
  CURRENT_USER,
  departments,
  employees,
  missions,
  sourceMeta,
} from "../../data/seed";
import { claimReward, useDemo } from "../../store/demo";
import { categories, daily, n, sum } from "../../utils/stats";
export function Footprint() {
  const { state } = useDemo();
  const [period, setPeriod] = useState("month");
  const [search, setSearch] = useSearchParams();
  const source = search.get("source") || "all";
  const events = state.events.filter(
    (e) =>
      e.employeeId === CURRENT_USER &&
      (period === "month" || e.date >= "2026-10-24") &&
      (source === "all" || e.source === source),
  );
  return (
    <>
      <div className="page-title">
        <h1>我的碳足跡</h1>
        <p>排放總計與活動紀錄。</p>
      </div>
      <div className="segmented">
        <button
          className={period === "week" ? "active" : ""}
          onClick={() => setPeriod("week")}
        >
          本週 10/24–10/27
        </button>
        <button
          className={period === "month" ? "active" : ""}
          onClick={() => setPeriod("month")}
        >
          本月 10 月
        </button>
      </div>
      <Panel>
        <span className="muted">累計估算排放</span>
        <div className="large-number">
          {n(sum(events))}
          <small> kg CO₂e</small>
        </div>
        <DonutChart data={categories(events)} />
      </Panel>
      <div className="notice">
        <span>
          另列避免排放 <b>{n(sum(events, "avoided"), 2)} kg CO₂e</b>
          ，不抵銷上方排放，也不等於碳幣。
        </span>
      </div>
      <Panel>
        <SectionHead title="每日排放趨勢" subtitle="kg CO₂e · 估算" />
        <TrendChart data={daily(events)} compact />
      </Panel>
      <SectionHead
        title="活動時間軸"
        action={
          <select
            aria-label="來源分類"
            value={source}
            onChange={(e) =>
              setSearch(
                e.target.value === "all" ? {} : { source: e.target.value },
              )
            }
          >
            <option value="all">全部來源</option>
            {Object.entries(sourceMeta).map(([key, m]) => (
              <option value={key} key={key}>
                {m.label}
              </option>
            ))}
          </select>
        }
      />
      <Panel>
        <EventList
          events={events.slice().sort((a, b) => b.date.localeCompare(a.date))}
        />
      </Panel>
    </>
  );
}
export function Missions() {
  const { state, setState, notify } = useDemo();
  const [filter, setFilter] = useState("全部");
  const [selected, setSelected] = useState<string | null>(null);
  const active = missions.find((m) => m.id === selected);
  function status(id: string, target: number) {
    return state.claimed.includes(id)
      ? "已完成"
      : (state.progress[id] || 0) >= target
        ? "可領獎"
        : "進行中";
  }
  function claim(id: string) {
    setState((s) => claimReward(s, id));
    notify("任務獎勵已入帳，繼續累積綠色影響力！");
  }
  return (
    <>
      <div className="page-title">
        <h1>i 減碳任務</h1>
        <p>完成日常行動，累積碳幣與 EXP。</p>
      </div>
      <BossChallenge />
      <div className="reward-banner">
        <div>
          <small>可用碳幣</small>
          <b>
            {state.coins} 碳幣{" "}
            <span>
              Lv.{Math.floor(state.exp / 500) + 1} · {state.exp} EXP
            </span>
          </b>
        </div>
      </div>
      <div className="filter-chips">
        {["全部", "進行中", "可領獎", "已完成"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mission-list">
        {missions
          .filter((m) => filter === "全部" || status(m.id, m.target) === filter)
          .map((m) => (
            <Panel key={m.id}>
              <button
                className="mission-open"
                onClick={() => setSelected(m.id)}
              >
                <SourceIcon source={m.source} />
                <span>
                  <small>
                    {sourceMeta[m.source].label} · {m.difficulty}
                  </small>
                  <h3>{m.title}</h3>
                </span>
                <ChevronRight size={17} />
              </button>
              <p>{m.description}</p>
              <div className="progress">
                <i
                  style={{
                    width: `${Math.min(100, ((state.progress[m.id] || 0) / m.target) * 100)}%`,
                  }}
                />
              </div>
              <div className="mission-progress">
                <span>
                  {Math.min(state.progress[m.id] || 0, m.target)} / {m.target}
                </span>
                <span>
                  +{m.coins} 碳幣 · +{m.exp} EXP
                </span>
              </div>
              {status(m.id, m.target) === "可領獎" ? (
                <Button className="full" onClick={() => claim(m.id)}>
                  領取獎勵
                </Button>
              ) : status(m.id, m.target) === "已完成" ? (
                <span className="completed-label">
                  <Check size={15} />
                  已完成並領獎
                </span>
              ) : (
                <Button
                  secondary
                  className="full"
                  onClick={() => {
                    setState((s) => ({
                      ...s,
                      progress: { ...s.progress, [m.id]: m.target },
                    }));
                    notify("任務已完成，現在可領取獎勵");
                  }}
                >
                  完成任務
                </Button>
              )}
            </Panel>
          ))}
      </div>
      {!missions.some(
        (m) => filter === "全部" || status(m.id, m.target) === filter,
      ) && <Empty text="目前沒有此狀態的任務，試試其他分類。" />}
      <p className="fine-print">
        此頁為遊戲激勵機制，完成任務不會新增正式碳排或減碳盤查數值。
      </p>
      {active && (
        <Modal title={active.title} onClose={() => setSelected(null)}>
          <p>{active.description}</p>
          <dl className="detail-list">
            <div>
              <dt>分類</dt>
              <dd>{sourceMeta[active.source].label}</dd>
            </div>
            <div>
              <dt>進度</dt>
              <dd>
                {state.progress[active.id] || 0} / {active.target}
              </dd>
            </div>
            <div>
              <dt>狀態</dt>
              <dd>{status(active.id, active.target)}</dd>
            </div>
            <div>
              <dt>獎勵</dt>
              <dd>
                {active.coins} 碳幣 · {active.exp} EXP
              </dd>
            </div>
          </dl>
          <p className="fine-print">
            任務獎勵僅能領取一次，與估算排放分開計算。
          </p>
        </Modal>
      )}
    </>
  );
}
export function Leaderboard() {
  const { state } = useDemo();
  const [kind, setKind] = useState("個人");
  const [period, setPeriod] = useState("本月");
  const factor = period === "本週" ? 0.32 : 1;
  const rows =
    kind === "個人"
      ? employees
          .map((e) => ({
            name: e.name,
            subtitle: e.department,
            points: Math.round(
              (e.points + (e.id === CURRENT_USER ? state.exp - 680 : 0)) *
                factor,
            ),
            mine: e.id === CURRENT_USER,
          }))
          .sort((a, b) => b.points - a.points)
      : departments
          .map((d) => ({
            name: d,
            subtitle: "部門團隊積分",
            points: Math.round(
              employees
                .filter((e) => e.department === d)
                .reduce(
                  (a, e) =>
                    a +
                    e.points +
                    (e.id === CURRENT_USER ? state.exp - 680 : 0),
                  0,
                ) * factor,
            ),
            mine: d === "產品設計部",
          }))
          .sort((a, b) => b.points - a.points);
  return (
    <>
      <div className="page-title">
        <h1>綠色行動排行榜</h1>
        <p>依減碳行動積分排序。</p>
      </div>
      <div className="segmented">
        {["個人", "部門"].map((k) => (
          <button
            key={k}
            className={kind === k ? "active" : ""}
            onClick={() => setKind(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="section-head">
        <span className="muted">
          {period === "本月" ? "2026/10/01 – 10/27" : "2026/10/24 – 10/27"}
        </span>
        <select
          aria-label="排名期間"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>本月</option>
          <option>本週</option>
        </select>
      </div>
      <div className="ranking-summary">
        <span>你的排名</span>
        <strong>
          {rows.findIndex((r) => r.mine) + 1}
          <small> / {rows.length}</small>
        </strong>
        <span>依{period === "本週" ? "週" : "月"}積分計算</span>
      </div>
      <Panel>
        {rows.map((r, i) => (
          <div
            className={`ranking-row ${r.mine ? "mine" : ""} ${i < 3 ? "top-ranked" : ""}`}
            key={r.name}
          >
            <b className="ranking-number">{String(i + 1).padStart(2, "0")}</b>
            <span className="avatar small">{r.name[0]}</span>
            <div>
              <b>
                {r.name}
                {r.mine && " · 你"}
              </b>
              <small>{r.subtitle}</small>
            </div>
            <strong>
              {r.points.toLocaleString()}
              <small> 分</small>
            </strong>
          </div>
        ))}
      </Panel>
      <div className="notice">
        <span>
          排名依減碳積分，鼓勵參與與學習，不以個人排放量評定績效。週積分使用固定週期比例。
        </span>
      </div>
    </>
  );
}
export function Profile() {
  const { state, setState } = useDemo();
  const [modal, setModal] = useState("");
  return (
    <>
      <div className="page-title">
        <h1>個人與設定</h1>
      </div>
      <Panel className="profile-card">
        <span className="avatar large">沐</span>
        <h2>林沐青</h2>
        <p>青禾科技股份有限公司 · 產品設計部</p>
        <span className="status">
          Lv.{Math.floor(state.exp / 500) + 1} 綠色探索家
        </span>
        <div className="profile-stats">
          <div>
            <b>{state.coins}</b>
            <small>累積碳幣</small>
          </div>
          <div>
            <b>{state.exp}</b>
            <small>總 EXP</small>
          </div>
          <div>
            <b>{state.claimed.length}</b>
            <small>已完成任務</small>
          </div>
        </div>
      </Panel>
      <div className="profile-growth">
        <PlantIllustration leaves={state.claimed.length} />
        <div>
          <h3>你的行動，長成了新葉。</h3>
          <p>
            {state.claimed.length} / {missions.length} 項獎勵已領取
          </p>
          <Link className="text-link" to="/app/missions">
            繼續本輪挑戰 <ChevronRight size={13} />
          </Link>
        </div>
      </div>
      <TeamsShortcut />
      <SectionHead title="我的成就" />
      <div className="badges">
        {[
          { name: "綠色初心者", done: true, icon: Leaf },
          {
            name: "行動實踐家",
            done: state.claimed.length > 0,
            icon: Sparkles,
          },
          { name: "永續領航員", done: state.claimed.length >= 6, icon: Award },
        ].map((b) => (
          <div className={b.done ? "earned" : ""} key={b.name}>
            <b.icon size={27} />
            <small>{b.name}</small>
            <span>{b.done ? "已解鎖" : "尚待解鎖"}</span>
          </div>
        ))}
      </div>
      <Panel>
        <Link className="setting-row" to="/app/footprint">
          <span>我的活動紀錄</span>
          <ChevronRight size={17} />
        </Link>
        {[
          { key: "notifications" as const, label: "任務提醒（本機設定）" },
          { key: "summary" as const, label: "顯示每日摘要（本機設定）" },
        ].map((s) => (
          <div className="setting-row" key={s.key}>
            <span>{s.label}</span>
            <button
              className={`toggle ${state.settings[s.key] ? "on" : ""}`}
              role="switch"
              aria-label={s.label}
              aria-checked={state.settings[s.key]}
              onClick={() =>
                setState((v) => ({
                  ...v,
                  settings: { ...v.settings, [s.key]: !v.settings[s.key] },
                }))
              }
            >
              <i />
            </button>
          </div>
        ))}
        <button
          className="setting-row full"
          onClick={() => setModal("關於 Eco-Sensing")}
        >
          <span>關於 Eco-Sensing</span>
          <ChevronRight size={17} />
        </button>
      </Panel>
      <Panel>
        <h3>重設範例資料</h3>
        <p>重設會還原兩端的事件、任務與審核狀態。</p>
        <ResetButton />
      </Panel>
      {modal && (
        <Modal title={modal} onClose={() => setModal("")}>
          <p>員工行為碳足跡 × IoT 感測 × 減碳任務／碳幣 × 企業 ESG 管理。</p>
          <p>
            此工作空間使用本機資料，基準日為
            2026/10/27。所有人物、事件、排放與辨識結果均為本機初始資料，未連接真實
            API。
          </p>
          <p>Power BI、Microsoft Teams、Azure AI 皆為未來規劃整合。</p>
        </Modal>
      )}
    </>
  );
}
