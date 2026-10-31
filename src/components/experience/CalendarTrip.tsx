import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CALENDAR_TRIP } from "../../data/microsoftDemo";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
export function CalendarTripCard({ compact = false }: { compact?: boolean }) {
  const { state } = useDemo();
  const { presentation, updatePresentation } = useExperience();
  const recorded =
    presentation.tripStatus === "recorded" &&
    state.events.some((e) => e.id === presentation.tripEventId);
  const dismissed = presentation.tripStatus === "dismissed";
  return (
    <section
      className={`calendar-trip ${compact ? "compact" : ""}`}
      aria-label="Outlook 出差待辦"
    >
      <div className="calendar-origin">
        <CalendarDays size={17} />
        <span>Outlook 行事曆</span>
        <small>
          {recorded ? "已登錄" : dismissed ? "非出差行程" : "待補憑證"}
        </small>
      </div>
      <h2>
        {CALENDAR_TRIP.from} → {CALENDAR_TRIP.to}
      </h2>
      <p>
        {CALENDAR_TRIP.date.replaceAll("-", "/")} · {CALENDAR_TRIP.start}–
        {CALENDAR_TRIP.end}
      </p>
      {recorded ? (
        <Link className="text-link" to="/app/footprint?view=records">
          查看差旅紀錄 <ChevronRight size={15} />
        </Link>
      ) : dismissed ? (
        <>
          <p>已移出待辦，不增加碳排或任務進度。</p>
          <button
            className="text-link"
            onClick={() =>
              updatePresentation({ tripStatus: "pending", tripEventId: null })
            }
          >
            恢復出差待辦
          </button>
        </>
      ) : (
        <div className="calendar-actions">
          <Link
            className="btn"
            to={`/app/travel-scan?trip=${CALENDAR_TRIP.id}`}
          >
            登錄車票 <ChevronRight size={15} />
          </Link>
          <button
            className="btn-secondary"
            onClick={() =>
              updatePresentation({ tripStatus: "dismissed", tripEventId: null })
            }
          >
            不是出差
          </button>
        </div>
      )}
      {!compact && (
        <details className="disclosure">
          <summary>行程欄位與資料使用</summary>
          <p>
            只使用時間與地點形成待辦，不讀取主旨、內文或附件。標記「不是出差」只更新工作空間；登錄車票後才新增差旅紀錄。
          </p>
        </details>
      )}
    </section>
  );
}
