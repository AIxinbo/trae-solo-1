'use client';
import { ToastProvider } from '@/components/ui/Toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loadFromStorage } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setReady(true);
  }, [loadFromStorage]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthGuard>{children}</AuthGuard>
    </ToastProvider>
  );
}