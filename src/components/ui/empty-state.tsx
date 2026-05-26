import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** 自作 SVG イラスト (line-art、currentColor 追従)。 */
  illustration?: ReactNode;
  message: string;
  action?: ReactNode;
}

/** 空状態 (SVG イラスト + 一言 + 次アクション)。design-system §5。 */
export function EmptyState({ illustration, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center text-text-muted">
      {illustration ? <div className="h-24 w-24 text-primary">{illustration}</div> : null}
      <p className="text-base">{message}</p>
      {action}
    </div>
  );
}
