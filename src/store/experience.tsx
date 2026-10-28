import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export const EXPERIENCE_KEY = "eco-sensing-experience-v1";
interface PresentationState {
  tourActive: boolean;
  teamsDeferred: boolean;
}
function initial(): PresentationState {
  try {
    const v = JSON.parse(sessionStorage.getItem(EXPERIENCE_KEY) || "null");
    return {
      tourActive: v?.tourActive === true,
      teamsDeferred: v?.teamsDeferred === true,
    };
  } catch {
    return { tourActive: false, teamsDeferred: false };
  }
}
const ExperienceContext = createContext<{
  presentation: PresentationState;
  setTour: (active: boolean) => void;
  deferTeams: (deferred: boolean) => void;
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
        setTour: (active) =>
          setPresentation((s) => ({ ...s, tourActive: active })),
        deferTeams: (deferred) =>
          setPresentation((s) => ({ ...s, teamsDeferred: deferred })),
        resetVersion,
        resetPresentation: () => {
          setPresentation({ tourActive: false, teamsDeferred: false });
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
