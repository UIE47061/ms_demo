import { ArrowLeft, Monitor, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PersonalAgent } from "../../components/experience/Microsoft";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
export function Assistant() {
  const { state } = useDemo();
  const { presentation } = useExperience();
  return (
    <>
      <Link to="/app/home" className="back-link">
        <ArrowLeft size={15} />
        返回首頁
      </Link>
      <div className="page-title">
        <span className="service-kicker">ECO-SENSING · 個人助理</span>
        <h1>Eco 小幫手</h1>
        <p>從你的活動紀錄，找到下一個行動。</p>
      </div>
      <PersonalAgent />
      <Link className="agent-shortcut" to="/agent">
        <Monitor size={22} />
        <span>
          <b>Eco-Agent 桌面提醒</b>
          <small>
            {state.claimed.includes("power")
              ? "節能任務已完成"
              : presentation.teamsDeferred
                ? "提醒已暫緩"
                : "離座節能待處理"}
          </small>
        </span>
        <ChevronRight size={16} />
      </Link>
      <Link className="text-link" to="/app/trips">
        查看 Outlook 出差待辦 →
      </Link>
    </>
  );
}
