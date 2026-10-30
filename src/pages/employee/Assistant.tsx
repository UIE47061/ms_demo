import { useState } from "react";
import { ArrowLeft, Check, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { PersonalAgent } from "../../components/experience/Microsoft";
import { Button } from "../../components/ui";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
import { completePowerMission } from "../../utils/experience";
export function Assistant() {
  const { state, setState, notify } = useDemo();
  const [tab, setTab] = useState("reminders");
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
        <h1>Eco 小幫手</h1>
      </div>
      <div className="segmented" aria-label="小幫手功能">
        {[
          ["reminders", "提醒"],
          ["questions", "問答"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "reminders" && (
        <>
          <section className="teams-window">
            <div className="teams-conversation">
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
                <p>
                  確認離座節能，完成今日任務。此操作只記錄任務，不會控制電腦。
                </p>
                <div className="teams-reward">
                  <b>40 碳幣</b>
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
              <details className="disclosure">
                <summary>服務與獎勵說明</summary>
                <p>
                  未傳送 Teams 訊息或控制裝置。此提醒以離座 15
                  分鐘為情境；完成後依既有規則發放 40 碳幣、60 EXP，一次為限。
                </p>
              </details>
            </footer>
          </section>
        </>
      )}
      {tab === "questions" && <PersonalAgent />}
    </>
  );
}
