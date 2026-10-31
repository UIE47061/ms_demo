import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CalendarTripCard } from "../../components/experience/CalendarTrip";
export function Trips() {
  return (
    <>
      <Link className="back-link" to="/app/home">
        <ArrowLeft size={15} />
        返回首頁
      </Link>
      <div className="page-title">
        <span className="service-kicker azure">OUTLOOK · MICROSOFT GRAPH</span>
        <h1>出差待辦</h1>
        <p>確認行程，回程後補上車票。</p>
      </div>
      <CalendarTripCard />
      <Link className="text-link" to="/app/travel-scan">
        登錄其他旅程 →
      </Link>
    </>
  );
}
