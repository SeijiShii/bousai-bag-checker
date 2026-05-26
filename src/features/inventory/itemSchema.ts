import { z } from 'zod';
import { ITEM_CATEGORIES, FRESHNESS_TYPES } from '@/db/enums';

// SEC-003/論点-006: API + フォーム単一ソースの Zod スキーマ。enum は db/enums.ts 由来(二重定義回避、spec-review R2)。
export const itemInputSchema = z
  .object({
    name: z.string().min(1, '品目名を入力してください').max(200),
    category: z.enum(ITEM_CATEGORIES),
    quantity: z.number().int().min(0, '数量を確認してください').default(1),
    storageLocation: z.string().max(200).optional(),
    freshnessType: z.enum(FRESHNESS_TYPES).default('expiry'),
    expiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日付を確認してください')
      .nullish(),
    replaceMonths: z.number().int().min(1).nullish(),
    note: z.string().max(500).optional(),
  })
  .refine((v) => v.freshnessType !== 'expiry' || !!v.expiresAt, {
    message: '期限を入力してください',
    path: ['expiresAt'],
  })
  .refine((v) => v.freshnessType !== 'replace_guide' || !!v.replaceMonths, {
    message: '交換の目安(月)を入力してください',
    path: ['replaceMonths'],
  });

export type ItemInput = z.infer<typeof itemInputSchema>;
