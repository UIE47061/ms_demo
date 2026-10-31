export function estimateTravel(distance: number, rate: number) {
  if (
    !Number.isFinite(distance) ||
    distance <= 0 ||
    !Number.isFinite(rate) ||
    rate < 0
  )
    return null;
  const value = Math.round(distance * rate * 100) / 100;
  return Number.isFinite(value) ? value : null;
}
