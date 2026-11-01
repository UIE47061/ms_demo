import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { departments } from "../data/seed";
export function useAnalysisFilters() {
  const [params, setParams] = useSearchParams();
  // Router navigation can finish after the next input event. Merge rapid
  // changes against the latest requested query instead of a stale render.
  const search = params.toString();
  const seenSearch = useRef(search);
  const pendingParams = useRef(params);
  if (seenSearch.current !== search) {
    seenSearch.current = search;
    pendingParams.current = params;
  }
  const selected = params.get("dept");
  const dept = departments.includes(selected as (typeof departments)[number])
    ? selected!
    : "全部部門";
  const period = params.get("period") === "week" ? "week" : "month";
  function setParam(name: string, value: string) {
    const next = new URLSearchParams(pendingParams.current);
    next.set(name, value);
    pendingParams.current = next;
    setParams(next, { replace: true });
  }
  const query = new URLSearchParams({ dept, period }).toString();
  return {
    dept,
    period,
    setDept: (value: string) => setParam("dept", value),
    setPeriod: (value: string) => setParam("period", value),
    params,
    setParam,
    query,
    scope: `${dept} · ${period === "week" ? "2026/10/24–10/27" : "2026/10/01–10/27"}`,
  };
}
