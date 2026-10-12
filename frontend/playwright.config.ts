import { defineConfig } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
const envFile = new URL("../.env", import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index > 0)
      process.env[line.slice(0, index).trim()] ??= line.slice(index + 1).trim();
  }
}
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 20000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    headless: true,
    screenshot: "only-on-failure",
    launchOptions: {
      args: process.env.E2E_CHROMIUM_ARGS?.split(/\s+/).filter(Boolean),
      ...(process.env.E2E_CHROMIUM_PATH
        ? { executablePath: process.env.E2E_CHROMIUM_PATH }
        : {}),
    },
  },
  reporter: [["list"]],
});
