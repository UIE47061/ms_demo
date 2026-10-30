import { sourceMeta } from "../data/seed";
import type { CarbonEvent } from "../types";
import { dateTime, n } from "../utils/stats";
import { Empty, SourceIcon } from "./ui";
export function EventList({
  events,
  table = false,
}: {
  events: CarbonEvent[];
  table?: boolean;
}) {
  if (!events.length) return <Empty />;
  if (table)
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>事件 / 來源</th>
              <th>部門</th>
              <th>時間</th>
              <th>估算排放</th>
              <th>資料狀態</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className="event-title">
                    <SourceIcon source={e.source} />
                    <div>
                      <b>{e.title}</b>
                      <small>{sourceMeta[e.source].label}</small>
                    </div>
                  </div>
                </td>
                <td>{e.department}</td>
                <td>{dateTime(e.date)}</td>
                <td className="numeric">
                  {n(e.emission, 2)} <small>kg CO₂e</small>
                </td>
                <td>
                  <span className="status neutral">活動紀錄</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <div className="event-list">
      {events.map((e) => (
        <div className="event-row" key={e.id}>
          <SourceIcon source={e.source} />
          <div className="event-info">
            <b>{e.title}</b>
            <small>{dateTime(e.date)}</small>
          </div>
          <div className="event-number">
            {n(e.emission, 2)}
            <small>kg CO₂e</small>
          </div>
        </div>
      ))}
    </div>
  );
}
