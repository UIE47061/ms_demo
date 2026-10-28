import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { OfficeIllustration } from "../components/experience/Illustrations";
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
          <Link to="/demo">行動旅程</Link>
          <Link to="/app/home">員工端</Link>
          <Link to="/admin/dashboard">
            企業端 <ArrowUpRight size={13} />
          </Link>
        </nav>
        
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="service-kicker">員工行動 × Microsoft 生態系</span>
            <h1>
              辦公室打怪：
              <br />
              <em>碳排放大魔王。</em>
            </h1>
            <p>
              讓每一趟旅程、每一次回收，
              <br />
              長成看得見的綠色日常。
            </p>
            <div className="landing-hero-actions">
              <Link className="btn" to="/demo">
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
            <span className="scene-caption">
              青禾辦公室 · 每個人，都有自己的行動起點
            </span>
            <OfficeIllustration />
            <div className="scene-note">
              <span className="scene-note-dot" />
              <span>物聯網記錄 · AI 整理 · Teams 陪你減</span>
            </div>
          </div>
        </section>
        <section className="landing-story">
          <div>
            <span className="micro-label">不只是一張碳排報表</span>
            <h2>
              四個日常，
              <br />
              串成一個完整的工作體驗。
            </h2>
          </div>
          <p>
            員工得到回饋，主管看懂數據。
            <br />
            用一段可操作的範例，認識 Eco-Sensing。
          </p>
        </section>
        <div className="scenario-grid">
          {tourSteps.map((s, i) => (
            <Link className={`scenario ${s.tone}`} key={s.path} to={s.path}>
              <span className="scenario-no">0{i + 1}</span>
              <span className="scenario-service">{s.service}</span>
              <h3>{s.title}</h3>
              <p>
                {
                  [
                    "拍一張範例車票，看見 AI 接力。",
                    "完成分類回收，記錄今天的行動。",
                    "午休提醒一下，節能變得自然。",
                    "從同一份資料，找到下一步。",
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
        <span>
          2026/10/27 · 青禾科技（範例）
          <small>
            目前使用本機資料；Microsoft 雲端服務與裝置尚未連線。
          </small>
        </span>
        <ResetButton />
      </footer>
    </div>
  );
}
