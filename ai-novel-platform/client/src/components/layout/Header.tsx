'use client';
import { useAuthStore } from '@/lib/stores/auth-store';

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-[var(--color-card)] border-b border-[var(--color-border)]">
      <div />
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-sm font-medium text-[var(--color-primary)]">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  );
}