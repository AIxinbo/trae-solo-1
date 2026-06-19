import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className, size = 'md', showLabel = false }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5' };

  return (
    <div className="w-full">
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', heights[size], className)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', pct >= 100 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-primary)]')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{Math.round(pct)}%</p>}
    </div>
  );
}