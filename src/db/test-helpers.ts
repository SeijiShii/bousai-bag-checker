import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

/** in-memory Postgres(pglite)に生成済みマイグレーション SQL を適用したテスト用 db。no-key・Class A。 */
export async function makeTestDb() {
  const pg = new PGlite();
  const dir = join(process.cwd(), 'drizzle');
  const sqlFile = readdirSync(dir).find((f) => f.endsWith('.sql'));
  if (!sqlFile) throw new Error('migration SQL が未生成です (npm run db:generate)');
  const sql = readFileSync(join(dir, sqlFile), 'utf8').replace(/-->\s*statement-breakpoint/g, '');
  await pg.exec(sql);
  return drizzle(pg, { schema });
}
