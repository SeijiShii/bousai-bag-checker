import { isDue } from '@/features/inventory'; // spec-review R1: freshness は inventory 単一所有を import
import type { Item } from '@/types/db';

/** lead_days 以内に期限/交換目安が来る(or 切れた)items を抽出。check_only は除外(isDue=false)。 */
export function getDueItems(items: Item[], leadDays: number, now: Date = new Date()): Item[] {
  return items.filter((i) => isDue(i, leadDays, now));
}
