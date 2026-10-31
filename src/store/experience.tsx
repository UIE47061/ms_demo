import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearScanDrafts } from "../utils/scanDraft";
export const EXPERIENCE_KEY = "eco-sensing-experience-v1";
export interface PresentationState {
  tourActive: boolean;
  teamsDeferred: boolean;
  tripStatus: "pending" | "dismissed" | "recorded";
  tripEventId: string | null;
  adminView: "manager" | "administrator";
  resolvedAlerts: string[];
  notificationChannel: "email" | "teams" | "none";
}
function defaults(): PresentationState {
  return {
    tourActive: false,
    teamsDeferred: false,
    tripStatus: "pending",
    tripEventId: null,
    adminView: "manager",
    resolvedAlerts: [],
    notificationChannel: "email",
  };
}
function initial(): PresentationState {
  try {
    const v = JSON.parse(sessionStorage.getItem(EXPERIENCE_KEY) || "null");
    return {
      tourActive: v?.tourActive === true,
      teamsDeferred: v?.teamsDeferred === true,
      tripStatus: ["dismissed", "recorded"].includes(v?.tripStatus)
        ? v.tripStatus
        : "pending",
      tripEventId: typeof v?.tripEventId === "string" ? v.tripEventId : null,
      adminView: v?.adminView === "administrator" ? "administrator" : "manager",
      resolvedAlerts: Array.isArray(v?.resolvedAlerts)
        ? v.resolvedAlerts.filter((id: unknown) => typeof id === "string")
        : [],
      notificationChannel: ["teams", "none"].includes(v?.notificationChannel)
        ? v.notificationChannel
        : "email",
    };
  } catch {
    return defaults();
  }
}
const ExperienceContext = createContext<{
  presentation: PresentationState;
  setTour: (active: boolean) => void;
  updatePresentation: (changes: Partial<PresentationState>) => void;
  deferAgent: (deferred: boolean) => void;
  resetVersion: number;
  resetPresentation: () => void;
} | null>(null);
export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [presentation, setPresentation] = useState(initial);
  const [resetVersion, setResetVersion] = useState(0);
  useEffect(() => {
    try {
      sessionStorage.setItem(EXPERIENCE_KEY, JSON.stringify(presentation));
    } catch {
      /* Presentation still works for the current session. */
    }
  }, [presentation]);
  return (
    <ExperienceContext.Provider
      value={{
        presentation,
        updatePresentation: (changes) =>
          setPresentation((s) => ({ ...s, ...changes })),
        setTour: (active) =>
          setPresentation((s) => ({ ...s, tourActive: active })),
        deferAgent: (deferred) =>
          setPresentation((s) => ({ ...s, teamsDeferred: deferred })),
        resetVersion,
        resetPresentation: () => {
          clearScanDrafts();
          setPresentation(defaults());
          setResetVersion((v) => v + 1);
        },
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}
export function useExperience() {
  const c = useContext(ExperienceContext);
  if (!c) throw Error("Missing ExperienceProvider");
  return c;
}
