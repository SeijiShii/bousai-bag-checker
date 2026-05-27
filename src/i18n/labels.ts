import type { TFunction } from 'i18next';
import type { ItemCategory, FreshnessType, ShoppingReason } from '@/db/enums';

// enum 値はそのまま i18n キーの suffix に対応 (category.water / freshness.expiry 等)。
// これにより ItemForm の <option> が enum 生値 (water/food) でなくロケールラベルを表示する (spec-review)。

export function categoryLabel(c: ItemCategory, t: TFunction): string {
  return t(`category.${c}`);
}

export function freshnessLabel(f: FreshnessType, t: TFunction): string {
  return t(`freshness.${f}`);
}

const SHOPPING_REASON_KEY: Record<ShoppingReason, string> = {
  expired: 'status.expired',
  insufficient: 'inventory.form.quantity',
  manual: 'common.add',
};

/** 買い物理由ラベル (任意表示用、最小マップ)。 */
export function shoppingReasonKey(r: ShoppingReason): string {
  return SHOPPING_REASON_KEY[r];
}
