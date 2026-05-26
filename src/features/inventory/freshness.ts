import type { FreshnessStatus } from "@/lib/tokens";
import type { FreshnessType } from "@/db/enums";

// inventory が単一所有 (spec-review R1)。inspection(期限抽出)/shopping-list(不足抽出)が import。
// 論点-001 案A: expiry(期限)/replace_guide(交換目安)/check_only(内容確認のみ)。

export interface FreshnessInput {
  freshnessType: FreshnessType;
  expiresAt: string | null; // 'YYYY-MM-DD'
  replaceMonths: number | null;
  createdAt: Date;
}

const MS_PER_DAY = 86_400_000;

/** 鮮度の「期限/交換目安」基準日。check_only は null(期限通知対象外)。 */
export function freshnessDueDate(item: FreshnessInput): Date | null {
  if (item.freshnessType === "expiry" && item.expiresAt) {
    return new Date(`${item.expiresAt}T00:00:00`);
  }
  if (item.freshnessType === "replace_guide" && item.replaceMonths) {
    const d = new Date(item.createdAt);
    d.setMonth(d.getMonth() + item.replaceMonths);
    return d;
  }
  return null;
}

/** 鮮度3段階。期限切れ=expired、lead_days 以内=warn、それ以外=fresh。check_only は常に fresh。
 *  カレンダー日(時刻成分を無視)で比較 → 当日期限は時刻/TZ に関わらず warn(本番の時刻依存バグを回避)。 */
export function computeFreshness(
  item: FreshnessInput,
  leadDays: number,
  now: Date = new Date(),
): FreshnessStatus {
  const due = freshnessDueDate(item);
  if (!due) return "fresh";
  const dueDay = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
  const todayDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysLeft = Math.round((dueDay - todayDay) / MS_PER_DAY);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= leadDays) return "warn";
  return "fresh";
}

/** 期限が近い/切れた(warn|expired)か。inspection の期限抽出 / shopping-list の不足抽出で使用。 */
export function isDue(
  item: FreshnessInput,
  leadDays: number,
  now: Date = new Date(),
): boolean {
  const s = computeFreshness(item, leadDays, now);
  return s === "warn" || s === "expired";
}
