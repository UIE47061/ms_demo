import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EventList } from "../../components/Events";
import { TrendChart } from "../../components/charts";
import { ActionArt } from "../../components/experience/ActionArt";
import { GrowthCard } from "../../components/experience/Growth";
import { TeamsShortcut } from "../../components/experience/Microsoft";
import { Panel, SectionHead, SourceIcon } from "../../components/ui";
import { CURRENT_USER, missions, sourceMeta } from "../../data/seed";
import { useDemo } from "../../store/demo";
import type { Source } from "../../types";
import { daily, n, sum } from "../../utils/stats";
export function EmployeeHome() {
  const { state } = useDemo();
  const events = state.events.filter((e) => e.employeeId === CURRENT_USER);
  const total = sum(events);
  const today = sum(events.filter((e) => e.date.startsWith("2026-10-27")));
  const yesterday = sum(events.filter((e) => e.date.startsWith("2026-10-26")));
  const mission = missions.find((m) => !state.claimed.includes(m.id));
  return (
    <>
      <div className="greeting">
        <div>
          <p>10 月 27 日，星期二</p>
          <h1>早安，沐青</h1>
          <span>產品設計部 · 今天，長出一點新可能。</span>
        </div>
        <Link
          to="/app/profile"
          aria-label="查看我的個人資料"
          className="avatar"
        >
          沐
        </Link>
      </div>
      <GrowthCard />
      <section className="home-mission">
        <SectionHead
          title="今天，從這件事開始"
          action={
            <Link to="/app/missions" className="text-link">
              全部任務 <ChevronRight size={14} />
            </Link>
          }
        />
        <Link to="/app/missions" className="mission-feature">
          <div>
            <span className="mission-category">
              {mission
                ? `${sourceMeta[mission.source].label} · ${mission.difficulty}`
                : "本輪挑戰完成"}
            </span>
            <h3>{mission?.title || "每一片新葉，都有你的努力。"}</h3>
            <p>
              {mission?.description || "所有任務獎勵已領取，前往查看完成紀錄。"}
            </p>
            {mission && (
              <b>
                {mission.coins} 碳幣 <span>{mission.exp} EXP</span>
              </b>
            )}
          </div>
          <ChevronRight size={18} />
        </Link>
      </section>
      <section className="quick-scans" aria-label="登錄活動">
        <Link to="/app/trash-scan">
          <ActionArt kind="recycle" />
          <div>
            <b>掃描垃圾桶 QR</b>
            <span>記錄分類與重量</span>
          </div>
          <ChevronRight size={16} />
        </Link>
        <Link to="/app/travel-scan">
          <ActionArt kind="travel" />
          <div>
            <b>掃描差旅憑證</b>
            <span>差旅資訊與估算</span>
          </div>
          <ChevronRight size={16} />
        </Link>
      </section>
      <TeamsShortcut />
      <section
        className="employee-hero footprint-summary"
        aria-label="個人排放成果"
      >
        <div className="hero-top">
          <span>本月碳足跡</span>
          <Link className="text-link" to="/app/footprint">
            查看明細 <ArrowRight size={13} />
          </Link>
        </div>
        <div className="hero-number">
          {n(total)}
          <small>kg CO₂e</small>
        </div>
        <div className="hero-foot">
          <span>
            今日 <b>{n(today)}</b> kg CO₂e
          </span>
          <span>2026.10 · 估算排放</span>
        </div>
        <p className="hero-comparison">
          {yesterday
            ? `較昨日${today <= yesterday ? "減少" : "增加"} ${n(Math.abs(today / yesterday - 1) * 100)}% · 依每日事件估算`
            : "昨日無事件，暫不計算增減"}
        </p>
      </section>
      <Panel>
        <SectionHead
          title="近 7 日趨勢"
          subtitle="10/21–10/27 · kg CO₂e"
          action={
            <Link className="text-link" to="/app/footprint">
              查看足跡
            </Link>
          }
        />
        <TrendChart data={daily(events)} compact />
      </Panel>
      <SectionHead title="依來源查看" />
      <div className="source-grid">
        {(Object.keys(sourceMeta) as Source[]).map((source) => (
          <Link
            key={source}
            to={
              source === "travel"
                ? "/app/travel-scan"
                : source === "waste"
                  ? "/app/trash-scan"
                  : `/app/footprint?source=${source}`
            }
          >
            <SourceIcon source={source} />
            <span>{sourceMeta[source].label}</span>
          </Link>
        ))}
      </div>
      <Panel>
        <SectionHead
          title="最近活動"
          action={
            <Link to="/app/footprint" className="text-link">
              全部紀錄 <ArrowRight size={13} />
            </Link>
          }
        />
        <EventList
          events={events
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 3)}
        />
      </Panel>
      <p className="fine-print">排放、避免排放與任務獎勵各自記錄。</p>
    </>
  );
}
