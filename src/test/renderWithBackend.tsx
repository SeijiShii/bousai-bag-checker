import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { BackendProvider, makeMemoryBackend, type Backend } from '@/services/backend';

/** テスト用: BackendProvider でラップしてレンダリング。backend 省略時は空の memory backend。 */
export function renderWithBackend(ui: ReactElement, backend: Backend = makeMemoryBackend()): RenderResult {
  return render(<BackendProvider backend={backend}>{ui}</BackendProvider>);
}
