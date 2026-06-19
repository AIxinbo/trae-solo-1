import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  padding?: boolean;
}

export function Card({ className, children, padding = true }: CardProps) {
  return (
    <div className={cn(
      'bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl',
      padding && 'p-6',
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold text-[var(--color-text-primary)]', className)}>{children}</h3>;
}