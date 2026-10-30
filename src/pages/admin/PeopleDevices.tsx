import { ChevronRight, MapPin, Plus, Radio, Search, Users } from "lucide-react";
import { useState } from "react";
import { Button, Empty, Modal, Panel, SourceIcon } from "../../components/ui";
import { departments, employees, sourceMeta } from "../../data/seed";
import { addEvent, useDemo } from "../../store/demo";
import type { Device } from "../../types";
import { dateTime } from "../../utils/stats";
export function People() {
  const { state } = useDemo();
  const [tab, setTab] = useState("部門");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("全部部門");
  const [selected, setSelected] = useState("");
  const chosen = employees.find((e) => e.id === selected);
  const allDept = departments.filter(
    (d) => (dept === "全部部門" || d === dept) && d.includes(query),
  );
  const people = employees.filter(
    (e) =>
      (dept === "全部部門" || e.department === dept) &&
      (e.name + e.department).includes(query),
  );
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>員工與部門</h1>
          <p>管理團隊名單與永續任務參與。</p>
        </div>
        <span className="outlined-tag">
          <Users size={15} />4 個部門 · 12 位員工
        </span>
      </div>
      <Panel>
        <div className="people-controls">
          <div className="segmented">
            <button
              className={tab === "部門" ? "active" : ""}
              onClick={() => setTab("部門")}
            >
              部門名單
            </button>
            <button
              className={tab === "員工" ? "active" : ""}
              onClick={() => setTab("員工")}
            >
              員工名單
            </button>
          </div>
          <div className="admin-filters">
            <label>
              <Search size={16} />
              <input
                placeholder="搜尋姓名或部門"
                aria-label="搜尋姓名或部門"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="篩選部門"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              <option>全部部門</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        {tab === "部門" ? (
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="部門參與明細"
          >
            <table className="department-table">
              <thead>
                <tr>
                  <th>部門</th>
                  <th>成員</th>
                  <th>參與率</th>
                  <th>任務完成</th>
                  <th>激勵積分</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {allDept.map((d) => {
                  const members = employees.filter((e) => e.department === d);
                  const participated = new Set(
                    state.events
                      .filter((e) => e.department === d)
                      .map((e) => e.employeeId),
                  ).size;
                  const tasks =
                    members.reduce((a, e) => a + e.tasks, 0) +
                    (d === "產品設計部" ? state.claimed.length : 0);
                  return (
                    <tr key={d}>
                      <td>
                        <b>{d}</b>
                      </td>
                      <td>3 人</td>
                      <td>
                        <div className="table-progress">
                          <span>{Math.round((participated / 3) * 100)}%</span>
                          <div className="progress">
                            <i
                              style={{ width: `${(participated / 3) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-task">
                          <b>{tasks} / 60</b>
                          <span>{Math.round((tasks / 60) * 100)}%</span>
                        </div>
                      </td>
                      <td className="numeric">
                        {members.reduce((a, e) => a + e.points, 0) +
                          (d === "產品設計部" ? state.exp - 680 : 0)}
                      </td>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => setSelected(d)}
                          aria-label={`查看${d}詳情`}
                        >
                          查看詳情 <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!allDept.length && <Empty />}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>員工</th>
                  <th>部門</th>
                  <th>已完成任務</th>
                  <th>激勵積分</th>
                  <th>詳情</th>
                </tr>
              </thead>
              <tbody>
                {people.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className="person-name">
                        <span className="avatar small">{e.name[0]}</span>
                        <b>{e.name}</b>
                      </span>
                    </td>
                    <td>{e.department}</td>
                    <td>
                      {e.tasks + (e.id === "e01" ? state.claimed.length : 0)} 次
                    </td>
                    <td>
                      {e.points + (e.id === "e01" ? state.exp - 680 : 0)} 分
                    </td>
                    <td>
                      <button
                        className="text-link"
                        onClick={() => setSelected(e.id)}
                      >
                        查看 <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!people.length && (
              <Empty text="沒有符合的員工，請調整搜尋條件。" />
            )}
          </div>
        )}
      </Panel>
      <div className="notice">
        <Users size={19} />
        <span>
          以團隊參與與激勵成果為主；不呈現個人即時位置、工作內容或監控資訊，積分不作為績效評定。
        </span>
      </div>
      {selected && (
        <Modal
          title={chosen ? chosen.name : selected}
          onClose={() => setSelected("")}
        >
          <p>
            {chosen
              ? `${chosen.department} · 青禾科技團隊成員`
              : "青禾科技團隊永續參與摘要"}
          </p>
          <dl className="detail-list">
            <div>
              <dt>參與任務</dt>
              <dd>
                {chosen
                  ? chosen.tasks +
                    (chosen.id === "e01" ? state.claimed.length : 0)
                  : employees
                      .filter((e) => e.department === selected)
                      .reduce((a, e) => a + e.tasks, 0) +
                    (selected === "產品設計部" ? state.claimed.length : 0)}{" "}
                次
              </dd>
            </div>
            <div>
              <dt>激勵積分</dt>
              <dd>
                {chosen
                  ? chosen.points + (chosen.id === "e01" ? state.exp - 680 : 0)
                  : employees
                      .filter((e) => e.department === selected)
                      .reduce((a, e) => a + e.points, 0) +
                    (selected === "產品設計部" ? state.exp - 680 : 0)}{" "}
                分
              </dd>
            </div>
            <div>
              <dt>資料類型</dt>
              <dd>資料彙總</dd>
            </div>
          </dl>
        </Modal>
      )}
    </>
  );
}
export function Devices() {
  const { state, setState, notify } = useDemo();
  const [filter, setFilter] = useState("全部");
  const [selected, setSelected] = useState<string | null>(null);
  const device = state.devices.find((d) => d.id === selected);
  function receive(d: Device) {
    const id = crypto.randomUUID();
    setState((s) => {
      const next = addEvent(s, {
        id,
        employeeId: "e01",
        department: "產品設計部",
        source: d.source,
        title: `${d.name}・接收事件`,
        date: "2026-10-27T16:00:00",
        emission:
          d.source === "waste" ? 0.16 : d.source === "elevator" ? 0.8 : 2.4,
        avoided: d.source === "waste" ? 0.2 : 0,
        detail: `${d.location} · 裝置回報`,
        mock: true,
      });
      return {
        ...next,
        devices: next.devices.map((x) =>
          x.id === d.id ? { ...x, lastEvent: "2026-10-27T16:00:00" } : x,
        ),
      };
    });
    notify("已接收 1 筆活動紀錄，兩端統計已同步");
  }
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>IoT 設備管理</h1>
          <p>查看設備狀態、最後事件與感測資訊。</p>
        </div>
        <span className="outlined-tag">
          <Radio size={15} />
          IoT 資料流程
        </span>
      </div>
      <div className="device-summary">
        <span>
          <i className="status-dot green" />
          {state.devices.filter((d) => d.status === "在線").length} 在線
        </span>
        <span>
          <i className="status-dot amber" />1 警告
        </span>
        <span>
          <i className="status-dot gray" />1 離線
        </span>
      </div>
      <div className="filter-chips">
        {["全部", "在線", "警告", "離線"].map((f) => (
          <button
            className={filter === f ? "active" : ""}
            key={f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <section className="devices-grid panel">
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="設備清單"
        >
          <table className="device-table">
            <thead>
              <tr>
                <th>設備 / 編號</th>
                <th>位置</th>
                <th>狀態</th>
                <th>電量</th>
                <th>最後事件</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {state.devices
                .filter((d) => filter === "全部" || d.status === filter)
                .map((d) => (
                  <tr key={d.id}>
                    <td data-label="設備">
                      <button
                        className="device-name"
                        onClick={() => setSelected(d.id)}
                      >
                        <SourceIcon source={d.source} />
                        <span>
                          <b>{d.name}</b>
                          <small>
                            {d.id.toUpperCase()} · {sourceMeta[d.source].label}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td data-label="位置">{d.location}</td>
                    <td data-label="狀態">
                      <span
                        className={`status ${d.status === "警告" ? "warning" : d.status === "離線" ? "neutral" : ""}`}
                      >
                        <i />
                        {d.status}
                      </span>
                    </td>
                    <td data-label="電量" className="numeric">
                      <span className={d.battery < 20 ? "battery-low" : ""}>
                        {d.battery}%
                      </span>
                    </td>
                    <td data-label="最後事件" className="numeric">
                      {dateTime(d.lastEvent)}
                    </td>
                    <td className="device-row-actions">
                      <div className="device-row-buttons">
                        <Button secondary onClick={() => setSelected(d.id)}>
                          設備詳情
                        </Button>
                        <Button
                          secondary
                          disabled={d.status === "離線"}
                          onClick={() => receive(d)}
                        >
                          <Plus size={14} />
                          接收新事件
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {device && (
        <Modal title={device.name} onClose={() => setSelected(null)}>
          <dl className="detail-list">
            <div>
              <dt>設備編號</dt>
              <dd>{device.id.toUpperCase()}</dd>
            </div>
            <div>
              <dt>設備位置</dt>
              <dd>{device.location}</dd>
            </div>
            <div>
              <dt>感測類型</dt>
              <dd>{sourceMeta[device.source].label}</dd>
            </div>
            <div>
              <dt>狀態 / 電量</dt>
              <dd>
                {device.status} / {device.battery}%
              </dd>
            </div>
            <div>
              <dt>最後事件</dt>
              <dd>{device.lastEvent.replace("T", " ").replaceAll("-", "/")}</dd>
            </div>
          </dl>
          <div className="location-demo">
            <MapPin size={18} />
            <span>設備位置</span>
            <b>{device.location}</b>
          </div>
          <p className="fine-print">
            活動歸屬林沐青／產品設計部，可於個人足跡及企業總覽查看。
          </p>
          <Button
            className="full"
            disabled={device.status === "離線"}
            onClick={() => receive(device)}
          >
            接收新事件
          </Button>
        </Modal>
      )}
    </>
  );
}
