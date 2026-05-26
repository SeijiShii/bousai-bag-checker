import { useCallback, useEffect, useRef, useState } from 'react';

export interface BackendData<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
  reload: () => void;
}

/** Backend からの非同期読込 + reload。画面のデータ取得ボイラープレートを共通化。 */
export function useBackendData<T>(loader: () => Promise<T>): BackendData<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(undefined);
    loaderRef.current().then(
      (d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      },
      (e) => {
        if (alive) {
          setError(e);
          setLoading(false);
        }
      },
    );
    return () => {
      alive = false;
    };
  }, [tick]);

  return { data, loading, error, reload };
}
