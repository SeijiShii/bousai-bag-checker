import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

// DB クライアント (Neon serverless)。injectable: テストは pglite を注入 (createDb は使わず drizzle/pglite)。
// DATABASE_URL はサーバー専用 (VITE_ プレフィックス禁止、SEC-005)。
export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

let cached: ReturnType<typeof createDb> | undefined;

/** サーバー(Vercel Functions)側でのみ呼ぶ。クライアントバンドルに含めない。 */
export function getDb() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set (server-only env)');
    cached = createDb(url);
  }
  return cached;
}
