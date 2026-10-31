import {
  Activity,
  ArrowLeftRight,
  Bell,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  FileChartColumn,
  Gift,
  House,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Network,
  Play,
  Radio,
  Target,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useExperience } from "../store/experience";
import { AdminOnly } from "../components/experience/AdminView";
import { Brand, Modal, ResetButton, SkipLink } from "../components/ui";
const adminLinks = [
  ["dashboard", "企業總覽", LayoutDashboard],
  ["analytics", "主管洞察", ChartNoAxesCombined],
  ["people", "員工與部門", Users],
  ["alerts", "異常追蹤", Bell],
  ["devices", "IoT 設備", Radio],
  ["reports", "ESG 報告", FileChartColumn],
  ["rewards", "獎勵管理", Gift],
  ["integrations", "Microsoft 流程", Network],
] as const;
const appLinks = [
  ["home", "首頁", House],
  ["footprint", "碳足跡", Activity],
  ["missions", "任務", Target],
  ["profile", "我的", UserRound],
] as const;
function useRouteReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
export function AdminLayout() {
  const { presentation, updatePresentation } = useExperience();
  const administrator = presentation.adminView === "administrator";
  const location = useLocation();
  const [help, setHelp] = useState(false);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  useRouteReset();
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menu) return;
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const elements = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          "a[href],button:not(:disabled)",
        ) || [],
      );
    elements()[1]?.focus();
    function keydown(e: KeyboardEvent) {
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "Escape") {
        setMenu(false);
        return;
      }
      if (e.key === "Tab") {
        const list = elements();
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [menu]);
  const title =
    adminLinks.find(([path]) => location.pathname.endsWith(path))?.[1] ||
    "企業總覽";
  useEffect(() => setMenu(false), [location.pathname]);
  return (
    <div className={`admin-shell ${menu ? "menu-open" : ""}`}>
      <SkipLink target="main-content" />
      <aside
        className="sidebar"
        ref={sidebarRef}
        role={menu ? "dialog" : undefined}
        aria-modal={menu ? true : undefined}
        aria-label={menu ? "企業端導覽選單" : undefined}
      >
        <div className="sidebar-brand">
          <Link to="/" aria-label="返回角色入口">
            <Brand />
          </Link>
          <button
            className="icon-btn close-menu"
            aria-label="關閉導覽"
            onClick={() => setMenu(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace">
          <div className="workspace-icon">青</div>
          <div>
            <b>青禾科技</b>
            <small>企業永續工作空間</small>
          </div>
        </div>
        <div className="nav-label">工作空間</div>
        <nav aria-label="企業端導覽">
          {adminLinks.map(([path, label, Icon]) => (
            <NavLink key={path} to={`/admin/${path}`}>
              <Icon size={17} />
              <span>
                {path === "people" && !administrator ? "部門參與" : label}
              </span>
              {path === "devices" && <span className="nav-count">8</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link className="switch-link" to="/guide">
            <Play size={16} />
            行動旅程導覽
          </Link>
          <button className="sidebar-help" onClick={() => setHelp(true)}>
            <CircleHelp size={16} />
            使用說明
          </button>
          <Link className="switch-link" to="/app/home">
            <ArrowLeftRight size={16} />
            切換至員工端
          </Link>
          <ResetButton compact />
          <div className="sidebar-account">
            <span className="avatar small">沐</span>
            <div>
              <b>{administrator ? "系統管理員" : "部門主管"}</b>
              <small>
                {administrator ? "管理個人明細與設定" : "部門彙總視角"}
              </small>
            </div>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="sidebar-scrim"
          aria-label="關閉導覽選單"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="admin-body">
        <header className="admin-toolbar">
          <div className="toolbar-leading">
            <button
              className="icon-btn mobile-menu"
              aria-label="開啟企業導覽"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <Menu size={19} />
            </button>
            <div className="breadcrumb">
              <span>青禾科技</span>
              <ChevronRight size={13} />
              <strong>{title}</strong>
            </div>
          </div>
          <div className="toolbar-right">
            <select
              className="view-select"
              aria-label="檢視身分"
              value={presentation.adminView}
              onChange={(e) =>
                updatePresentation({
                  adminView: e.target.value as "manager" | "administrator",
                })
              }
            >
              <option value="manager">主管 · 部門彙總</option>
              <option value="administrator">管理員 · 完整明細</option>
            </select>

            <button
              className="icon-btn notification"
              aria-label="查看通知"
              onClick={() => setBell(true)}
            >
              <Bell size={18} />
              <i />
            </button>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className={`admin-main ${location.pathname.endsWith("reports") ? "reports-main" : ""}`}
          key={`${location.pathname}:${presentation.adminView}`}
        >
          {["/admin/devices", "/admin/rewards"].includes(location.pathname) ? (
            <AdminOnly>
              <Outlet />
            </AdminOnly>
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="admin-footer">
          <span>Eco-Sensing</span>
          <span>基準日 2026/10/27</span>
        </footer>
      </div>
      {help && (
        <Modal title="關於工作空間" onClose={() => setHelp(false)}>
          <p>
            青禾科技股份有限公司為虛構公司。資料儲存於目前瀏覽器，呈現員工行為碳足跡、IoT
            流程、減碳任務及企業 ESG 管理。
          </p>
          <p>「檢視身分」用於切換畫面內容，不提供帳號登入或資料存取授權。</p>
          <p>
            歷史 5–9 月為獨立彙總資料，10
            月由活動紀錄加總。裝置與雲端服務的操作只更新此工作空間，不會控制設備或傳送訊息。
          </p>
        </Modal>
      )}
      {bell && (
        <Modal title="通知中心" onClose={() => setBell(false)}>
          <div className="notice amber">
            智慧垃圾桶 03 電量偏低（18%），建議安排巡檢。
          </div>
          <div className="notice">
            數位 Eco-Agent 2 目前離線，資料來自工作空間。
          </div>
          <p className="muted">2026/10/27 · 設備通知</p>
        </Modal>
      )}
    </div>
  );
}
export function EmployeeLayout() {
  const location = useLocation();
  const focused = /\/(travel-scan|trash-scan)$/.test(location.pathname);
  useEffect(() => {
    const theme = document.querySelector('meta[name="theme-color"]');
    const previous = theme?.getAttribute("content");
    theme?.setAttribute("content", "#fcfdf9");
    return () => {
      if (previous) theme?.setAttribute("content", previous);
    };
  }, []);
  useRouteReset();
  return (
    <div
      className={`employee-backdrop employee-ux ${focused ? "scan-focused" : ""}`}
    >
      <SkipLink target="employee-content" />
      <aside className="employee-desktop-note">
        <Link to="/">
          <Brand />
        </Link>
        <div className="employee-context">
          <span className="nav-label">員工工作空間</span>
          <b>青禾科技股份有限公司</b>
          <p>林沐青 · 產品設計部</p>
        </div>
        <Link to="/guide" className="switch-link">
          <Play size={16} />
          行動旅程導覽
        </Link>
        <Link to="/app/assistant" className="switch-link">
          <MessageSquare size={16} />
          Eco 小幫手
        </Link>
        <Link to="/admin/dashboard" className="switch-link">
          <ArrowLeftRight size={16} />
          切換至企業端
        </Link>
        <Link to="/" className="text-link">
          返回角色入口 <ChevronRight size={13} />
        </Link>
        <p className="desktop-demo-note">資料基準日 2026/10/27</p>
      </aside>
      <div className="phone-shell">
        <header className="employee-header">
          <Link to="/" aria-label="返回角色入口">
            <Brand />
          </Link>
        </header>
        <main
          id="employee-content"
          tabIndex={-1}
          className="employee-main"
          key={location.pathname}
        >
          <Outlet />
        </main>
        {!focused && (
          <nav className="bottom-nav" aria-label="員工端導覽">
            {appLinks.map(([path, label, Icon]) => (
              <NavLink
                key={path}
                to={`/app/${path}`}
                className={
                  path === "missions" &&
                  location.pathname.endsWith("leaderboard")
                    ? "active"
                    : undefined
                }
              >
                <Icon size={21} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
