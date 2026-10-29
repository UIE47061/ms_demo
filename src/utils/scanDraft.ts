const prefix = "eco-sensing-draft-";
type ScanDraftName = "travel" | "recycle";
export function readDraft<T>(name: ScanDraftName): T | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(prefix + name) || "null");
    if (!value || typeof value.id !== "string") return null;
    if (name === "travel") {
      const field = value.field;
      if (
        !field ||
        ![0, 1].includes(value.step) ||
        !["date", "transport", "from", "to"].every(
          (key) => typeof field[key] === "string",
        ) ||
        !["fare", "distance", "emission"].every((key) =>
          Number.isFinite(field[key]),
        )
      )
        return null;
    } else if (
      !Number.isInteger(value.stage) ||
      value.stage < -1 ||
      value.stage > 4
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function saveDraft(name: ScanDraftName, value: unknown) {
  try {
    sessionStorage.setItem(prefix + name, JSON.stringify(value));
  } catch {
    /* The current form remains usable. */
  }
}
export function removeDraft(name: ScanDraftName) {
  try {
    sessionStorage.removeItem(prefix + name);
  } catch {
    /* Storage is optional. */
  }
}
export function clearScanDrafts() {
  removeDraft("travel");
  removeDraft("recycle");
}
