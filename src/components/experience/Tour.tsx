import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { tourSteps } from "../../data/microsoftDemo";
import { useDemo } from "../../store/demo";
import { useExperience } from "../../store/experience";
export function TourFrame({ children }: { children: ReactNode }) {
  const { presentation, setTour, resetVersion } = useExperience();
  const { notify } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const active =
    presentation.tourActive && !["/guide", "/demo"].includes(location.pathname);
  const step = tourSteps.findIndex((s) => s.path === location.pathname);
  function next() {
    if (step === 3) {
      setTour(false);
      notify("行動旅程已完成，可繼續自由瀏覽");
    } else navigate(tourSteps[Math.max(0, step + 1)].path);
  }
  return (
    <div className={`experience-root ${active ? "tour-on" : ""}`}>
      {active && (
        <aside className="tour-bar" aria-label="行動旅程導覽">
          <Link to="/guide" className="tour-brand">
            行動導覽 <span>{step < 0 ? "自由瀏覽" : `${step + 1} / 4`}</span>
          </Link>
          <nav aria-label="旅程步驟">
            {tourSteps.map((s, i) => (
              <Link
                key={s.path}
                to={s.path}
                className={step === i ? "active" : ""}
                aria-current={step === i ? "step" : undefined}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </Link>
            ))}
          </nav>
          <div className="tour-actions">
            <button
              disabled={step <= 0}
              onClick={() => navigate(tourSteps[step - 1].path)}
              aria-label="上一段"
            >
              <ArrowLeft size={15} />
            </button>
            {step >= 0 && step < 3 && (
              <button className="tour-skip" onClick={next}>
                略過
              </button>
            )}
            <button className="tour-next" onClick={next}>
              {step === 3 ? "完成旅程" : step < 0 ? "回到第一段" : "下一段"}
              <ArrowRight size={14} />
            </button>
            <button onClick={() => setTour(false)} aria-label="退出導覽">
              <X size={16} />
            </button>
          </div>
        </aside>
      )}
      <Fragment key={resetVersion}>{children}</Fragment>
    </div>
  );
}
