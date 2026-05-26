import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** ラベル常時表示 + エラー表示 (expired 色、点滅させない)。design-system §5 / O38。 */
export function Field({ label, error, id, className, ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm text-text">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-[44px] rounded-md border bg-surface px-3 text-base',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          error ? 'border-expired' : 'border-border',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-expired">
          {error}
        </p>
      ) : null}
    </div>
  );
}
