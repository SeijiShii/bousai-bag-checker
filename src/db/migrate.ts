import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { getDb } from './client';

/** drizzle/ の生成 SQL を Neon に適用。ローカル/CI dev ブランチ=Class A、本番 apply は /flow:release (Class B)。 */
export async function runMigrations() {
  await migrate(getDb(), { migrationsFolder: './drizzle' });
}

// `npm run db:migrate` (tsx src/db/migrate.ts) の CLI エントリ。
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('migrations applied');
      process.exit(0);
    })
    .catch((err) => {
      // PII を含めない (SEC-002)
      console.error('migration failed:', err instanceof Error ? err.message : 'unknown error');
      process.exit(1);
    });
}
