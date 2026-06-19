import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm',
            'placeholder:text-[var(--color-text-placeholder)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
            'disabled:bg-gray-50 disabled:text-[var(--color-text-secondary)]',
            error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';