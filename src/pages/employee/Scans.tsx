import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Leaf,
  LoaderCircle,
  QrCode,
  ScanLine,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AiTrace, IoTFlow } from "../../components/experience/Microsoft";
import { Button, Panel } from "../../components/ui";
import { BASE_DATE, CURRENT_USER, missions } from "../../data/seed";
import { TRAVEL_PRESET } from "../../data/microsoftDemo";
import { addEvent, useDemo } from "../../store/demo";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function Receipt() {
  return (
    <div className="receipt">
      <div className="receipt-brand">
        <span>TH</span> 臺灣高鐵 <small>SAMPLE TICKET</small>
      </div>
      <div className="receipt-sub">Eco-Sensing 自製範例憑證 · 非有效票券</div>
      <div className="receipt-route">
        <b>
          臺北<small>TAIPEI</small>
        </b>
        <ArrowRight size={25} />
        <b>
          臺中<small>TAICHUNG</small>
        </b>
      </div>
      <div className="receipt-grid">
        <span>
          乘車日期<b>2026/10/27</b>
        </span>
        <span>
          車次 / 座位<b>0613 / 08A</b>
        </span>
      </div>
      <div className="receipt-bottom">
        <span>標準車廂 · 全票</span>
        <b>TWD 700</b>
      </div>
      <div className="barcode" />
      <div className="receipt-watermark">僅供流程呈現，不具乘車效力</div>
    </div>
  );
}
function Steps({ step }: { step: number }) {
  return (
    <div className="scan-steps">
      {["選擇憑證", "結果確認", "完成登錄"].map((label, i) => (
        <div className={step >= i ? "active" : ""} key={label}>
          <span>{step > i ? <Check size={13} /> : i + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
export function TravelScan() {
  const { state, setState, notify } = useDemo();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [traceStage, setTraceStage] = useState(0);
  const [preview, setPreview] = useState("");
  const [field, setField] = useState({ ...TRAVEL_PRESET });
  const manual =
    field.date !== BASE_DATE ||
    field.transport !== "臺灣高鐵" ||
    field.from !== "臺北" ||
    field.to !== "臺中" ||
    field.fare !== 700 ||
    field.distance !== 165 ||
    field.emission !== 5.8;
  const [error, setError] = useState("");
  const lock = useRef(false);
  const operation = useRef(crypto.randomUUID());
  const input = useRef<HTMLInputElement>(null);
  const token = useRef(0);
  useEffect(
    () => () => {
      token.current++;
    },
    [],
  );
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function scan() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    const current = ++token.current;
    for (let i = 0; i < 4; i++) {
      setTraceStage(i);
      await wait(400);
      if (current !== token.current) return;
    }
    setField({ ...TRAVEL_PRESET });
    setError("");
    setStep(1);
    setBusy(false);
    lock.current = false;
  }
  function submit() {
    if (lock.current) return;
    if (
      !field.from.trim() ||
      !field.to.trim() ||
      field.from.trim() === field.to.trim() ||
      !field.transport.trim() ||
      field.date < "2026-10-01" ||
      field.date > BASE_DATE ||
      ![field.fare, field.distance, field.emission].every(
        (v) => Number.isFinite(v) && v >= 0,
      ) ||
      field.distance === 0
    ) {
      setError(
        "請填寫有效且不同的起訖站、運具、10/01–10/27 日期與非負數值；里程須大於 0。",
      );
      return;
    }
    lock.current = true;
    setState((s) =>
      addEvent(s, {
        id: operation.current,
        employeeId: CURRENT_USER,
        department: "產品設計部",
        source: "travel",
        title: `${field.transport}差旅・${field.from} → ${field.to}`,
        date: `${field.date}T14:30:00`,
        emission: field.emission,
        avoided: 0,
        detail: `TWD ${field.fare} · ${field.distance} km · 人工確認`,
        mock: true,
      }),
    );
    setStep(2);
    notify("差旅已登錄，碳足跡與企業總覽已同步更新");
  }
  return (
    <>
      <Link to="/app/home" className="back-link">
        <ArrowLeft size={16} />
        返回首頁
      </Link>
      <div className="page-title">
        <h1>差旅憑證掃描</h1>
        <p>選擇憑證、確認資訊，再登錄差旅。</p>
      </div>
      <Steps step={step} />
      {step === 0 && (
        <>
          <div className={`receipt-stage ${busy ? "is-scanning" : ""}`}>
            {preview ? (
              <img src={preview} alt="你選擇的圖片，僅本機預覽" />
            ) : (
              <Receipt />
            )}
            {busy && <div className="scan-line" />}
          </div>
          <div className="notice">
            <ScanLine size={18} />
            <span>
              <b>憑證資訊預覽</b>
              <br />
              {preview
                ? "此圖片僅供本機預覽。下一步將載入預設高鐵範例，並非此圖片的辨識結果。"
                : "使用自製高鐵範例憑證，載入對應的預設結果。未使用真實 OCR。"}
            </span>
          </div>
          {busy ? (
            <AiTrace busy stage={traceStage} />
          ) : (
            <div className="scan-service-note">
              <span className="service-kicker azure">
                Document Intelligence → Foundry
              </span>
              <small>先載入憑證，再看 AI 核算接力範例。</small>
            </div>
          )}
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            aria-label="選擇圖片"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (!f.type.startsWith("image/")) {
                  notify("請選擇圖片檔案");
                  return;
                }
                if (f.size > 10 * 1024 * 1024) {
                  notify("請使用 10 MB 以下的圖片");
                  return;
                }
                setPreview(URL.createObjectURL(f));
              }
            }}
          />
          <Button className="full scan-primary" onClick={scan} disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <ScanLine size={18} />
            )}{" "}
            {busy
              ? "正在整理憑證…"
              : preview
                ? "載入預設憑證資訊"
                : "讀取憑證資訊"}
          </Button>
          <div className="scan-alternatives">
            <button disabled={busy} onClick={() => input.current?.click()}>
              <Upload size={15} />
              選擇本機圖片預覽
            </button>
            {preview && (
              <button disabled={busy} onClick={() => setPreview("")}>
                改用範例憑證
              </button>
            )}
            {busy && (
              <button
                onClick={() => {
                  token.current++;
                  setBusy(false);
                  lock.current = false;
                  notify("已取消預設辨識，可重新開始");
                }}
              >
                取消流程
              </button>
            )}
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="notice">
            <CheckCircle2 size={18} />
            <span>已載入預設範例結果。請檢查並修改欄位後登錄。</span>
          </div>
          <Panel>
            <h2>確認旅程資訊</h2>
            <AiTrace manual={manual} />
            {manual && (
              <div className="manual-state" role="status">
                欄位已人工修改／確認，未執行官方係數或里程查核。
              </div>
            )}
            <div className="form-grid">
              <label>
                日期
                <input
                  type="date"
                  value={field.date}
                  min="2026-10-01"
                  max={BASE_DATE}
                  onChange={(e) => setField({ ...field, date: e.target.value })}
                />
              </label>
              <label>
                運具
                <input
                  value={field.transport}
                  onChange={(e) =>
                    setField({ ...field, transport: e.target.value })
                  }
                />
              </label>
              <label>
                起點
                <input
                  value={field.from}
                  onChange={(e) => setField({ ...field, from: e.target.value })}
                />
              </label>
              <label>
                終點
                <input
                  value={field.to}
                  onChange={(e) => setField({ ...field, to: e.target.value })}
                />
              </label>
              <label>
                票價（TWD）
                <input
                  type="number"
                  min="0"
                  value={field.fare}
                  onChange={(e) =>
                    setField({ ...field, fare: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                里程（km）
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={field.distance}
                  onChange={(e) =>
                    setField({ ...field, distance: Number(e.target.value) })
                  }
                />
              </label>
              <label className="span-2">
                估算碳排（kg CO₂e・待確認數值）
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={field.emission}
                  onChange={(e) =>
                    setField({ ...field, emission: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <p className="fine-print">
              收據若未載明起訖站，需自行補填。碳排為呈現數據，不隨里程自動計算，非正式排放係數或官方數據。
            </p>
          </Panel>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button className="full scan-primary" onClick={submit}>
            確認登錄 <ArrowRight size={17} />
          </Button>
          <Button
            secondary
            className="full"
            onClick={() => {
              setStep(0);
              setError("");
            }}
          >
            返回選擇憑證
          </Button>
        </>
      )}
      {step === 2 && (
        <div className="scan-success">
          <div className="success-ring">
            <Check size={40} />
          </div>
          <h1>旅程已記錄！</h1>
          <AiTrace manual={manual} />
          <p>本次排放與任務進度已更新。</p>
          <Panel>
            <span>本次估算排放</span>
            <strong>
              {field.emission}
              <small> kg CO₂e</small>
            </strong>
            <p>
              {field.from} → {field.to} · {field.transport}
            </p>
          </Panel>
          <div className="notice">
            <Coins size={18} />
            <span>
              {!/高鐵|臺鐵|台鐵|捷運|公車|火車|大眾運輸/.test(field.transport)
                ? "此運具不符合大眾運輸任務，僅登錄排放，不增加任務進度。"
                : state.claimed.includes("transit")
                  ? "本任務獎勵已領取，不會重複發放。"
                  : `已推進大眾運輸任務，可至任務頁領取 ${missions[0].coins} 碳幣與 ${missions[0].exp} EXP。`}
            </span>
          </div>
          <Link className="btn full" to="/app/footprint">
            查看碳足跡 <ArrowRight size={17} />
          </Link>
          <Link className="btn-secondary full" to="/app/missions">
            查看任務獎勵
          </Link>
          <Button
            secondary
            className="full"
            onClick={() => {
              operation.current = crypto.randomUUID();
              lock.current = false;
              setStep(0);
              setPreview("");
            }}
          >
            再掃一張
          </Button>
        </div>
      )}
    </>
  );
}
const stages = [
  "已建立工作階段",
  "感測中",
  "分類確認",
  "秤重完成",
  "碳排入帳待確認",
];
export function TrashScan() {
  const { setState, notify } = useDemo();
  const [stage, setStage] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [running, setRunning] = useState(false);
  const lock = useRef(false);
  const token = useRef(0);
  const id = useRef(crypto.randomUUID());
  useEffect(
    () => () => {
      token.current++;
    },
    [],
  );
  async function scan() {
    if (lock.current) return;
    lock.current = true;
    setRunning(true);
    const current = ++token.current;
    for (let i = 0; i < 5; i++) {
      if (current !== token.current) return;
      setStage(i);
      await wait(650);
    }
    if (current !== token.current) return;
    setRunning(false);
    lock.current = false;
  }
  function save() {
    if (lock.current) return;
    lock.current = true;
    setState((s) =>
      addEvent(s, {
        id: id.current,
        employeeId: CURRENT_USER,
        department: "產品設計部",
        source: "waste",
        title: "智慧垃圾桶・寶特瓶分類回收",
        date: `${BASE_DATE}T15:00:00`,
        emission: 0.12,
        avoided: 0.35,
        detail: "寶特瓶 320 g · IoT 資料流程",
        mock: true,
      }),
    );
    setComplete(true);
    notify("回收事件已登錄，可至任務頁領獎");
  }
  return (
    <>
      <Link to="/app/home" className="back-link">
        <ArrowLeft size={16} />
        返回首頁
      </Link>
      <div className="page-title">
        <h1>掃描垃圾桶 QR</h1>
        <p>預設掃碼並確認回收結果。</p>
      </div>
      <div className="notice">
        <Leaf size={18} />
        <span>
          <b>IoT 資料流程</b>
          <br />
          沒有連線真實裝置；辨識、秤重與碳排皆為預設預設。
        </span>
      </div>
      <IoTFlow />
      {stage === -1 && (
        <>
          <div className="qr-stage">
            <div className="qr-frame">
              <QrCode size={150} strokeWidth={1.2} />
            </div>
            <p>青禾辦公室 3F · 智慧垃圾桶 01</p>
            <small>將 QR Code 對準框內（示意）</small>
          </div>
          <Button className="full scan-primary" onClick={scan}>
            <ScanLine size={18} />
            開始回收
          </Button>
        </>
      )}
      {stage >= 0 && !complete && (
        <>
          <Panel>
            <h2>回收工作階段</h2>
            <div className="process-list">
              {stages.map((s, i) => (
                <div className={stage >= i ? "active" : ""} key={s}>
                  <span>
                    {stage > i || (stage === 4 && !running) ? (
                      <Check size={15} />
                    ) : stage === i ? (
                      <LoaderCircle className="spin" size={15} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <b>{s}</b>
                  <small>
                    {stage > i || (stage === 4 && !running)
                      ? "已完成"
                      : stage === i
                        ? "處理中"
                        : "等待中"}
                  </small>
                </div>
              ))}
            </div>
          </Panel>
          {running ? (
            <Button
              secondary
              className="full"
              onClick={() => {
                token.current++;
                setStage(-1);
                setRunning(false);
                lock.current = false;
                notify("已取消預設掃描");
              }}
            >
              取消掃描
            </Button>
          ) : (
            <>
              <Panel>
                <h2>回收結果確認</h2>
                <dl className="detail-list">
                  <div>
                    <dt>物品類別</dt>
                    <dd>寶特瓶（塑膠類）</dd>
                  </div>
                  <div>
                    <dt>重量</dt>
                    <dd>320 g</dd>
                  </div>
                  <div>
                    <dt>估算排放</dt>
                    <dd>0.12 kg CO₂e</dd>
                  </div>
                  <div>
                    <dt>避免排放（另列）</dt>
                    <dd>0.35 kg CO₂e</dd>
                  </div>
                  <div>
                    <dt>時間</dt>
                    <dd>2026/10/27 15:00</dd>
                  </div>
                  <div>
                    <dt>可解鎖任務獎勵</dt>
                    <dd>50 碳幣 · 80 EXP</dd>
                  </div>
                </dl>
              </Panel>
              <Button className="full scan-primary" onClick={save}>
                確認碳排入帳 <Check size={18} />
              </Button>
            </>
          )}
        </>
      )}
      {complete && (
        <div className="scan-success">
          <div className="success-ring">
            <Check size={40} />
          </div>
          <h1>回收成功，好事發生。</h1>
          <p>
            0.12 kg CO₂e 已登錄；0.35 kg 避免排放分開記錄。
            <br />
            分類回收任務已更新，獎勵需至任務頁領取。
          </p>
          <Link className="btn full" to="/app/missions">
            前往領取任務獎勵
          </Link>
          <Link className="btn-secondary full" to="/app/footprint">
            查看活動紀錄
          </Link>
          <Button
            secondary
            className="full"
            onClick={() => {
              id.current = crypto.randomUUID();
              lock.current = false;
              setStage(-1);
              setComplete(false);
            }}
          >
            再掃一次
          </Button>
        </div>
      )}
    </>
  );
}
