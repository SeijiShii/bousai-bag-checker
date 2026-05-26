import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** カード (surface + shadow + radius-lg + padding)。design-system §5。 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg bg-surface p-5 shadow-[0_1px_2px_rgba(42,47,44,.06)]', className)}
      {...props}
    />
  );
}
