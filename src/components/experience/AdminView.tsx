import type { ReactNode } from "react";
import { useExperience } from "../../store/experience";
export function AdminOnly({ children }: { children: ReactNode }) {
  const { presentation, updatePresentation } = useExperience();
  if (presentation.adminView === "administrator") return <>{children}</>;
  return (
    <section className="view-boundary">
      <span className="service-kicker">管理工作空間</span>
      <h1>切換管理員視角</h1>
      <p>主管以部門彙總掌握成果；設備設定與個人申請明細由管理員檢視。</p>
      <button
        className="btn"
        onClick={() => updatePresentation({ adminView: "administrator" })}
      >
        切換為管理員
      </button>
    </section>
  );
}
