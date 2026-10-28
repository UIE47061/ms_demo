import {
  ArrowDownRight,
  ArrowUpRight,
  Layers3,
  Leaf,
  Monitor,
  RotateCcw,
  TrainFront,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { useDemo } from "../store/demo";
import { useExperience } from "../store/experience";
import type { Source } from "../types";
export const icons = {
  waste: Trash2,
  travel: TrainFront,
  elevator: Layers3,
  digital: Monitor,
};
export function SourceIcon({ source }: { source: Source }) {
  const Icon = icons[source];
  return (
    <span className={`source-icon ${source}`}>
      <Icon size={19} />
    </span>
  );
}
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "light" : ""}`}>
      <span className="brand-icon">
        <Leaf size={23} />
      </span>
      <span>Eco-Sensing</span>
    </div>
  );
}
export function SkipLink({ target }: { target: string }) {
  return (
    <a
      className="skip-link"
      href={`#${target}`}
      onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById(target);
        main?.focus({ preventScroll: true });
        main?.scrollIntoView({ block: "start" });
      }}
    >
      跳至主要內容
    </a>
  );
}
export function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${secondary ? "btn-secondary" : "btn"} ${className}`}
    >
      {children}
    </button>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}
export function SectionHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Metric({
  label,
  value,
  unit,
  change,
}: {
  label: string;
  value: string;
  unit?: string;
  change?: string;
  icon?: ReactNode;
}) {
  return (
    <section className="metric" aria-label={label}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      {change && <div className="metric-change">{change}</div>}
    </section>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="section-head">
        <h2 id={titleId}>{title}</h2>
        <button
          autoFocus
          aria-label="關閉對話框"
          className="icon-btn"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function ResetButton({ compact = false }: { compact?: boolean }) {
  const { reset } = useDemo();
  const { resetPresentation } = useExperience();
  return (
    <button
      className="reset-btn"
      onClick={() => {
        if (
          window.confirm(
            "確定重設工作空間？新增事件、任務獎勵與審核狀態將還原。",
          )
        ) {
          reset();
          resetPresentation();
        }
      }}
    >
      <RotateCcw size={15} />
      {compact ? "重設資料" : "重設工作空間資料"}
    </button>
  );
}
export function TrendIndicator({ value }: { value: number }) {
  return (
    <span className={value <= 0 ? "positive" : "muted"}>
      {value <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{" "}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}
export function Empty({
  text = "此篩選條件下沒有活動紀錄。",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <Leaf size={28} />
      <p>{text}</p>
    </div>
  );
}
