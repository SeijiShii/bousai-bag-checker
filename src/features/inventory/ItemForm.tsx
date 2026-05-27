import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ITEM_CATEGORIES, FRESHNESS_TYPES } from '@/db/enums';
import { categoryLabel, freshnessLabel } from '@/i18n';
import { itemInputSchema, type ItemInput } from './itemSchema';

export interface ItemFormProps {
  onSubmit: (input: ItemInput) => void;
}

/** 品目登録/編集フォーム。freshness_type で動的に期限/交換目安入力を出し分け。Zod 検証(SEC-003)。 */
export function ItemForm({ onSubmit }: ItemFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<(typeof ITEM_CATEGORIES)[number]>('water');
  const [freshnessType, setFreshnessType] = useState<(typeof FRESHNESS_TYPES)[number]>('expiry');
  const [expiresAt, setExpiresAt] = useState('');
  const [replaceMonths, setReplaceMonths] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = itemInputSchema.safeParse({
      name,
      category,
      freshnessType,
      expiresAt: freshnessType === 'expiry' ? expiresAt || undefined : undefined,
      replaceMonths: freshnessType === 'replace_guide' && replaceMonths ? Number(replaceMonths) : undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  // Zod の message は i18n キー (spec-review R3)。表示時に t() で翻訳。
  const err = (k: string) => (errors[k] ? t(errors[k]) : undefined);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field label={t('inventory.form.name')} value={name} onChange={(e) => setName(e.target.value)} error={err('name')} />
      <label className="text-sm text-text">
        {t('inventory.form.category')}
        <select
          aria-label={t('inventory.form.category')}
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className="mt-1 block min-h-[44px] rounded-md border border-border bg-surface px-3"
        >
          {ITEM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c, t)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-text">
        {t('inventory.form.freshnessType')}
        <select
          aria-label={t('inventory.form.freshnessType')}
          value={freshnessType}
          onChange={(e) => setFreshnessType(e.target.value as typeof freshnessType)}
          className="mt-1 block min-h-[44px] rounded-md border border-border bg-surface px-3"
        >
          {FRESHNESS_TYPES.map((f) => (
            <option key={f} value={f}>
              {freshnessLabel(f, t)}
            </option>
          ))}
        </select>
      </label>
      {freshnessType === 'expiry' ? (
        <Field label={t('inventory.form.expiresAt')} type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} error={err('expiresAt')} />
      ) : null}
      {freshnessType === 'replace_guide' ? (
        <Field
          label={t('inventory.form.replaceMonths')}
          type="number"
          value={replaceMonths}
          onChange={(e) => setReplaceMonths(e.target.value)}
          error={err('replaceMonths')}
        />
      ) : null}
      <Button type="submit">{t('common.save')}</Button>
    </form>
  );
}
