import { pgEnum } from 'drizzle-orm/pg-core';

// enum 値の単一定義 (DB enum + アプリ層 Zod で共有、spec-review R2)。
export const ITEM_CATEGORIES = ['water', 'food', 'battery', 'medicine', 'document', 'other'] as const;
export const FRESHNESS_TYPES = ['expiry', 'replace_guide', 'check_only'] as const; // 論点-001 案A
export const SHOPPING_REASONS = ['expired', 'insufficient', 'manual'] as const;
export const FEEDBACK_TYPES = ['reaction', 'bug'] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
export type FreshnessType = (typeof FRESHNESS_TYPES)[number];
export type ShoppingReason = (typeof SHOPPING_REASONS)[number];
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const itemCategoryEnum = pgEnum('item_category', ITEM_CATEGORIES);
export const freshnessTypeEnum = pgEnum('freshness_type', FRESHNESS_TYPES);
export const shoppingReasonEnum = pgEnum('shopping_reason', SHOPPING_REASONS);
export const feedbackTypeEnum = pgEnum('feedback_type', FEEDBACK_TYPES);
