import { ArrowLeft, Check, MessageSquare, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  PersonalAgent,
  SimulationLabel,
} from "../../components/experience/Microsoft";
import { Button } from "../../components/ui";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
import { completePowerMission } from "../../utils/experience";
export function Assistant() {
  const { state, setState, notify } = useDemo();
  const { presentation, deferTeams } = useExperience();
  const claimed = state.claimed.includes("power");
  function sleep() {
    if (claimed) return;
    setState(completePowerMission);
    deferTeams(false);
    notify("節能任務完成：40 碳幣與 60 EXP 已入帳");
  }
  return (
    <>
      <Link to="/app/home" className="back-link">
        <ArrowLeft size={15} />
        返回首頁
      </Link>
      <div className="page-title">
        <span className="service-kicker teams">MICROSOFT TEAMS</span>
        <h1>工作中，也有綠色提醒。</h1>
        <p>讓日常的小決定，有一個輕鬆的開始。</p>
      </div>
      <section className="teams-window">
        <header>
          <span className="teams-mark">
            <MessageSquare size={19} />
          </span>
          <div>
            <b>Eco 小幫手</b>
            <small>Teams 提醒卡 · Copilot Studio 流程示意</small>
          </div>
        </header>
        <div className="teams-conversation">
          <span className="chat-date">2026/10/27 · 12:10</span>
          <div className="teams-adaptive-card">
            <span className="reminder-icon">
              <Moon size={23} />
            </span>
            <span className="micro-label">離座節能提醒</span>
            <h2>
              {claimed
                ? "這一份節能行動，已完成。"
                : presentation.teamsDeferred
                  ? "等你方便時，再休息一下。"
                  : "午休了，讓螢幕也休息一下。"}
            </h2>
            <p>預設離座 15 分鐘後收到提醒，讓電腦休眠，完成今天的節能任務。</p>
            <div className="teams-reward">
              <b>40 碳幣</b>
              <span>60 EXP</span>
            </div>
            <Button
              className="full teams-primary"
              disabled={claimed}
              onClick={sleep}
            >
              {claimed ? (
                <>
                  <Check size={16} />
                  本任務獎勵已領取
                </>
              ) : (
                <>
                  <Moon size={16} />
                  一鍵休眠
                </>
              )}
            </Button>
            {!claimed && (
              <Button
                secondary
                className="full"
                onClick={() => {
                  deferTeams(true);
                  notify("已暫緩提醒，沒有增加排放、EXP 或碳幣");
                }}
              >
                我還要用
              </Button>
            )}
          </div>
          {claimed && (
            <div className="teams-confirmation" role="status">
              <Check size={15} />
              任務已完成，植物與挑戰進度已同步。
              <Link to="/app/missions">查看任務</Link>
            </div>
          )}
        </div>
        <footer>
          <SimulationLabel />
          <p>
            不會控制你的電腦，也不會傳送 Teams
            訊息。獎勵沿用既有規則，只能領取一次。
          </p>
        </footer>
      </section>
      <PersonalAgent />
    </>
  );
}
