import { ArrowRight, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OfficeIllustration } from "../../components/experience/Illustrations";
import { Brand, ResetButton } from "../../components/ui";
import { tourSteps } from "../../data/microsoftDemo";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
export function Demo() {
  const { setTour, presentation } = useExperience();
  const { state } = useDemo();
  const navigate = useNavigate();
  function start(path: string) {
    setTour(true);
    navigate(path);
  }
  return (
    <div className="showcase-page">
      <header className="showcase-header">
        <Link to="/">
          <Brand />
        </Link>
        <div>
          <Link className="text-link" to="/app/home">
            自由瀏覽員工端
          </Link>
          
        </div>
      </header>
      <main>
        <div className="demo-intro">
          <div>
            <span className="service-kicker">四段操作 · 約 90 秒行動旅程</span>
            <h1>
              一個人的小行動，
              <br />
              整個團隊的下一步。
            </h1>
            <p>
              從一張高鐵票開始，看看資料如何經過 AI 流程範例、回到
              Teams，再成為主管的洞察。
            </p>
            <button
              className="btn demo-start"
              onClick={() => start(tourSteps[0].path)}
            >
              {presentation.tourActive ? "回到第一段" : "開始行動旅程"}
              <ArrowRight size={17} />
            </button>
            <small>由你手動操作，不會自動登錄或領獎。</small>
          </div>
          <OfficeIllustration />
        </div>
        <div className="demo-step-list">
          {tourSteps.map((s, i) => (
            <button
              key={s.path}
              onClick={() => start(s.path)}
              className={`demo-step ${s.tone}`}
            >
              <span className="demo-step-no">0{i + 1}</span>
              <div>
                <small>{s.service}</small>
                <h2>{s.title}</h2>
                <p>{s.description}</p>
              </div>
              <ArrowRight size={19} />
            </button>
          ))}
        </div>
        <div className="demo-preserved">
          <Check size={18} />
          <div>
            <b>保留你目前的呈現紀錄</b>
            <p>
              目前共 {state.events.length} 筆事件、{state.claimed.length}{" "}
              項已領獎任務。開始導覽不會清除資料；需要重新呈現時，可自行重設。
            </p>
          </div>
          <ResetButton />
        </div>
      </main>
      <footer className="showcase-footer">
        <span>本機工作空間 · Microsoft 服務尚未連線</span>
        <Link to="/admin/dashboard">
          直接前往企業端 <ArrowRight size={13} />
        </Link>
      </footer>
    </div>
  );
}
