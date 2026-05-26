import { useState, type ComponentType } from 'react';
import { BottomNav, type NavKey } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
import { AppHeader } from './AppHeader';
import { LegalView } from './LegalView';
import { InventoryScreen } from './screens/InventoryScreen';
import { InspectionScreen } from './screens/InspectionScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const SCREENS: Record<NavKey, ComponentType> = {
  inventory: InventoryScreen,
  inspection: InspectionScreen,
  shopping: ShoppingScreen,
  settings: SettingsScreen,
};

/**
 * アプリシェル。モバイル PWA のボトムタブ (品目/点検/買い物/設定) で画面を切り替える。
 * /legal/* パスは法務ページを表示 (path ベースの最小ルーティング、react-router 不使用)。
 */
export function App() {
  const [active, setActive] = useState<NavKey>('inventory');
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (path.startsWith('/legal/')) {
    return <LegalView path={path} />;
  }

  const Screen = SCREENS[active];
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4">
        <Screen />
      </main>
      <BottomNav active={active} onNavigate={setActive} />
      <Footer />
    </div>
  );
}
