import type {
  users,
  items,
  notificationSettings,
  inspectionLogs,
  donations,
  shoppingItems,
  feedback,
} from '@/db/schema';

// Drizzle 推論による Select/Insert 型の再エクスポート (機能側が import)。
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type NewNotificationSetting = typeof notificationSettings.$inferInsert;
export type InspectionLog = typeof inspectionLogs.$inferSelect;
export type NewInspectionLog = typeof inspectionLogs.$inferInsert;
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type NewShoppingItem = typeof shoppingItems.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
