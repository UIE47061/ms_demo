import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createSeed, missions } from "../data/seed";
import type { CarbonEvent, DemoState } from "../types";
export const STORAGE_KEY = "eco-sensing-demo-v1";
export function addEvent(state: DemoState, event: CarbonEvent): DemoState {
  if (state.events.some((e) => e.id === event.id)) return state;
  const id =
    event.source === "travel" &&
    /高鐵|臺鐵|台鐵|捷運|公車|火車|大眾運輸/.test(event.title)
      ? "transit"
      : event.source === "waste"
        ? "recycle"
        : undefined;
  return {
    ...state,
    events: [event, ...state.events],
    progress: id
      ? {
          ...state.progress,
          [id]: Math.min(
            (state.progress[id] || 0) + 1,
            missions.find((m) => m.id === id)!.target,
          ),
        }
      : state.progress,
  };
}
export function claimReward(state: DemoState, id: string): DemoState {
  const m = missions.find((m) => m.id === id);
  if (!m || state.claimed.includes(id) || (state.progress[id] || 0) < m.target)
    return state;
  return {
    ...state,
    coins: state.coins + m.coins,
    exp: state.exp + m.exp,
    claimed: [...state.claimed, id],
  };
}
function load(): DemoState {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      s?.version === 1 &&
      Array.isArray(s.events) &&
      s.progress &&
      Array.isArray(s.claimed) &&
      Array.isArray(s.devices) &&
      Array.isArray(s.redemptions) &&
      s.settings &&
      Number.isFinite(s.exp) &&
      Number.isFinite(s.coins)
    )
      return s;
  } catch {
    /* Restore a usable demo if storage is unavailable or invalid. */
  }
  return createSeed();
}
interface Store {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
  notify: (message: string) => void;
  reset: () => void;
}
const Context = createContext<Store | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load);
  const [toast, notify] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      notify("瀏覽器未允許儲存；本次操作仍可使用。");
    }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => notify(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    function sync(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setState(load());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return (
    <Context.Provider
      value={{
        state,
        setState,
        notify,
        reset: () => {
          setState(createSeed());
          notify("工作空間已還原至初始狀態");
        },
      }}
    >
      {children}
      {toast && (
        <div role="status" className="toast">
          ✓ {toast}
        </div>
      )}
    </Context.Provider>
  );
}
export const useDemo = () => {
  const v = useContext(Context);
  if (!v) throw new Error("Missing DemoProvider");
  return v;
};
