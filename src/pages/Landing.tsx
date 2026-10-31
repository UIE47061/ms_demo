import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  OfficePlayground,
  ActionArt,
  type ActionKind,
} from "../components/experience/ActionArt";
import { Brand, ResetButton } from "../components/ui";
import { tourSteps } from "../data/microsoftDemo";
export function Landing() {
  return (
    <div className="showcase-page landing-v3">
      <header className="showcase-header">
        <Link to="/" aria-label="Eco-Sensing 首頁">
          <Brand />
        </Link>
        <nav aria-label="主要導覽">
          <Link to="/guide">行動旅程</Link>
          <Link to="/app/home">員工端</Link>
          <Link to="/admin/dashboard">
            企業端 <ArrowUpRight size={13} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="service-kicker">
              辦公室打怪計畫 · MICROSOFT 生態系
            </span>
            <h1>
              把減碳，
              <br />
              變成你的<em>主場。</em>
            </h1>
            <p>
              讓每一趟旅程、每一次回收，
              <br />
              長成看得見的綠色日常。
            </p>
            <div className="landing-hero-actions">
              <Link className="btn" to="/guide">
                開始探索 <ArrowRight size={17} />
              </Link>
              <Link className="text-link" to="/app/home">
                進入員工端 <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="hero-proof">
              <span>01 記錄</span>
              <i />
              <span>02 行動</span>
              <i />
              <span>03 看見改變</span>
            </div>
          </div>
          <div className="landing-scene">
            <OfficePlayground />
          </div>
        </section>
        <section className="landing-story">
          <div>
            <span className="micro-label">不只是一張碳排報表</span>
            <h2>
              五個行動，
              <br />
              串成一個完整的工作體驗。
            </h2>
          </div>
          <p>
            員工得到回饋，主管看懂數據。
            <br />
            從通勤到下班，每一個選擇都有回饋。
          </p>
        </section>
        <div className="scenario-grid">
          {tourSteps.map((s, i) => (
            <Link className={`scenario ${s.tone}`} key={s.path} to={s.path}>
              <span className="scenario-no">0{i + 1}</span>
              <span className="scenario-service">{s.service}</span>
              <ActionArt kind={s.art as ActionKind} />
              <h3>{s.title}</h3>
              <p>
                {
                  [
                    "從行事曆找到出差，回程補上車票。",
                    "核對旅程、計算依據與資料來源。",
                    "完成分類回收，記錄今天的行動。",
                    "在電腦收到提醒，回到 App 看見回饋。",
                    "比較部門、處理異常，開啟 Power BI。",
                  ][i]
                }
              </p>
              <span className="scenario-action">
                體驗流程 <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
        <section className="landing-workspaces">
          <div>
            <span className="service-kicker">一份資料，兩個工作空間</span>
            <h2>
              參與的樂趣，
              <br />
              管理的清楚。
            </h2>
          </div>
          <div>
            <Link to="/app/home">
              <b>我的綠色夥伴</b>
              <span>花盆成長、任務、碳幣與足跡</span>
              <ArrowUpRight size={19} />
            </Link>
            <Link to="/admin/dashboard">
              <b>進入企業端</b>
              <span>部門分析、設備、報告與獎勵管理</span>
              <ArrowUpRight size={19} />
            </Link>
            <Link to="/admin/integrations">
              <b>Microsoft 流程探索</b>
              <span>看看每個服務在體驗中的位置</span>
              <ArrowUpRight size={19} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="showcase-footer">
        <span>2026/10/27 · 青禾科技</span>
        <ResetButton />
      </footer>
    </div>
  );
}
