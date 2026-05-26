import { defineConfig } from "drizzle-kit";

// schema は src/db/schema.ts、出力は drizzle/。dialect=postgresql (Neon)。
// DATABASE_URL はサーバー専用 env (VITE_ プレフィックス禁止、SEC-005)。
export default defineConfig({
  schema: ["./src/db/schema.ts", "./src/db/enums.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/placeholder",
  },
});
