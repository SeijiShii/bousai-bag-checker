import { clsx, type ClassValue } from 'clsx';

/** クラス名合成ユーティリティ。 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
