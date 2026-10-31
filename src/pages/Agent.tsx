import { Check, Monitor, Moon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand, Button } from "../components/ui";
import { useDemo } from "../store/demo";
import { useExperience } from "../store/experience";
import { completePowerMission } from "../utils/experience";
export function Agent() {
  const { state, setState, notify } = useDemo();
  const { presentation, deferAgent } = useExperience();
  const claimed = state.claimed.includes("power");
  return (
    <div className="agent-page">
      <header>
        <Link to="/">
          <Brand />
        </Link>
        <Link className="text-link" to="/app/assistant">
          <ArrowLeft size={15} />
          回到員工 App
        </Link>
      </header>
      <main className="agent-main">
        <div className="agent-page-title">
          <span className="service-kicker azure">ECO-AGENT · 桌面節能</span>
          <h1>讓休息，也成為綠色行動。</h1>
          <p>桌面提醒與 App 任務共用進度。</p>
        </div>
        <section className="desktop-scene" aria-label="Eco-Agent 桌面工作情境">
          <div className="desktop-titlebar">
            <Monitor size={16} />
            <b>青禾工作站</b>
            <span>12:10</span>
          </div>
          <div className="desktop-work">
            <aside className="desktop-document">
              <span>工作階段摘要</span>
              <dl>
                <div>
                  <dt>提醒條件</dt>
                  <dd>離座 15 分鐘</dd>
                </div>
                <div>
                  <dt>節能任務</dt>
                  <dd>
                    {claimed
                      ? "已完成並領獎"
                      : presentation.teamsDeferred
                        ? "提醒已暫緩"
                        : "等待確認"}
                  </dd>
                </div>
                <div>
                  <dt>可用碳幣</dt>
                  <dd>{state.coins} 枚</dd>
                </div>
              </dl>
              <Link className="text-link" to="/app/footprint?view=records">
                查看個人活動 →
              </Link>
            </aside>
            <section className="agent-notification" aria-label="離座節能提醒">
              <div className="agent-notification-head">
                <Moon size={20} />
                <b>Eco-Agent</b>
                <span>
                  {claimed
                    ? "已完成"
                    : presentation.teamsDeferred
                      ? "稍後提醒"
                      : "離座 15 分鐘"}
                </span>
              </div>
              <h2>
                {claimed
                  ? "這一份節能行動，已完成。"
                  : presentation.teamsDeferred
                    ? "等你方便時，再休息一下。"
                    : "午休了，讓螢幕也休息一下。"}
              </h2>
              <p>
                確認離座節能，完成一次任務。本頁操作只更新工作空間，不會控制電腦。
              </p>
              <div className="agent-reward">
                40 碳幣 <small>＋60 EXP</small>
              </div>
              <Button
                className="full"
                disabled={claimed}
                onClick={() => {
                  if (claimed) return;
                  setState(completePowerMission);
                  deferAgent(false);
                  notify("節能任務完成：40 碳幣與 60 EXP 已入帳");
                }}
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
                    deferAgent(true);
                    notify("已暫緩提醒");
                  }}
                >
                  我還要用
                </Button>
              )}
            </section>
          </div>
          <div className="desktop-taskbar">
            <span>Eco-Sensing</span>
            <span>Eco-Agent · 工作階段</span>
          </div>
        </section>
        <div className="agent-followup">
          <Link className="btn-secondary" to="/app/missions">
            查看任務與挑戰
          </Link>
          <Link className="text-link" to="/app/assistant">
            問問 Eco 小幫手 →
          </Link>
        </div>
      </main>
    </div>
  );
}
