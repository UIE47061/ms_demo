import { ChevronRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { CalendarTripCard } from "../../components/experience/CalendarTrip";
import { GrowthCard } from "../../components/experience/Growth";
import { ActionArt } from "../../components/experience/ActionArt";
import {
  taskNames,
  taskRoute,
} from "../../components/experience/EmployeeActions";
import { CURRENT_USER, missions } from "../../data/seed";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
import { n, sum } from "../../utils/stats";
export function EmployeeHome() {
  const { state } = useDemo();
  const { presentation } = useExperience();
  const mission =
    missions.find(
      (m) =>
        !state.claimed.includes(m.id) &&
        (state.progress[m.id] || 0) >= m.target,
    ) || missions.find((m) => !state.claimed.includes(m.id));
  const ready = mission && (state.progress[mission.id] || 0) >= mission.target;
  return (
    <div className="home-focused">
      <div className="greeting">
        <h1>早安，沐青</h1>
        <Link
          to="/app/profile"
          aria-label="查看我的個人資料"
          className="avatar"
        >
          沐
        </Link>
      </div>
      <GrowthCard compact />
      <section className="home-actions">
        <h2>記錄行動</h2>
        <div className="quick-scans" aria-label="登錄活動">
          <Link to="/app/trash-scan" aria-label="掃描垃圾桶 QR">
            <ActionArt kind="recycle" />
            <b>掃描回收</b>
          </Link>
          <Link to="/app/travel-scan" aria-label="掃描差旅憑證">
            <ActionArt kind="travel" />
            <b>登錄差旅</b>
          </Link>
        </div>
      </section>
      <section className="home-next">
        <div className="section-head">
          <h2>今日待辦</h2>
          <Link to="/app/missions" className="text-link">
            全部任務
          </Link>
        </div>
        {presentation.tripStatus === "pending" ? (
          <CalendarTripCard compact />
        ) : mission ? (
          <Link
            className="next-action"
            to={ready ? "/app/missions?status=reward" : taskRoute(mission.id)}
          >
            <div>
              <b>{taskNames[mission.id] || mission.title}</b>
              <small>
                {ready ? "可領獎" : "完成可獲得"} · {mission.coins} 碳幣
              </small>
            </div>
            <span>
              {ready ? "去領獎" : "開始"}
              <ChevronRight size={16} />
            </span>
          </Link>
        ) : (
          <p>
            本輪任務已完成。<Link to="/app/missions">查看挑戰</Link>
          </p>
        )}
      </section>
      <Link className="home-assistant-link" to="/app/assistant">
        <MessageSquare size={16} />
        問問 Eco 小幫手
        <ChevronRight size={14} />
      </Link>
      {presentation.tripStatus !== "pending" && (
        <Link className="text-link" to="/app/trips">
          查看 Outlook 行程 →
        </Link>
      )}
      {state.settings.summary && (
        <Link to="/app/footprint" className="home-footprint">
          <span>
            本月碳足跡<small>估算排放</small>
          </span>
          <strong>
            {n(sum(state.events.filter((e) => e.employeeId === CURRENT_USER)))}
            <small> kg CO₂e</small>
          </strong>
          <ChevronRight size={16} />
        </Link>
      )}
      {state.settings.notifications &&
        !state.claimed.includes("power") &&
        !presentation.teamsDeferred && (
          <Link to="/agent" className="home-reminder">
            <MessageSquare size={17} />
            <span>節能提醒待處理</span>
            <ChevronRight size={15} />
          </Link>
        )}
    </div>
  );
}
