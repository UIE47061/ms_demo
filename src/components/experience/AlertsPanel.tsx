import { Link } from "react-router-dom";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
import { workspaceAlerts } from "../../utils/insights";
import type { CarbonEvent } from "../../types";
export function AlertsPanel({
  events,
  dept,
  period,
}: {
  events: CarbonEvent[];
  dept: string;
  period: string;
}) {
  const { state } = useDemo();
  const { presentation } = useExperience();
  const alerts = workspaceAlerts(state.devices, events, `${dept}:${period}`);
  const query = new URLSearchParams({ dept, period });
  return (
    <section className="insight-alerts">
      <div>
        <span className="service-kicker gold">FABRIC · 異常與觀察</span>
        <h2>需要追蹤的項目</h2>
      </div>
      <div>
        {alerts.map((a) => (
          <Link
            key={a.id}
            to={`/admin/alerts?${query}&id=${encodeURIComponent(a.id)}`}
          >
            <span>
              <b>{a.title}</b>
              <small>{a.detail}</small>
            </span>
            <strong>
              {presentation.resolvedAlerts.includes(a.id) ? "已處理" : a.value}
              <span> →</span>
            </strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
