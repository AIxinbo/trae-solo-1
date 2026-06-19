import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-h-[100px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm',
            'placeholder:text-[var(--color-text-placeholder)] resize-y',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
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
Textarea.displayName = 'Textarea';