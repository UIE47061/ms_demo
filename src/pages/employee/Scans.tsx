import {
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
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
import {
  InlineReward,
  ScanExit,
} from "../../components/experience/EmployeeActions";
import { readDraft, saveDraft, removeDraft } from "../../utils/scanDraft";
import { addEvent, useDemo } from "../../store/demo";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function Receipt() {
  return (
    <div className="receipt receipt-compact">
      <div className="receipt-brand">
        <span>TH</span>臺灣高鐵 <small>非有效票券</small>
      </div>
      <div className="receipt-route">
        <b>臺北</b>
        <ArrowRight size={22} />
        <b>臺中</b>
      </div>
      <div className="receipt-grid">
        <span>
          乘車日期<b>2026/10/27</b>
        </span>
        <span>
          票價<b>TWD 700</b>
        </span>
      </div>
      <details className="receipt-details">
        <summary>憑證詳細資訊</summary>
        <p>車次 0613 · 08A · 標準車廂全票</p>
      </details>
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
  const [draft] = useState(() =>
    readDraft<{ field: typeof TRAVEL_PRESET; step: number; id: string }>(
      "travel",
    ),
  );
  const [step, setStep] = useState(draft?.field ? Math.min(draft.step, 1) : 0);
  const [busy, setBusy] = useState(false);
  const [traceStage, setTraceStage] = useState(0);
  const [preview, setPreview] = useState("");
  const [field, setField] = useState(draft?.field || { ...TRAVEL_PRESET });
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
  const operation = useRef(draft?.id || crypto.randomUUID());
  const input = useRef<HTMLInputElement>(null);
  const token = useRef(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  useEffect(() => {
    if (!error) return;
    const input = document.querySelector<HTMLInputElement>(
      "#employee-content input[aria-invalid=true]",
    );
    const details = input?.closest("details");
    if (details) details.open = true;
    input?.focus();
  }, [error]);
  useEffect(() => {
    if (step === 2) removeDraft("travel");
    else if (step === 1 || manual)
      saveDraft("travel", { field, step, id: operation.current });
    else removeDraft("travel");
  }, [field, step, manual]);
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
        "請修正欄位：起訖站須不同，日期限 10/01–10/27，里程須大於 0，其餘數值不得為負。",
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
      <ScanExit
        dirty={step !== 2 && (step === 1 || manual || !!preview || busy)}
        save={() =>
          saveDraft("travel", {
            field,
            step: Math.min(step, 1),
            id: operation.current,
          })
        }
        discard={() => removeDraft("travel")}
      />
      <div className="page-title">
        <h1>登錄差旅</h1>
      </div>
      <Steps step={step} />
      {draft && step < 2 && (
        <p className="draft-notice" role="status">
          已恢復未提交資料，選取的圖片不保留。
        </p>
      )}
      {step === 0 && (
        <>
          <div className={`receipt-stage ${busy ? "is-scanning" : ""}`}>
            {preview ? <img src={preview} alt="選取的憑證圖片" /> : <Receipt />}
            {busy && <div className="scan-line" />}
          </div>
          <div className="notice">
            <ScanLine size={18} />
            <span>
              <b>憑證資訊</b>
              <br />
              {preview
                ? "選取的圖片不會用於解析；下一步載入高鐵憑證資料，請自行核對欄位。"
                : "載入高鐵憑證資料後，請核對日期、起訖站與交通方式。"}
            </span>
          </div>
          {busy ? (
            <AiTrace busy stage={traceStage} />
          ) : (
            <details className="disclosure">
              <summary>Microsoft AI 處理流程</summary>
              <AiTrace />
            </details>
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
            {busy ? "正在整理憑證…" : preview ? "載入憑證資訊" : "讀取憑證資訊"}
          </Button>
          <div className="scan-alternatives">
            <button disabled={busy} onClick={() => input.current?.click()}>
              <Upload size={15} />
              選擇憑證圖片
            </button>
            {preview && (
              <button disabled={busy} onClick={() => setPreview("")}>
                使用高鐵憑證
              </button>
            )}
            {busy && (
              <button
                onClick={() => {
                  token.current++;
                  setBusy(false);
                  lock.current = false;
                  notify("已取消，可重新開始");
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
            <span>請確認旅程資訊，必要時修改後再登錄。</span>
          </div>
          <Panel>
            <h2>確認旅程資訊</h2>
            <details className="disclosure">
              <summary>AI 處理流程與資料來源</summary>
              <AiTrace manual={manual} />
            </details>
            {manual && (
              <div className="manual-state" role="status">
                欄位已人工修改／確認，未執行官方係數或里程查核。
              </div>
            )}
            <div className="form-grid">
              <label>
                日期
                <input
                  aria-label="日期"
                  aria-describedby={error ? "travel-error-date" : undefined}
                  type="date"
                  aria-invalid={
                    !!error &&
                    (field.date < "2026-10-01" || field.date > BASE_DATE)
                  }
                  value={field.date}
                  min="2026-10-01"
                  max={BASE_DATE}
                  onChange={(e) => setField({ ...field, date: e.target.value })}
                />
                {error &&
                  (field.date < "2026-10-01" || field.date > BASE_DATE) && (
                    <small id="travel-error-date" className="field-error">
                      請選擇 10/01–10/27 的日期。
                    </small>
                  )}
              </label>
              <label>
                運具
                <input
                  aria-label="運具"
                  aria-describedby={
                    error ? "travel-error-transport" : undefined
                  }
                  aria-invalid={!!error && !field.transport.trim()}
                  value={field.transport}
                  onChange={(e) =>
                    setField({ ...field, transport: e.target.value })
                  }
                />
                {error && !field.transport.trim() && (
                  <small id="travel-error-transport" className="field-error">
                    請填寫交通方式。
                  </small>
                )}
              </label>
              <label>
                起點
                <input
                  aria-label="起點"
                  aria-describedby={error ? "travel-error-from" : undefined}
                  aria-invalid={
                    !!error &&
                    (!field.from.trim() ||
                      field.from.trim() === field.to.trim())
                  }
                  value={field.from}
                  onChange={(e) => setField({ ...field, from: e.target.value })}
                />
                {error &&
                  (!field.from.trim() ||
                    field.from.trim() === field.to.trim()) && (
                    <small id="travel-error-from" className="field-error">
                      請填寫與終點不同的起點。
                    </small>
                  )}
              </label>
              <label>
                終點
                <input
                  aria-label="終點"
                  aria-describedby={error ? "travel-error-to" : undefined}
                  aria-invalid={
                    !!error &&
                    (!field.to.trim() || field.from.trim() === field.to.trim())
                  }
                  value={field.to}
                  onChange={(e) => setField({ ...field, to: e.target.value })}
                />
                {error &&
                  (!field.to.trim() ||
                    field.from.trim() === field.to.trim()) && (
                    <small id="travel-error-to" className="field-error">
                      請填寫與起點不同的終點。
                    </small>
                  )}
              </label>
              <label className="span-2">
                估算碳排（kg CO₂e・待確認數值）
                <input
                  aria-label="估算碳排（kg CO₂e・待確認數值）"
                  aria-describedby={error ? "travel-error-emission" : undefined}
                  type="number"
                  min="0"
                  step="0.01"
                  aria-invalid={
                    !!error &&
                    (!Number.isFinite(field.emission) || field.emission < 0)
                  }
                  value={field.emission}
                  onChange={(e) =>
                    setField({ ...field, emission: Number(e.target.value) })
                  }
                />
                {error &&
                  (!Number.isFinite(field.emission) || field.emission < 0) && (
                    <small id="travel-error-emission" className="field-error">
                      請填寫非負排放數值。
                    </small>
                  )}
              </label>
            </div>
            <details className="disclosure">
              <summary>票價與里程</summary>
              <div className="form-grid">
                <label>
                  票價（TWD）
                  <input
                    aria-label="票價（TWD）"
                    aria-describedby={error ? "travel-error-fare" : undefined}
                    type="number"
                    min="0"
                    aria-invalid={
                      !!error &&
                      (!Number.isFinite(field.fare) || field.fare < 0)
                    }
                    value={field.fare}
                    onChange={(e) =>
                      setField({ ...field, fare: Number(e.target.value) })
                    }
                  />
                  {error &&
                    (!Number.isFinite(field.fare) || field.fare < 0) && (
                      <small id="travel-error-fare" className="field-error">
                        票價不得為負數。
                      </small>
                    )}
                </label>
                <label>
                  里程（km）
                  <input
                    aria-label="里程（km）"
                    aria-describedby={
                      error ? "travel-error-distance" : undefined
                    }
                    type="number"
                    min="0.1"
                    step="0.1"
                    aria-invalid={
                      !!error &&
                      (!Number.isFinite(field.distance) || field.distance <= 0)
                    }
                    value={field.distance}
                    onChange={(e) =>
                      setField({ ...field, distance: Number(e.target.value) })
                    }
                  />
                  {error &&
                    (!Number.isFinite(field.distance) ||
                      field.distance <= 0) && (
                      <small id="travel-error-distance" className="field-error">
                        里程須大於 0。
                      </small>
                    )}
                </label>
              </div>
            </details>
            <p className="fine-print">
              收據若未載明起訖站，需自行補填。碳排為初步估算，不隨里程自動計算，非正式排放係數或官方數據。
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
          <details className="disclosure">
            <summary>查看處理流程與資料來源</summary>
            <AiTrace manual={manual} />
          </details>
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
                  : `已完成大眾運輸任務，可領取 ${missions[0].coins} 碳幣。`}
            </span>
          </div>
          <InlineReward id="transit" />
          <Link
            className={
              state.claimed.includes("transit")
                ? "btn full"
                : "btn-secondary full"
            }
            to="/app/footprint?view=records"
          >
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
  const { state, setState, notify } = useDemo();
  const [draft] = useState(() =>
    readDraft<{ stage: number; id: string }>("recycle"),
  );
  const [stage, setStage] = useState(draft ? Math.min(draft.stage, 4) : -1);
  const [complete, setComplete] = useState(false);
  const [running, setRunning] = useState(false);
  const lock = useRef(false);
  const token = useRef(0);
  const id = useRef(draft?.id || crypto.randomUUID());
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [complete, running]);
  useEffect(() => {
    if (complete) removeDraft("recycle");
    else if (stage >= 0 && !running)
      saveDraft("recycle", { stage, id: id.current });
  }, [stage, running, complete]);
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
      <ScanExit
        dirty={stage >= 0 && !complete}
        save={() =>
          saveDraft("recycle", { stage: running ? -1 : stage, id: id.current })
        }
        discard={() => removeDraft("recycle")}
      />
      <div className="page-title">
        <h1>掃描回收</h1>
      </div>
      <details className="disclosure">
        <summary>裝置與資料流程</summary>
        <IoTFlow />
      </details>
      {stage === -1 && (
        <>
          <div className="qr-stage">
            <div className="qr-frame">
              <QrCode size={150} strokeWidth={1.2} />
            </div>
            <p>青禾辦公室 3F · 智慧垃圾桶 01</p>
            <small>將 QR Code 對準框內</small>
          </div>
          <Button className="full scan-primary" onClick={scan}>
            <ScanLine size={18} />
            開始回收
          </Button>
        </>
      )}
      {stage >= 0 && !complete && (
        <>
          {running && (
            <div className="scan-progress" role="status">
              <LoaderCircle className="spin" size={24} />
              <h2>{stages[stage]}</h2>
              <p>{stage + 1} / 5</p>
            </div>
          )}
          <details className="disclosure">
            <summary>查看五個處理階段</summary>
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
          </details>
          {running ? (
            <Button
              secondary
              className="full"
              onClick={() => {
                token.current++;
                setStage(-1);
                setRunning(false);
                lock.current = false;
                notify("已取消掃描");
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
          <p>寶特瓶 · 320 g 已登錄</p>
          <details className="disclosure">
            <summary>查看排放明細</summary>
            <p>
              估算排放 0.12 kg CO₂e；避免排放 0.35 kg CO₂e
              分開記錄，不互相抵銷。
            </p>
          </details>
          <InlineReward id="recycle" />
          <Link className="btn-secondary full" to="/app/missions">
            {state.claimed.includes("recycle")
              ? "查看任務"
              : "前往領取任務獎勵"}
          </Link>
          <Link className="btn-secondary full" to="/app/footprint?view=records">
            查看活動紀錄
          </Link>
          <Button
            secondary
            className="full"
            onClick={() => {
              id.current = crypto.randomUUID();
              lock.current = false;
              setStage(-1);
              removeDraft("recycle");
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
