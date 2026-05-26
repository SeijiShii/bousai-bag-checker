import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  time,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import {
  itemCategoryEnum,
  freshnessTypeEnum,
  shoppingReasonEnum,
  feedbackTypeEnum,
} from './enums';

// _shared/db: Neon(Postgres) 7 テーブル + 所有者強制(SEC-001、Neon は RLS 非対応→アプリ層 withOwner)。
// plan/tier 区分なし(全機能無料、投げ銭は機能アンロックなし — D-028)。

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const items = pgTable(
  'items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: itemCategoryEnum('category').notNull(),
    quantity: integer('quantity').notNull().default(1),
    storageLocation: text('storage_location'), // 世帯防犯情報、本人限定 (SEC-001/002)
    photoUrl: text('photo_url'), // R2 key
    freshnessType: freshnessTypeEnum('freshness_type').notNull().default('expiry'),
    expiresAt: date('expires_at'), // freshness_type='expiry'
    replaceMonths: integer('replace_months'), // freshness_type='replace_guide'
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('items_user_idx').on(t.userId), index('items_user_expires_idx').on(t.userId, t.expiresAt)],
);

export const notificationSettings = pgTable('notification_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  emailEnabled: boolean('email_enabled').notNull().default(false),
  inappEnabled: boolean('inapp_enabled').notNull().default(true),
  leadDays: integer('lead_days').notNull().default(14),
  quietHoursStart: time('quiet_hours_start'),
  quietHoursEnd: time('quiet_hours_end'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const inspectionLogs = pgTable(
  'inspection_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    inspectedAt: timestamp('inspected_at', { withTimezone: true }).notNull().defaultNow(),
    summary: jsonb('summary').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('inspection_logs_user_idx').on(t.userId)],
);

// 投げ銭記録 (機能アンロックなし、user_id nullable=ゲスト投げ銭可 — D-028)
export const donations = pgTable('donations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  stripePaymentId: text('stripe_payment_id').notNull().unique(), // 冪等性
  amount: integer('amount').notNull().default(100),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 買い物 TODO リスト (無料機能 — D-028)
export const shoppingItems = pgTable(
  'shopping_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').references(() => items.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    reason: shoppingReasonEnum('reason').notNull(),
    isBought: boolean('is_bought').notNull().default(false),
    boughtAt: timestamp('bought_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('shopping_items_user_idx').on(t.userId)],
);

// フィードバック (user_id nullable=ゲスト送信可、payload は PII scrub 済 — SEC-002)
export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  type: feedbackTypeEnum('type').notNull(),
  payload: jsonb('payload').notNull(),
  context: jsonb('context').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
