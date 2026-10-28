import {
  ArrowRight,
  Check,
  Cpu,
  FileSearch,
  Layers3,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DATASET } from "../../data/microsoftDemo";
import { useDemo } from "../../store/demo";
import type { CarbonEvent } from "../../types";
import {
  managerAnswer,
  managerQuestions,
  personalAnswer,
  personalQuestions,
  type DemoAnswer,
} from "../../utils/experience";
export function SimulationLabel() {
  return <span className="simulation-label">本機預覽模式</span>;
}
export function AnswerPanel({
  answer,
  events,
}: {
  answer: DemoAnswer;
  events: CarbonEvent[];
}) {
  const related = events.filter((e) => answer.eventIds.includes(e.id));
  return (
    <div className="agent-answer" role="status" aria-live="polite">
      <span className="agent-answer-label">根據目前資料</span>
      <h3>{answer.heading}</h3>
      <p>{answer.text}</p>
      <div className="answer-source">{answer.source}</div>
      {related.length > 0 && (
        <details className="answer-evidence">
          <summary>查看參考事件（{related.length}）</summary>
          <ul>
            {related.map((e) => (
              <li key={e.id}>
                <b>{e.title}</b>
                <span>
                  {e.date.slice(5, 16).replace("T", " ")} ·{" "}
                  {e.emission.toFixed(2)} kg CO₂e
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
export function DataAgent({
  events,
  scope,
}: {
  events: CarbonEvent[];
  scope: string;
}) {
  const [question, setQuestion] = useState(0);
  return (
    <section className="data-agent" aria-label="主管 Data Agent 範例">
      <div className="microsoft-section-head">
        <div>
          <span className="service-kicker gold">POWER BI + FABRIC</span>
          <h2>讓數據，回答下一個問題。</h2>
        </div>
        <SimulationLabel />
      </div>
      <div className="agent-workspace">
        <div className="agent-questions">
          <span className="micro-label">選擇一個問題</span>
          {managerQuestions.map((q, i) => (
            <button
              key={q}
              aria-pressed={i === question}
              onClick={() => setQuestion(i)}
            >
              {q}
              <ArrowRight size={14} />
            </button>
          ))}
          <p>
            預設問題由本地事件計算，非通用 AI。圖表由 Recharts 呈現，非 Power BI
            嵌入。
          </p>
        </div>
        <AnswerPanel
          answer={managerAnswer(question, events, scope)}
          events={events}
        />
      </div>
    </section>
  );
}
export function PersonalAgent() {
  const { state } = useDemo();
  const [question, setQuestion] = useState(0);
  return (
    <section className="personal-agent">
      <div className="section-head">
        <h2>問問 Eco 小幫手</h2>
        <span className="micro-label">預設問題範例</span>
      </div>
      <div className="personal-question-list">
        {personalQuestions.map((q, i) => (
          <button
            key={q}
            onClick={() => setQuestion(i)}
            aria-pressed={question === i}
          >
            {q}
          </button>
        ))}
      </div>
      <AnswerPanel
        answer={personalAnswer(question, state)}
        events={state.events}
      />
    </section>
  );
}
const agents = [
  { name: "票面欄位", service: "Document Intelligence", Icon: FileSearch },
  { name: "解析代理人", service: "Microsoft Foundry", Icon: Cpu },
  { name: "參考資料", service: "Azure AI Search", Icon: Layers3 },
  { name: "欄位校驗", service: "Microsoft Foundry", Icon: ShieldCheck },
];
export function AiTrace({
  stage = 3,
  busy = false,
  manual = false,
}: {
  stage?: number;
  busy?: boolean;
  manual?: boolean;
}) {
  return (
    <section className="ai-trace" aria-label="差旅資訊與估算">
      <div className="trace-heading">
        <span className="service-kicker azure">MICROSOFT AI 接力</span>
        <SimulationLabel />
      </div>
      <ol>
        {agents.map(({ name, service, Icon }, i) => (
          <li key={name} className={stage >= i ? "active" : ""}>
            <span>
              {stage > i || (!busy && stage >= i) ? (
                <Check size={13} />
              ) : (
                <Icon size={13} />
              )}
            </span>
            <div>
              <b>{name}</b>
              <small>{service}</small>
            </div>
            {busy && stage === i && <i className="trace-current" />}
          </li>
        ))}
      </ol>
      {!busy && (
        <details className="dataset-note">
          <summary>查看資料來源{manual ? " · 已人工修改" : ""}</summary>
          <b>
            {DATASET.name} · {DATASET.version}
          </b>
          <p>
            {DATASET.description}此處說明服務分工，沒有執行真實 OCR、RAG
            或官方里程查核。
            {manual
              ? "目前欄位已由使用者人工確認，數值不宣稱經過 AI 或官方驗證。"
              : "預設憑證：2026/10/27，臺灣高鐵，臺北 → 臺中，TWD 700，165 km，5.8 kg CO₂e。"}
          </p>
        </details>
      )}
    </section>
  );
}
export function IoTFlow() {
  return (
    <div className="iot-flow">
      <span className="service-kicker">IoT 資料流程</span>
      <div>
        <span>智慧垃圾桶</span>
        <ArrowRight size={12} />
        <span>IoT Hub</span>
        <ArrowRight size={12} />
        <span>處理與歸戶</span>
        <ArrowRight size={12} />
        <span>個人紀錄</span>
      </div>
      <small>全部階段為本機資料，未連接真實裝置。</small>
    </div>
  );
}
export function TeamsShortcut() {
  return (
    <Link className="teams-shortcut" to="/app/assistant">
      <span className="teams-mark">
        <MessageSquare size={18} />
      </span>
      <div>
        <b>Eco 小幫手在 Teams 等你</b>
        <small>試試離座提醒與個人問答 · 範例</small>
      </div>
      <ArrowRight size={16} />
    </Link>
  );
}
