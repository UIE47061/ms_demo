import {
  Check,
  CheckCircle2,
  Coins,
  FileText,
  Gift,
  Leaf,
  LoaderCircle,
  Printer,
  Target,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Metric, Panel, SectionHead } from "../../components/ui";
import { departments, employees, history, sourceMeta } from "../../data/seed";
import { useDemo } from "../../store/demo";
import { categories, n, selectEvents, sum } from "../../utils/stats";
interface Report {
  month: string;
  dept: string;
  type: string;
  total: number;
  avoided: number;
  count: number;
  participants: number;
  categories: { name: string; value: number }[];
}
export function Reports() {
  const { state, notify } = useDemo();
  const [month, setMonth] = useState("2026-10");
  const [dept, setDept] = useState("全部部門");
  const [type, setType] = useState("永續行動月報");
  const [stage, setStage] = useState(-1);
  const [report, setReport] = useState<Report | null>(null);
  const token = useRef(0);
  const lock = useRef(false);
  const generating = stage >= 0 && stage < 3;
  useEffect(
    () => () => {
      token.current++;
    },
    [],
  );
  async function generate() {
    if (lock.current) return;
    lock.current = true;
    const current = ++token.current;
    const events = selectEvents(state.events, dept);
    const historical = month === "2026-09";
    const values = historical
      ? (["waste", "elevator", "travel", "digital"] as const).map((k) => ({
          name: sourceMeta[k].label,
          value: history[4][k] * (dept === "全部部門" ? 1 : 0.25),
        }))
      : categories(events);
    const snapshot: Report = {
      month,
      dept,
      type,
      total: values.reduce((a, v) => a + v.value, 0),
      avoided: historical ? 0 : sum(events, "avoided"),
      count: historical ? 0 : events.length,
      participants: historical
        ? dept === "全部部門"
          ? 12
          : 3
        : new Set(events.map((e) => e.employeeId)).size,
      categories: values,
    };
    setReport(null);
    for (let i = 0; i < 3; i++) {
      setStage(i);
      await new Promise((r) => setTimeout(r, 650));
      if (current !== token.current) return;
    }
    setStage(3);
    lock.current = false;
    setReport(snapshot);
    notify("報告已生成，可檢視或列印另存 PDF");
  }
  return (
    <>
      <div className="admin-page-head no-print">
        <div>
          <h1>ESG 報告</h1>
          <p>設定報告範圍，檢視摘要並匯出 PDF。</p>
        </div>
      </div>
      <div className="report-workspace">
        <aside className="report-settings no-print">
          <Panel>
            <SectionHead
              title="報告設定"
              subtitle="依所選範圍生成報告，支援列印與另存 PDF。"
            />
            <div className="report-controls">
              <label>
                報告月份
                <select
                  disabled={generating}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="2026-10">2026 年 10 月（截至 27 日）</option>
                  <option value="2026-09">2026 年 9 月（歷史彙總）</option>
                </select>
              </label>
              <label>
                部門範圍
                <select
                  disabled={generating}
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option>全部部門</option>
                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                報告類型
                <select
                  disabled={generating}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>永續行動月報</option>
                  <option>排放來源摘要</option>
                  <option>員工參與摘要</option>
                </select>
              </label>
              <Button disabled={generating} onClick={generate}>
                {generating ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <FileText size={16} />
                )}
                生成報告
              </Button>
            </div>
            {generating && (
              <>
                <div className="report-progress">
                  {["彙整感測事件", "核對欄位", "產生摘要"].map((s, i) => (
                    <span className={stage >= i ? "active" : ""} key={s}>
                      {stage > i ? (
                        <CheckCircle2 size={17} />
                      ) : stage === i ? (
                        <LoaderCircle className="spin" size={17} />
                      ) : (
                        <span className="step-dot" />
                      )}
                      <span>
                        {s}
                        <small className="report-service">
                          {["資料彙整", "欄位整理", "摘要整理"][i]}
                        </small>
                      </span>
                    </span>
                  ))}
                </div>
                <Button
                  secondary
                  onClick={() => {
                    token.current++;
                    lock.current = false;
                    setStage(-1);
                    notify("已取消生成報告");
                  }}
                >
                  取消生成
                </Button>
              </>
            )}
          </Panel>
        </aside>
        <section className="report-preview">
          {report ? (
            <>
              <div className="section-head no-print">
                <h2>報告預覽</h2>
                <Button secondary onClick={() => window.print()}>
                  <Printer size={16} />
                  列印 / 另存 PDF
                </Button>
              </div>
              <article className="report-document">
                <div className="report-top">
                  <span>
                    <Leaf size={23} />
                    Eco-Sensing
                  </span>
                  <span>永續行動 / {report.month.replace("-", ".")}</span>
                </div>
                <h1>
                  青禾科技股份有限公司
                  <br />
                  {report.type}
                </h1>
                <p className="report-period">
                  期間：
                  {report.month === "2026-10"
                    ? "2026/10/01–2026/10/27"
                    : "2026/09/01–2026/09/30"}
                  　｜　範圍：{report.dept}
                </p>
                <div className="report-disclaimer">
                  報告草稿 · 供內部檢視，非正式 ESG 揭露。
                </div>
                <h2>
                  01
                  {report.type === "員工參與摘要"
                    ? "員工參與概況"
                    : "永續表現摘要"}
                </h2>
                <p>
                  {report.type === "排放來源摘要"
                    ? "本摘要聚焦四類排放來源，協助辨識高占比項目與後續改善方向。"
                    : report.type === "員工參與摘要"
                      ? "本摘要聚焦團隊參與，鼓勵透過任務累積永續習慣，不依個人排放量判定績效。"
                      : "本期以員工日常行為及智慧感測流程為觀察範圍，彙整廢棄物、電梯、商務差旅及數位能耗四類來源。"}
                  所有數值均為初步估算，不代表查證後之企業溫室氣體盤查。
                </p>
                <div className="report-kpis">
                  <div>
                    <small>估算總排放</small>
                    <b>{n(report.total)}</b>
                    <span>kg CO₂e</span>
                  </div>
                  <div>
                    <small>參與員工</small>
                    <b>{report.participants}</b>
                    <span>人</span>
                  </div>
                  <div>
                    <small>另列避免排放</small>
                    <b>{n(report.avoided, 2)}</b>
                    <span>kg CO₂e</span>
                  </div>
                </div>
                <h2>02　排放來源分布</h2>
                <table>
                  <thead>
                    <tr>
                      <th>來源</th>
                      <th>估算排放（kg CO₂e）</th>
                      <th>占比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.categories.map((c) => (
                      <tr key={c.name}>
                        <td>{c.name}</td>
                        <td>{n(c.value, 2)}</td>
                        <td>
                          {report.total
                            ? n((c.value / report.total) * 100)
                            : "0.0"}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h2 id="report-findings">03　重點發現</h2>
                <p>
                  本期排放占比最高來源為「
                  {
                    report.categories
                      .slice()
                      .sort((a, b) => b.value - a.value)[0].name
                  }
                  」，建議優先檢視相關行為與紀錄完整性。
                  {report.month === "2026-10"
                    ? `本期共彙整 ${report.count} 筆活動紀錄，涵蓋 ${report.participants} 位員工。`
                    : "本期使用 9 月歷史彙總；不提供事件筆數，避免與 10 月事件重複加總。"}
                  避免排放獨立呈現，未用於抵銷估算排放；碳幣與 EXP 屬遊戲激勵。
                </p>
                <h2 id="report-advice">04　改善建議</h2>
                <ul>
                  <li>
                    差旅優先評估大眾運輸，補齊憑證日期與起訖站，提升紀錄可追溯性。
                  </li>
                  <li>持續宣導回收分類與離座節能，透過任務鼓勵參與。</li>
                  <li>
                    定期巡檢設備電量與離線狀態；正式應用前需驗證排放係數與資料品質。
                  </li>
                </ul>
                <h2 id="report-scope">05　資料範圍與限制</h2>
                <p>
                  {report.month === "2026-10"
                    ? "本月數值由目前事件快照計算；後續新增事件需重新生成報告。"
                    : "歷史月份為獨立彙總，部門分布依等比例分配。避免排放未收錄，顯示 0。"}
                  數值尚未經官方係數核驗。此報告不應作為法規申報或對外揭露依據。
                </p>
                <div className="report-bottom">
                  Eco-Sensing · 資料基準日 2026/10/27{" "}
                  <span>讓永續，成為日常。</span>
                </div>
              </article>
            </>
          ) : (
            !generating && (
              <div className="report-empty">
                <FileText size={26} />
                <h2>尚未生成報告</h2>
                <p>在設定區選擇月份與範圍，生成後可在此預覽。</p>
                <span>包含 KPI、來源分布、重點發現與改善建議</span>
              </div>
            )
          )}
        </section>
      </div>
    </>
  );
}
export function Rewards() {
  const { state, setState, notify } = useDemo();
  const [filter, setFilter] = useState("全部");
  const pending = state.redemptions.filter((r) => r.status === "待審核");
  const issued = 2840 + state.coins - 360;
  function review(id: string, status: "已核准" | "已拒絕") {
    setState((s) => ({
      ...s,
      redemptions: s.redemptions.map((r) =>
        r.id === id && r.status === "待審核" ? { ...r, status } : r,
      ),
    }));
    notify(`兌換申請${status}，狀態已儲存`);
  }
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>獎勵管理</h1>
          <p>追蹤碳幣發放與處理兌換申請。</p>
        </div>
        <span className="outlined-tag">
          <Gift size={15} />
          碳幣獎勵
        </span>
      </div>
      <div className="metrics-grid three">
        <Metric
          label="本月累計發放碳幣"
          value={n(issued, 0)}
          unit="枚"
          icon={<Coins size={18} />}
          change="歷史發放 2,840 枚 + 本次任務領獎"
        />
        <Metric
          label="待審核兌換"
          value={n(pending.length, 0)}
          unit="筆"
          icon={<Gift size={18} />}
          change={`待審核碳幣 ${pending.reduce((a, r) => a + r.coins, 0)} 枚`}
        />
        <Metric
          label="任務參與員工"
          value="12"
          unit="人"
          icon={<Target size={18} />}
          change="涵蓋全部 4 個部門"
        />
      </div>
      <Panel>
        <SectionHead
          title="獎勵兌換申請"
          subtitle="核准或拒絕後，狀態會立即更新並保留。"
          action={
            <select
              aria-label="兌換狀態"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["全部", "待審核", "已核准", "已拒絕"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          }
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>申請人</th>
                <th>兌換項目</th>
                <th>使用碳幣</th>
                <th>申請日期</th>
                <th>狀態</th>
                <th>審核操作</th>
              </tr>
            </thead>
            <tbody>
              {state.redemptions
                .filter((r) => filter === "全部" || r.status === filter)
                .map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.name}</b>
                    </td>
                    <td>{r.item}</td>
                    <td>{r.coins} 枚</td>
                    <td>{r.date.replaceAll("-", "/")}</td>
                    <td>
                      <span
                        className={`status ${r.status === "待審核" ? "warning" : r.status === "已拒絕" ? "neutral" : ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "待審核" ? (
                        <div className="review-actions">
                          <button onClick={() => review(r.id, "已核准")}>
                            <Check size={15} />
                            核准
                          </button>
                          <button onClick={() => review(r.id, "已拒絕")}>
                            <X size={15} />
                            拒絕
                          </button>
                        </div>
                      ) : (
                        <span className="muted">審核完成</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!state.redemptions.some(
            (r) => filter === "全部" || r.status === filter,
          ) && <p className="empty">目前沒有此狀態的兌換申請。</p>}
        </div>
      </Panel>
      <div className="two-cols">
        <Panel>
          <SectionHead
            title="任務參與情況"
            subtitle="歷史任務完成基準與本次互動同步加總"
          />
          {departments.map((d, i) => {
            const tasks =
              employees
                .filter((e) => e.department === d)
                .reduce((a, e) => a + e.tasks, 0) +
              (d === "產品設計部" ? state.claimed.length : 0);
            return (
              <div className="reward-participation" key={d}>
                <span>{d}</span>
                <div className="progress">
                  <i style={{ width: `${(tasks / 60) * 100}%` }} />
                </div>
                <b>{tasks}/60</b>
              </div>
            );
          })}
        </Panel>
        <Panel className="reward-info">
          <h2>獎勵計算說明</h2>
          <p>
            碳幣、EXP
            與積分用於鼓勵參與。任務獎勵不會折抵排放，不等同碳權，也不作為正式盤查依據。
          </p>
          <span className="status">申請審核</span>
        </Panel>
      </div>
    </>
  );
}
