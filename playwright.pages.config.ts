import { defineConfig } from "@playwright/test";
import config from "./playwright.config";
const basePath = process.env.PAGES_BASE_PATH || "/eco-sensing/";
const baseURL = `http://127.0.0.1:4175${basePath}`;

export default defineConfig({
  ...config,
  outputDir: "test-results/pages",
  testIgnore: [],
  testMatch: "**/pages.spec.ts",
  use: { ...config.use, baseURL },
  webServer: {
    command: `npm run preview -- --port 4175 --base ${basePath}`,
    url: baseURL,
    reuseExistingServer: false,
  },
  timeout: 60000,
});
