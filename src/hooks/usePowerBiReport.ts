import { useSyncExternalStore } from "react";
import { validatePowerBiReportUrl } from "../utils/biExport";
export const REPORT_LINK_KEY = "eco-sensing-powerbi-report-url-v1";
const changed = "eco-sensing-report-change";
function read() {
  try {
    return (
      validatePowerBiReportUrl(localStorage.getItem(REPORT_LINK_KEY) || "") ||
      ""
    );
  } catch {
    return "";
  }
}
function subscribe(listener: () => void) {
  window.addEventListener(changed, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(changed, listener);
    window.removeEventListener("storage", listener);
  };
}
export function usePowerBiReport() {
  const reportUrl = useSyncExternalStore(subscribe, read, () => "");
  function saveReport(value: string) {
    const clean = validatePowerBiReportUrl(value);
    if (!clean) return false;
    try {
      localStorage.setItem(REPORT_LINK_KEY, clean);
      window.dispatchEvent(new Event(changed));
      return true;
    } catch {
      return false;
    }
  }
  function clearReport() {
    try {
      localStorage.removeItem(REPORT_LINK_KEY);
      window.dispatchEvent(new Event(changed));
      return true;
    } catch {
      return false;
    }
  }
  return { reportUrl, saveReport, clearReport };
}
