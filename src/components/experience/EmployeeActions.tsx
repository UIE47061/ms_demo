import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { missions } from "../../data/seed";
import { claimReward, useDemo } from "../../store/demo";
import { Button, Modal } from "../ui";

export const taskNames: Record<string, string> = {
  transit: "登錄一次大眾運輸差旅",
  recycle: "完成一次分類回收",
  print: "使用雙面列印",
  power: "離座關閉螢幕",
  cloud: "清理雲端檔案",
  stairs: "走樓梯三次",
};
export function taskRoute(id: string) {
  return id === "transit"
    ? "/app/travel-scan"
    : id === "recycle"
      ? "/app/trash-scan"
      : id === "power"
        ? "/app/assistant"
        : "/app/missions";
}
export function InlineReward({ id }: { id: string }) {
  const { state, setState, notify } = useDemo();
  const m = missions.find((m) => m.id === id)!;
  const claimed = state.claimed.includes(id);
  if (!claimed && (state.progress[id] || 0) < m.target) return null;
  return (
    <div className="inline-reward" aria-live="polite">
      <span>{claimed ? "獎勵已入帳" : `任務完成，可領取 ${m.coins} 碳幣`}</span>
      <Button
        className="full"
        disabled={claimed}
        onClick={() => {
          setState((s) => claimReward(s, id));
          notify("獎勵已入帳");
        }}
      >
        {claimed ? (
          <>
            <Check size={16} />
            本任務獎勵已領取
          </>
        ) : (
          `領取 ${m.coins} 碳幣`
        )}
      </Button>
    </div>
  );
}
export function ScanExit({
  dirty,
  save,
  discard,
}: {
  dirty: boolean;
  save: () => void;
  discard: () => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="scan-close"
        onClick={() => (dirty ? setOpen(true) : navigate("/app/home"))}
        aria-label="關閉登錄"
      >
        <X size={18} />
        關閉
      </button>
      {open && (
        <Modal title="稍後再完成？" onClose={() => setOpen(false)}>
          <p>可保留本分頁的未提交資料；圖片預覽不會儲存。</p>
          <Button
            className="full"
            onClick={() => {
              save();
              navigate("/app/home");
            }}
          >
            保留並離開
          </Button>
          <Button
            secondary
            className="full"
            onClick={() => {
              discard();
              navigate("/app/home");
            }}
          >
            放棄並離開
          </Button>
          <button className="text-link" onClick={() => setOpen(false)}>
            繼續操作
          </button>
        </Modal>
      )}
    </>
  );
}
export function TaskLinks() {
  return (
    <div className="task-links">
      <Link to="/app/leaderboard">查看排行榜 →</Link>
      <Link to="/app/profile">成長與成就 →</Link>
    </div>
  );
}
