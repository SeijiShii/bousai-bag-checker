import { createContext, useContext, type ReactNode } from 'react';
import type { Backend } from './port';

const BackendContext = createContext<Backend | null>(null);

export interface BackendProviderProps {
  backend: Backend;
  children: ReactNode;
}

/** Backend 実装 (memory / http) を画面ツリーに注入する。 */
export function BackendProvider({ backend, children }: BackendProviderProps) {
  return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
}

/** 現在の Backend を取得 (Provider 必須)。 */
export function useBackend(): Backend {
  const backend = useContext(BackendContext);
  if (!backend) {
    throw new Error('useBackend は BackendProvider の内側で使用してください');
  }
  return backend;
}
