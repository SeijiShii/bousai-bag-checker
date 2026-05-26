import { Package, ClipboardCheck, ShoppingCart, Settings } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/cn';

export const NAV_ITEMS = [
  { key: 'inventory', label: '品目', Icon: Package },
  { key: 'inspection', label: '点検', Icon: ClipboardCheck },
  { key: 'shopping', label: '買い物', Icon: ShoppingCart },
  { key: 'settings', label: '設定', Icon: Settings },
] as const satisfies readonly { key: string; label: string; Icon: ComponentType<{ className?: string }> }[];

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

export interface BottomNavProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}

/** モバイルボトムタブ (品目/点検/買い物/設定)。design-system §5。 */
export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav aria-label="メインナビ" className="flex border-t border-border bg-surface">
      {NAV_ITEMS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          aria-current={active === key ? 'page' : undefined}
          onClick={() => onNavigate(key)}
          className={cn(
            'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-2 text-xs',
            active === key ? 'text-primary' : 'text-text-muted',
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </nav>
  );
}
