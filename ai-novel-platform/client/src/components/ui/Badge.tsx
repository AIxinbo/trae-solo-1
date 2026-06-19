import { cn } from '@/lib/utils';

interface BadgeProps {
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export function Badge({ className, variant = 'default', children }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}