import { ArrowRight, Check, Network } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { services } from "../../data/microsoftDemo";
import { useDemo } from "../../store/demo";
export function Integrations() {
  const [selected, setSelected] = useState<string>("document");
  const service = services.find((s) => s.id === selected)!;
  const { state } = useDemo();
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="service-kicker azure">MICROSOFT ECOSYSTEM</span>
          <h1>從一個行動，到整個工作空間。</h1>
          <p>點選流程節點，看看服務分工與目前操作如何對應。</p>
        </div>
      </div>
      <section className="integration-hero">
        <div>
          <span className="micro-label">一份共用資料，兩種行動視角</span>
          <h2>
            物聯網記錄，
            <br />
            AI 整理，App 陪你減。
          </h2>
          <p>
            從 Outlook
            待辦與回收，到桌面提醒與主管洞察；每一個操作都回到同一份事件與任務狀態。
          </p>
          <Link className="btn" to="/guide">
            體驗五段流程 <ArrowRight size={15} />
          </Link>
        </div>
        <div className="integration-live">
          <Network size={32} />
          <b>
            {state.events.length}
            <small>筆活動紀錄</small>
          </b>
          <span>
            員工 App <ArrowRight size={16} />
            企業工作台
          </span>
          <p>本地共用狀態同步 · 不代表雲端連線</p>
        </div>
      </section>
      <div className="service-explorer">
        <nav aria-label="Microsoft 流程節點">
          {services.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              aria-pressed={selected === s.id}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{s.name}</b>
                <small>{s.tag}</small>
              </div>
              <ArrowRight size={15} />
            </button>
          ))}
        </nav>
        <section className="service-detail" aria-live="polite">
          <span className="service-kicker azure">{service.tag}</span>
          <h2>{service.name}</h2>
          <p>{service.role}</p>
          <div className="service-io">
            <div>
              <small>輸入</small>
              <b>{service.input}</b>
            </div>
            <ArrowRight size={20} />
            <div>
              <small>輸出</small>
              <b>{service.output}</b>
            </div>
          </div>
          <div className="service-boundary">
            <Check size={17} />
            <div>
              <b>目前的處理方式</b>
              <p>{service.note}</p>
            </div>
          </div>
        </section>
      </div>
      <p className="fine-print">
        服務名稱用於說明整合架構與互動流程，不表示已部署、驗證或獲得 Microsoft
        背書。
      </p>
    </>
  );
}
