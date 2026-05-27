import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    globals: true,
    environment: "node",
    // .tsx (コンポーネント) テストのみ jsdom、.ts (db 等) は node
    environmentMatchGlobs: [["src/**/*.test.tsx", "jsdom"]],
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "api/**/*.test.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 80,
        branches: 70,
      },
    },
  },
});
