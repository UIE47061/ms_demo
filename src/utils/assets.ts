/** Public files must follow Vite's base path on repository-based hosting. */
export function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
